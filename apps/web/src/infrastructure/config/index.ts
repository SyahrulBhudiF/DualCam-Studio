import { Config, ConfigProvider } from "effect";

const envProvider = ConfigProvider.fromEnv();

export const AuthConfig = Config.all({
	saltRounds: Config.number("BCRYPT_SALT_ROUNDS").pipe(Config.withDefault(10)),
	sessionDurationMs: Config.number("SESSION_DURATION_DAYS").pipe(
		Config.withDefault(7),
		Config.map((days) => days * 24 * 60 * 60 * 1000),
	),
});

const SessionConfigDescriptor = Config.all({
	cookieName: Config.string("SESSION_COOKIE_NAME").pipe(
		Config.withDefault("session_token"),
	),
	durationDays: Config.number("SESSION_DURATION_DAYS").pipe(Config.withDefault(7)),
	secure: Config.string("NODE_ENV").pipe(
		Config.map((env) => env === "production"),
		Config.withDefault(false),
	),
});

export const SessionConfig = SessionConfigDescriptor.parse(envProvider);

const _DatabaseConfig = Config.all({
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

export const StorageConfig = Config.all({
	uploadRoot: Config.string("UPLOAD_ROOT").pipe(
		Config.withDefault("video_uploads"),
	),
});

export const PredictionConfig = Config.all({
	host: Config.string("PREDICTOR_HOST").pipe(Config.withDefault("127.0.0.1")),
	port: Config.number("PREDICTOR_PORT").pipe(Config.withDefault(50051)),
	timeoutMs: Config.number("PREDICTOR_TIMEOUT_MS").pipe(
		Config.withDefault(120_000),
	),
});
