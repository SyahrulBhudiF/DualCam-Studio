import { Config } from "effect";

export const AuthConfig = Config.all({
	saltRounds: Config.number("BCRYPT_SALT_ROUNDS").pipe(Config.withDefault(10)),
	sessionDurationMs: Config.number("SESSION_DURATION_DAYS").pipe(
		Config.withDefault(7),
		Config.map((days) => days * 24 * 60 * 60 * 1000),
	),
});

export const SessionConfig = Config.all({
	cookieName: Config.string("SESSION_COOKIE_NAME"),
	durationDays: Config.number("SESSION_DURATION_DAYS"),
	secure: Config.string("NODE_ENV").pipe(
		Config.map((env) => env === "production"),
		Config.withDefault(false),
	),
});

export const DatabaseConfig = Config.all({
	url: Config.string("DATABASE_URL"),
});

export const RateLimitConfig = Config.all({
	maxAttempts: Config.number("RATE_LIMIT_MAX_ATTEMPTS").pipe(
		Config.withDefault(5),
	),
	windowMs: Config.number("RATE_LIMIT_WINDOW_MS").pipe(
		Config.withDefault(15 * 60 * 1000), // 15 minutes
	),
});
