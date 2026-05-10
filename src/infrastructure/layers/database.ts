import { PgClient } from"@effect/sql-pg";
import * as PgDrizzle from"drizzle-orm/effect-postgres";
import { Config, ConfigProvider, Context, Effect, Layer } from"effect";
import { types } from"pg";
import * as schema from"../db/schema";

const PgTypeOid = {
	Date: types.builtins.DATE,
	Timestamp: types.builtins.TIMESTAMP,
	TimestampTz: types.builtins.TIMESTAMPTZ,
	Interval: types.builtins.INTERVAL,
	NumericArray: 1231,
	TimestampArray: 1115,
	TimestampTzArray: 1185,
	IntervalArray: 1187,
	DateArray: 1182,
} as const;

// Matches Drizzle's pg type parser override: keep date/time-ish values raw so
// Drizzle maps columns according to schema metadata instead of pg pre-parsing.
const DRIZZLE_RAW_TYPE_IDS = new Set<number>(Object.values(PgTypeOid));

const PgClientConfig = Config.all({
	url: Config.redacted("DATABASE_URL"),
	maxConnections: Config.succeed(10),
});

const envProvider = ConfigProvider.fromEnv();

export const PgClientLive = Layer.unwrap(
	Effect.gen(function* () {
		const config = yield* PgClientConfig.parse(envProvider);
		return PgClient.layer({
			...config,
			types: {
				getTypeParser: (typeId, format) => {
					if (DRIZZLE_RAW_TYPE_IDS.has(typeId)) {
						return (value: string) => value;
					}
					return types.getTypeParser(typeId, format);
				},
			},
		});
	}),
);

const dbEffect = PgDrizzle.makeWithDefaults({
	// Drizzle's effect-postgres config omits `schema` in current rc types,
	// but runtime still accepts it via the shared Drizzle config path.
	schema,
} as never);

type Database = Effect.Success<typeof dbEffect>;

export class DB extends Context.Service<DB, Database>()("DB", {
	make: dbEffect,
}) {}

export const DrizzleLive = Layer.effect(DB, DB.make).pipe(
	Layer.provide(PgClientLive),
);

export const DatabaseLive = Layer.provideMerge(DrizzleLive, PgClientLive);
