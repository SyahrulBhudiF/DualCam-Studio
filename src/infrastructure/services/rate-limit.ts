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
				const [existing] = yield* db
					.select()
					.from(rateLimits)
					.where(eq(rateLimits.key, key));

				// Step 2: If no entry or expired, reset to count=1
				if (!existing || (existing as RateLimit).expiresAt.getTime() < now) {
					yield* db
						.insert(rateLimits)
						.values({ key, count: 1, expiresAt })
						.onConflictDoUpdate({
							target: rateLimits.key,
							set: { count: 1, expiresAt },
						});
					return;
				}

				const entry = existing as RateLimit;

				// Step 3: Check if over limit BEFORE incrementing
				if (entry.count >= config.maxAttempts) {
					const retryAfterMs = entry.expiresAt.getTime() - now;
					return yield* Effect.fail(
						new RateLimitError({
							message: `Too many attempts. Try again in ${Math.ceil(retryAfterMs / 1000)} seconds.`,
							retryAfterMs,
						}),
					);
				}

				// Step 4: Increment count
				yield* db
					.update(rateLimits)
					.set({ count: entry.count + 1 })
					.where(eq(rateLimits.key, key));
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
