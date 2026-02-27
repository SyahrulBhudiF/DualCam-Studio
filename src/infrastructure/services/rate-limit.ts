import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { eq, lt, sql } from "drizzle-orm";
import { Effect } from "effect";
import { RateLimitConfig } from "../config";
import { rateLimits } from "../db";
import { DatabaseError } from "../errors";
import { RateLimitError } from "../errors/auth";

export class RateLimitService extends Effect.Service<RateLimitService>()(
	"RateLimitService",
	{
		accessors: true,
		dependencies: [],
		effect: Effect.gen(function* () {
			const db = yield* PgDrizzle;
			const config = yield* RateLimitConfig;

			const check = Effect.fn("RateLimitService.check")(function* (key: string) {
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
					}).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to update rate limit",
									cause: e,
								}),
						),
					);

				// Now check if over limit
				const [entry] = yield* db
					.select()
					.from(rateLimits)
					.where(eq(rateLimits.key, key)).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to fetch rate limit",
									cause: e,
								}),
						),
					);

				if (entry && entry.count > config.maxAttempts) {
					const retryAfterMs = entry.expiresAt.getTime() - now.getTime();
					return yield* Effect.fail(
						new RateLimitError({
							message: `Too many attempts. Try again in ${Math.ceil(retryAfterMs / 1000)} seconds.`,
							retryAfterMs,
						}),
					);
				}
			});

			const cleanup = Effect.fn("RateLimitService.cleanup")(function* () {
				yield* db.delete(rateLimits).where(lt(rateLimits.expiresAt, new Date())).pipe(
					Effect.mapError(
						(e) =>
							new DatabaseError({
								message: "Failed to cleanup rate limits",
								cause: e,
							}),
					),
				);
			});

			return { check, cleanup };
		}),
	},
) {}
