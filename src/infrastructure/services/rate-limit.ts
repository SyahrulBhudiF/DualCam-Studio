import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { eq, lt } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import { RateLimitConfig } from "../config";
import { rateLimits } from "../db";
import type { RateLimit } from "../db";
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
				const now = Date.now();
				const expiresAt = new Date(now + config.windowMs);

				// Step 1: Get existing entry
				const existing = yield* Effect.tryPromise({
					try: () =>
						db
							.select()
							.from(rateLimits)
							.where(eq(rateLimits.key, key))
							.then((rows) => rows[0] as RateLimit | undefined),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to check rate limit",
							cause: error,
						}),
				});

				// Step 2: If no entry or expired, reset to count=1
				if (!existing || existing.expiresAt.getTime() < now) {
					yield* Effect.tryPromise({
						try: () =>
							db
								.insert(rateLimits)
								.values({ key, count: 1, expiresAt })
								.onConflictDoUpdate({
									target: rateLimits.key,
									set: { count: 1, expiresAt },
								}),
						catch: (error) =>
							new DatabaseError({
								message: "Failed to reset rate limit",
								cause: error,
							}),
					});
					return;
				}

				// Step 3: Check if over limit BEFORE incrementing
				if (existing.count >= config.maxAttempts) {
					const retryAfterMs = existing.expiresAt.getTime() - now;
					return yield* Effect.fail(
						new RateLimitError({
							message: `Too many attempts. Try again in ${Math.ceil(retryAfterMs / 1000)} seconds.`,
							retryAfterMs,
						}),
					);
				}

				// Step 4: Increment count
				yield* Effect.tryPromise({
					try: () =>
						db
							.update(rateLimits)
							.set({ count: existing.count + 1 })
							.where(eq(rateLimits.key, key)),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to update rate limit",
							cause: error,
						}),
				});
			});

		const cleanup: IRateLimitService["cleanup"] = () =>
			Effect.tryPromise({
				try: () =>
					db
						.delete(rateLimits)
						.where(lt(rateLimits.expiresAt, new Date())),
				catch: (error) =>
					new DatabaseError({
						message: "Failed to cleanup rate limits",
						cause: error,
					}),
			}).pipe(Effect.map(() => undefined));

		return { check, cleanup };
	}),
);
