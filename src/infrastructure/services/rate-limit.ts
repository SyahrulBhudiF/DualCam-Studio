import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { eq, lt, sql } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import { RateLimitConfig } from "../config";
import { rateLimits } from "../db";
import { DatabaseError } from "../errors";
import { RateLimitError } from "../errors/auth";

export interface IRateLimitService {
	readonly check: (
		key: string,
	) => Effect.Effect<void, RateLimitError | DatabaseError>;

	readonly cleanup: () => Effect.Effect<void, DatabaseError>;
}

export class RateLimitService extends Context.Tag("RateLimitService")<
	RateLimitService,
	IRateLimitService
>() {}

export const RateLimitServiceLive = Layer.effect(
	RateLimitService,
	Effect.gen(function* () {
		const db = yield* PgDrizzle;
		const config = yield* RateLimitConfig;

		const check: IRateLimitService["check"] = (key) =>
			Effect.gen(function* () {
				const now = new Date();
				const expiresAt = new Date(now.getTime() + config.windowMs);

				// Atomic upsert: insert with count=1 or increment if exists and not expired
				// If expired, reset count to 1 with new window
				yield* db
					.insert(rateLimits)
					.values({ key, count: 1, expiresAt })
					.onConflictDoUpdate({
						target: rateLimits.key,
						set: {
							count: sql`CASE
								WHEN ${rateLimits.expiresAt} < ${now} THEN 1
								ELSE ${rateLimits.count} + 1
							END`,
							expiresAt: sql`CASE
								WHEN ${rateLimits.expiresAt} < ${now} THEN ${expiresAt}
								ELSE ${rateLimits.expiresAt}
							END`,
						},
					});

				// Now check if over limit
				const [entry] = yield* db
					.select()
					.from(rateLimits)
					.where(eq(rateLimits.key, key));

				if (entry && entry.count > config.maxAttempts) {
					const retryAfterMs = entry.expiresAt.getTime() - now.getTime();
					return yield* Effect.fail(
						new RateLimitError({
							message: `Too many attempts. Try again in ${Math.ceil(retryAfterMs / 1000)} seconds.`,
							retryAfterMs,
						}),
					);
				}
			}).pipe(
				Effect.mapError((e): RateLimitError | DatabaseError =>
					e instanceof RateLimitError
						? e
						: new DatabaseError({
								message: "Failed to check rate limit",
								cause: e,
							}),
				),
			);

		const cleanup: IRateLimitService["cleanup"] = () =>
			Effect.gen(function* () {
				yield* db
					.delete(rateLimits)
					.where(lt(rateLimits.expiresAt, new Date()));
			}).pipe(
				Effect.mapError(
					(e) =>
						new DatabaseError({
							message: "Failed to cleanup rate limits",
							cause: e,
						}),
				),
			);

		return { check, cleanup };
	}),
);
