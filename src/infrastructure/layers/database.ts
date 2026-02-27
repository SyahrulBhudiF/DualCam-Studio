import { PgDrizzle, layer as pgDrizzleLayer } from "@effect/sql-drizzle/Pg";
import { PgClient } from "@effect/sql-pg";
import { Config, Duration, Layer, Redacted } from "effect";

export { PgDrizzle };

export const PgClientLive = PgClient.layerConfig(
	Config.all({
		url: Config.redacted("DATABASE_URL"),
		maxConnections: Config.succeed(10),
		idleTimeout: Config.succeed(Duration.seconds(20)),
		connectTimeout: Config.succeed(Duration.seconds(10)),
	}),
);

// Provide both PgDrizzle and PgClient to downstream services
export const DrizzleLive = Layer.merge(
	pgDrizzleLayer.pipe(Layer.provide(PgClientLive)),
	PgClientLive,
);
