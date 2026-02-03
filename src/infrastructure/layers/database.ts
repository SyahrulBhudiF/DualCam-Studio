import { PgDrizzle, layer as pgDrizzleLayer } from "@effect/sql-drizzle/Pg";
import { PgClient } from "@effect/sql-pg";
import { Duration, Layer, Redacted } from "effect";

export { PgDrizzle };

export const PgClientLive = PgClient.layer({
	url: Redacted.make(process.env.DATABASE_URL ?? ""),
	maxConnections: 10,
	idleTimeout: Duration.seconds(20),
	connectTimeout: Duration.seconds(10),
});

export const DrizzleLive = pgDrizzleLayer.pipe(Layer.provide(PgClientLive));
