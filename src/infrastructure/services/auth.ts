import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import * as bcrypt from "bcryptjs";
import { and, eq, gt, lt } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import { AuthConfig } from "../config";
import type { NewSession, NewUser, Session, User } from "../db";
import { sessions, users } from "../db";
import { DatabaseError } from "../errors";
import {
	InvalidCredentialsError,
	SessionExpiredError,
	SignupError,
	TokenError,
} from "../errors/auth";
import { generateToken } from "@/utils/crypto";

export interface IAuthService {
	readonly signup: (
		email: string,
		password: string,
	) => Effect.Effect<User, SignupError | DatabaseError>;

	readonly login: (
		email: string,
		password: string,
	) => Effect.Effect<
		{ user: User; session: Session },
		InvalidCredentialsError | DatabaseError
	>;

	readonly logout: (token: string) => Effect.Effect<void, DatabaseError>;

	readonly validateSession: (
		token: string,
	) => Effect.Effect<
		{ user: User; session: Session },
		SessionExpiredError | TokenError | DatabaseError
	>;

	readonly getUserByEmail: (
		email: string,
	) => Effect.Effect<User | null, DatabaseError>;

	readonly refreshSession: (
		token: string,
	) => Effect.Effect<Session, SessionExpiredError | TokenError | DatabaseError>;

	readonly deleteExpiredSessions: () => Effect.Effect<void, DatabaseError>;
}

export class AuthService extends Context.Tag("AuthService")<
	AuthService,
	IAuthService
>() {}

export const AuthServiceLive = Layer.effect(
	AuthService,
	Effect.gen(function* () {
		const db = yield* PgDrizzle;
		const config = yield* AuthConfig;

		const signup: IAuthService["signup"] = (email, password) =>
			Effect.gen(function* () {
				// Check if user already exists
				const [existingUser] = yield* db
					.select()
					.from(users)
					.where(eq(users.email, email));

				if (existingUser) {
					return yield* Effect.fail(
						new SignupError({ message: "User already exists" }),
					);
				}

				// Hash password
				const passwordHash = yield* Effect.tryPromise({
					try: () => bcrypt.hash(password, config.saltRounds),
					catch: (error) =>
						new SignupError({
							message: "Failed to hash password",
							cause: error,
						}),
				});

				// Create user
				const [newUser] = yield* db
					.insert(users)
					.values({
						email,
						passwordHash,
					} satisfies Omit<NewUser, "id" | "createdAt" | "updatedAt">)
					.returning();

				return newUser as User;
			}).pipe(
				Effect.mapError((e): SignupError | DatabaseError =>
					e instanceof SignupError
						? e
						: new DatabaseError({
								message: "Failed to signup",
								cause: e,
							}),
				),
			);

		const login: IAuthService["login"] = (email, password) =>
			Effect.gen(function* () {
				// Find user
				const [user] = yield* db
					.select()
					.from(users)
					.where(eq(users.email, email));

				if (!user) {
					return yield* Effect.fail(
						new InvalidCredentialsError({ message: "Invalid credentials" }),
					);
				}

				// Verify password
				const isValid = yield* Effect.tryPromise({
					try: () => bcrypt.compare(password, user.passwordHash),
					catch: () =>
						new InvalidCredentialsError({ message: "Invalid credentials" }),
				});

				if (!isValid) {
					return yield* Effect.fail(
						new InvalidCredentialsError({ message: "Invalid credentials" }),
					);
				}

				// Session fixation prevention: delete all existing sessions for this user
				yield* db.delete(sessions).where(eq(sessions.userId, user.id));

				// Piggyback expired session cleanup (fire-and-forget)
				yield* Effect.fork(deleteExpiredSessions());

				// Create new session
				const token = generateToken();
				const expiresAt = new Date(Date.now() + config.sessionDurationMs);

				const [session] = yield* db
					.insert(sessions)
					.values({
						userId: user.id,
						token,
						expiresAt,
					} satisfies Omit<NewSession, "id" | "createdAt">)
					.returning();

				return { user: user as User, session: session as Session };
			}).pipe(
				Effect.mapError((e): InvalidCredentialsError | DatabaseError =>
					e instanceof InvalidCredentialsError
						? e
						: new DatabaseError({
								message: "Failed to login",
								cause: e,
							}),
				),
			);

		const logout: IAuthService["logout"] = (token) =>
			Effect.gen(function* () {
				yield* db.delete(sessions).where(eq(sessions.token, token));
			}).pipe(
				Effect.mapError(
					(e) =>
						new DatabaseError({
							message: "Failed to delete session",
							cause: e,
						}),
				),
			);

		const validateSession: IAuthService["validateSession"] = (token) =>
			Effect.gen(function* () {
				if (!token) {
					return yield* Effect.fail(
						new TokenError({ message: "No token provided" }),
					);
				}

				// Find session with user
				const [result] = yield* db
					.select()
					.from(sessions)
					.where(
						and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())),
					);

				if (!result) {
					return yield* Effect.fail(
						new SessionExpiredError({ message: "Session expired or invalid" }),
					);
				}

				// Get user
				const [user] = yield* db
					.select()
					.from(users)
					.where(eq(users.id, (result as Session).userId));

				if (!user) {
					return yield* Effect.fail(
						new SessionExpiredError({ message: "User not found" }),
					);
				}

				return { user: user as User, session: result as Session };
			}).pipe(
				Effect.mapError(
					(e): SessionExpiredError | TokenError | DatabaseError =>
						e instanceof SessionExpiredError || e instanceof TokenError
							? e
							: new DatabaseError({
									message: "Failed to validate session",
									cause: e,
								}),
				),
			);

		const getUserByEmail: IAuthService["getUserByEmail"] = (email) =>
			Effect.gen(function* () {
				const [result] = yield* db
					.select()
					.from(users)
					.where(eq(users.email, email));
				return (result as User | undefined) ?? null;
			}).pipe(
				Effect.mapError(
					(e) =>
						new DatabaseError({
							message: "Failed to fetch user by email",
							cause: e,
						}),
				),
			);

		const refreshSession: IAuthService["refreshSession"] = (token) =>
			Effect.gen(function* () {
				// Validate current session first
				const { session } = yield* validateSession(token);

				// Update expiration
				const newExpiresAt = new Date(Date.now() + config.sessionDurationMs);
				const [updated] = yield* db
					.update(sessions)
					.set({ expiresAt: newExpiresAt })
					.where(eq(sessions.id, session.id))
					.returning();

				if (!updated) {
					return yield* Effect.fail(
						new SessionExpiredError({ message: "Session not found" }),
					);
				}

				return updated as Session;
			}).pipe(
				Effect.mapError(
					(e): SessionExpiredError | TokenError | DatabaseError =>
						e instanceof SessionExpiredError || e instanceof TokenError
							? e
							: new DatabaseError({
									message: "Failed to refresh session",
									cause: e,
								}),
				),
			);

		const deleteExpiredSessions: IAuthService["deleteExpiredSessions"] = () =>
			Effect.gen(function* () {
				yield* db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
			}).pipe(
				Effect.mapError(
					(e) =>
						new DatabaseError({
							message: "Failed to delete expired sessions",
							cause: e,
						}),
				),
			);

		return {
			signup,
			login,
			logout,
			validateSession,
			getUserByEmail,
			refreshSession,
			deleteExpiredSessions,
		};
	}),
);
