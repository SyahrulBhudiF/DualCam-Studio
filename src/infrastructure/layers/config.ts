import { Config, Redacted } from "effect";

export const DatabaseConfig = Config.all({
	url: Config.redacted("DATABASE_URL"),
	maxConnections: Config.number("DB_MAX_CONNECTIONS").pipe(
		Config.withDefault(10),
	),
	idleTimeoutSeconds: Config.number("DB_IDLE_TIMEOUT").pipe(
		Config.withDefault(20),
	),
	connectTimeoutSeconds: Config.number("DB_CONNECT_TIMEOUT").pipe(
		Config.withDefault(10),
	),
});

export const AuthConfig = Config.all({
	jwtSecret: Config.redacted("JWT_SECRET").pipe(
		Config.withDefault(Redacted.make("default-dev-secret-change-in-prod")),
	),
	sessionDurationHours: Config.number("SESSION_DURATION_HOURS").pipe(
		Config.withDefault(24),
	),
	bcryptRounds: Config.number("BCRYPT_ROUNDS").pipe(Config.withDefault(12)),
});

export const AppConfig = Config.all({
	nodeEnv: Config.string("NODE_ENV").pipe(Config.withDefault("development")),
	port: Config.number("PORT").pipe(Config.withDefault(3000)),
});

export type DatabaseConfigType = typeof DatabaseConfig extends Config.Config<
	infer A
>
	? A
	: never;
export type AuthConfigType = typeof AuthConfig extends Config.Config<infer A>
	? A
	: never;
export type AppConfigType = typeof AppConfig extends Config.Config<infer A>
	? A
	: never;
