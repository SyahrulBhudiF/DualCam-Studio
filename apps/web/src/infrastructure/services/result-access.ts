import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import type { ResponseResultAccess } from "../db/types";
import { responseResultAccess } from "../db/schema";
import { DatabaseError } from "../errors/database";
import { PredictionRequestError } from "../errors/prediction";
import { DB } from "../layers/database";

const TOKEN_BYTES = 32;

function hashToken(token: string) {
	return createHash("sha256").update(token).digest("hex");
}

function createToken() {
	return randomBytes(TOKEN_BYTES).toString("base64url");
}

export class ResultAccessService extends Context.Service<ResultAccessService>()(
	"ResultAccessService",
	{
		make: Effect.gen(function* () {
			const db = yield* DB.asEffect();

			const createForResponse = Effect.fn(
				"ResultAccessService.createForResponse",
			)(function* (
				responseId: string,
				options?: { predictionOptIn?: boolean },
			) {
				const token = createToken();
				const [row] = yield* db
					.insert(responseResultAccess)
					.values({
						predictionOptIn: options?.predictionOptIn ?? false,
						responseId,
						tokenHash: hashToken(token),
					})
					.returning()
					.pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to create result access token",
									cause: e,
								}),
						),
					);

				return { row: row as ResponseResultAccess, token };
			});

			const verify = Effect.fn("ResultAccessService.verify")(function* (
				responseId: string,
				token: string,
			) {
				const [row] = yield* db
					.select()
					.from(responseResultAccess)
					.where(
						and(
							eq(responseResultAccess.responseId, responseId),
							eq(responseResultAccess.tokenHash, hashToken(token)),
							or(
								isNull(responseResultAccess.expiresAt),
								gt(responseResultAccess.expiresAt, new Date()),
							),
						),
					)
					.pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to verify result access token",
									cause: e,
								}),
						),
					);

				if (!row) {
					return yield* Effect.fail(
						new PredictionRequestError({
							message: "Invalid or expired result link",
						}),
					);
				}

				return row as ResponseResultAccess;
			});

			const verifyPredictionOptIn = Effect.fn(
				"ResultAccessService.verifyPredictionOptIn",
			)(function* (responseId: string, token: string) {
				const row = yield* verify(responseId, token);
				if (!row.predictionOptIn) {
					return yield* Effect.fail(
						new PredictionRequestError({
							message: "Prediction was not enabled for this result link",
						}),
					);
				}
				return row;
			});

			return { createForResponse, verify, verifyPredictionOptIn };
		}),
	},
) {
	static readonly layer = Layer.effect(this, this.make);
}
