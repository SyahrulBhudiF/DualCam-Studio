import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import * as bcrypt from "bcryptjs";
import { and, eq, gt, lt } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import type { NewSession, NewUser, Session, User } from "../db";
import { sessions, users } from "../db";
import { DatabaseError } from "../errors";
import {
	InvalidCredentialsError,
	SessionExpiredError,
	SignupError,
	TokenError,
} from "../errors/auth";

// Get auth configuration from environment
const getAuthConfig = () => ({
	saltRounds: Number.parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "10", 10),
	sessionDurationMs:
		Number.parseInt(process.env.SESSION_DURATION_DAYS ?? "7", 10) *
		24 *
		60 *
		60 *
		1000,
});

function generateToken(): string {
	const chars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let token = "";
	for (let i = 0; i < 64; i++) {
		token += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return token;
}

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

		const signup: IAuthService["signup"] = (email, password) =>
			Effect.gen(function* () {
				// Check if user already exists
				const existingUser = yield* Effect.tryPromise({
					try: () =>
						db
							.select()
							.from(users)
							.where(eq(users.email, email))
							.then((rows) => rows[0] as User | undefined),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to check existing user",
							cause: error,
						}),
				});

				if (existingUser) {
					return yield* Effect.fail(
						new SignupError({ message: "User already exists" }),
					);
				}

				// Hash password
				const config = getAuthConfig();
				const passwordHash = yield* Effect.tryPromise({
					try: () => bcrypt.hash(password, config.saltRounds),
					catch: (error) =>
						new SignupError({
							message: "Failed to hash password",
							cause: error,
						}),
				});

				// Create user
				const newUser = yield* Effect.tryPromise({
					try: () =>
						db
							.insert(users)
							.values({
								email,
								passwordHash,
							} satisfies Omit<NewUser, "id" | "createdAt" | "updatedAt">)
							.returning()
							.then((rows) => rows[0] as User),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to create user",
							cause: error,
						}),
				});

				return newUser;
			});

		const login: IAuthService["login"] = (email, password) =>
			Effect.gen(function* () {
				// Find user
				const user = yield* Effect.tryPromise({
					try: () =>
						db
							.select()
							.from(users)
							.where(eq(users.email, email))
							.then((rows) => rows[0] as User | undefined),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to find user",
							cause: error,
						}),
				});

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

				// Create session
				const token = generateToken();
				const config = getAuthConfig();
				const expiresAt = new Date(Date.now() + config.sessionDurationMs);

				const session = yield* Effect.tryPromise({
					try: () =>
						db
							.insert(sessions)
							.values({
								userId: user.id,
								token,
								expiresAt,
							} satisfies Omit<NewSession, "id" | "createdAt">)
							.returning()
							.then((rows) => rows[0] as Session),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to create session",
							cause: error,
						}),
				});

				return { user, session };
			});

		const logout: IAuthService["logout"] = (token) =>
			Effect.tryPromise({
				try: () => db.delete(sessions).where(eq(sessions.token, token)),
				catch: (error) =>
					new DatabaseError({
						message: "Failed to delete session",
						cause: error,
					}),
			}).pipe(Effect.map(() => undefined));

		const validateSession: IAuthService["validateSession"] = (token) =>
			Effect.gen(function* () {
				if (!token) {
					return yield* Effect.fail(
						new TokenError({ message: "No token provided" }),
					);
				}

				// Find session with user
				const result = yield* Effect.tryPromise({
					try: () =>
						db
							.select()
							.from(sessions)
							.where(
								and(
									eq(sessions.token, token),
									gt(sessions.expiresAt, new Date()),
								),
							)
							.then((rows) => rows[0] as Session | undefined),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to validate session",
							cause: error,
						}),
				});

				if (!result) {
					return yield* Effect.fail(
						new SessionExpiredError({ message: "Session expired or invalid" }),
					);
				}

				// Get user
				const user = yield* Effect.tryPromise({
					try: () =>
						db
							.select()
							.from(users)
							.where(eq(users.id, result.userId))
							.then((rows) => rows[0] as User | undefined),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to fetch user",
							cause: error,
						}),
				});

				if (!user) {
					return yield* Effect.fail(
						new SessionExpiredError({ message: "User not found" }),
					);
				}

				return { user, session: result };
			});

		const getUserByEmail: IAuthService["getUserByEmail"] = (email) =>
			Effect.tryPromise({
				try: () =>
					db
						.select()
						.from(users)
						.where(eq(users.email, email))
						.then((rows) => (rows[0] as User | undefined) ?? null),
				catch: (error) =>
					new DatabaseError({
						message: "Failed to fetch user by email",
						cause: error,
					}),
			});

		const refreshSession: IAuthService["refreshSession"] = (token) =>
			Effect.gen(function* () {
				// Validate current session first
				const { session } = yield* validateSession(token);

				// Update expiration
				const config = getAuthConfig();
				const newExpiresAt = new Date(Date.now() + config.sessionDurationMs);
				const updated = yield* Effect.tryPromise({
					try: () =>
						db
							.update(sessions)
							.set({ expiresAt: newExpiresAt })
							.where(eq(sessions.id, session.id))
							.returning()
							.then((rows) => rows[0] as Session | undefined),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to refresh session",
							cause: error,
						}),
				});

				if (!updated) {
					return yield* Effect.fail(
						new SessionExpiredError({ message: "Session not found" }),
					);
				}

				return updated;
			});

		const deleteExpiredSessions: IAuthService["deleteExpiredSessions"] = () =>
			Effect.tryPromise({
				try: () =>
					db.delete(sessions).where(lt(sessions.expiresAt, new Date())),
				catch: (error) =>
					new DatabaseError({
						message: "Failed to delete expired sessions",
						cause: error,
					}),
			}).pipe(Effect.map(() => undefined));

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
