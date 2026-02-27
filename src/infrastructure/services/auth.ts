import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import * as bcrypt from "bcryptjs";
import { and, eq, gt, lt } from "drizzle-orm";
import { Effect } from "effect";
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

export class AuthService extends Effect.Service<AuthService>()("AuthService", {
	accessors: true,
	dependencies: [],
	effect: Effect.gen(function* () {
		const db = yield* PgDrizzle;
		const config = yield* AuthConfig;

		const deleteExpiredSessions = Effect.fn(
			"AuthService.deleteExpiredSessions",
		)(function* () {
			yield* db.delete(sessions).where(lt(sessions.expiresAt, new Date())).pipe(
				Effect.mapError(
					(e) =>
						new DatabaseError({
							message: "Failed to delete expired sessions",
							cause: e,
						}),
				),
			);
		});

		const signup = Effect.fn("AuthService.signup")(function* (
			email: string,
			password: string,
		) {
			// Check if user already exists
			const [existingUser] = yield* db
				.select()
				.from(users)
				.where(eq(users.email, email)).pipe(
					Effect.mapError((e) => new DatabaseError({ message: "Failed to check existing user", cause: e }))
				);

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
				.returning().pipe(
					Effect.mapError((e) => new DatabaseError({ message: "Failed to signup", cause: e }))
				);

			return newUser as User;
		});

		const login = Effect.fn("AuthService.login")(function* (
			email: string,
			password: string,
		) {
			// Find user
			const [user] = yield* db.select().from(users).where(eq(users.email, email)).pipe(
				Effect.mapError((e) => new DatabaseError({ message: "Failed to find user", cause: e }))
			);

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
			yield* db.delete(sessions).where(eq(sessions.userId, user.id)).pipe(
				Effect.mapError((e) => new DatabaseError({ message: "Failed to delete old sessions", cause: e }))
			);

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
				.returning().pipe(
					Effect.mapError((e) => new DatabaseError({ message: "Failed to create session", cause: e }))
				);

			return { user: user as User, session: session as Session };
		});

		const logout = Effect.fn("AuthService.logout")(function* (token: string) {
			yield* db.delete(sessions).where(eq(sessions.token, token)).pipe(
				Effect.mapError(
					(e) =>
						new DatabaseError({
							message: "Failed to delete session",
							cause: e,
						}),
				),
			);
		});

		const validateSession = Effect.fn("AuthService.validateSession")(function* (
			token: string,
		) {
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
				).pipe(
					Effect.mapError((e) => new DatabaseError({ message: "Failed to validate session", cause: e }))
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
				.where(eq(users.id, (result as Session).userId)).pipe(
					Effect.mapError((e) => new DatabaseError({ message: "Failed to fetch user", cause: e }))
				);

			if (!user) {
				return yield* Effect.fail(
					new SessionExpiredError({ message: "User not found" }),
				);
			}

			return { user: user as User, session: result as Session };
		});

		const getUserByEmail = Effect.fn("AuthService.getUserByEmail")(function* (
			email: string,
		) {
			const [result] = yield* db
				.select()
				.from(users)
				.where(eq(users.email, email)).pipe(
					Effect.mapError(
						(e) =>
							new DatabaseError({
								message: "Failed to fetch user by email",
								cause: e,
							}),
					),
				);
			return (result as User | undefined) ?? null;
		});

		const refreshSession = Effect.fn("AuthService.refreshSession")(function* (
			token: string,
		) {
			// Validate current session first
			const { session } = yield* validateSession(token);

			// Update expiration
			const newExpiresAt = new Date(Date.now() + config.sessionDurationMs);
			const [updated] = yield* db
				.update(sessions)
				.set({ expiresAt: newExpiresAt })
				.where(eq(sessions.id, session.id))
				.returning().pipe(
					Effect.mapError((e) => new DatabaseError({ message: "Failed to refresh session", cause: e }))
				);

			if (!updated) {
				return yield* Effect.fail(
					new SessionExpiredError({ message: "Session not found" }),
				);
			}

			return updated as Session;
		});

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
}) {}
