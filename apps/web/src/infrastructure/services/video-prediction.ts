import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { asc, desc, eq } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import {
	videoPredictionEvents,
	videoPredictions,
} from "../db/schema";
import type {
	NewVideoPredictionEvent,
	VideoPrediction,
	VideoPredictionEvent,
} from "../db/types";
import { DatabaseError } from "../errors/database";
import { GrpcClientLive } from "../grpc/client";
import { PredictionGrpc } from "../grpc/prediction";
import { DB } from "../layers/database";
import type {
	CreateVideoPrediction,
	PredictVideoRequest,
	PredictVideoResponse,
} from "../schemas/prediction";

export type VideoPredictionDetail = VideoPrediction & {
	events: VideoPredictionEvent[];
};

export type CreatedVideoPrediction = {
	accessToken: string;
	prediction: VideoPrediction;
};

export class VideoPredictionService extends Context.Service<VideoPredictionService>()(
	"VideoPredictionService",
	{
		make: Effect.gen(function* () {
			const db = yield* DB.asEffect();

			const createPending = Effect.fn("VideoPredictionService.createPending")(
				function* (input: CreateVideoPrediction) {
					const accessToken = createAccessToken();
					const [prediction] = yield* db
						.insert(videoPredictions)
						.values({
							accessTokenHash: hashAccessToken(accessToken),
							accessTokenExpiresAt: null,
							playbackVideoPath: input.playbackVideoPath
								? normalizeVideoPath(input.playbackVideoPath)
								: null,
							status: "pending",
							videoFormat: input.format,
							videoMimeType: input.mimeType,
							videoPath: normalizeVideoPath(input.videoPath),
							videoSizeBytes: input.sizeBytes,
						})
						.returning()
						.pipe(
							Effect.mapError(
								(error) =>
									new DatabaseError({
										message: "Failed to create video prediction",
										cause: error,
									}),
							),
						);
					return { accessToken, prediction: prediction as VideoPrediction };
				},
			);

			const getInternalById = Effect.fn(
				"VideoPredictionService.getInternalById",
			)(function* (predictionId: string) {
				const [prediction] = yield* db
					.select()
					.from(videoPredictions)
					.where(eq(videoPredictions.id, predictionId))
					.pipe(
						Effect.mapError(
							(error) =>
								new DatabaseError({
									message: "Failed to fetch video prediction",
									cause: error,
								}),
						),
					);
				return (prediction as VideoPrediction | undefined) ?? null;
			});

			const getEvents = Effect.fn("VideoPredictionService.getEvents")(
				function* (predictionId: string) {
					return (yield* db
						.select()
						.from(videoPredictionEvents)
						.where(eq(videoPredictionEvents.predictionId, predictionId))
						.orderBy(asc(videoPredictionEvents.eventNo))
						.pipe(
							Effect.mapError(
								(error) =>
									new DatabaseError({
										message: "Failed to fetch video prediction events",
										cause: error,
									}),
							),
						)) as VideoPredictionEvent[];
				},
			);

			const assertPublicAccess = Effect.fn(
				"VideoPredictionService.assertPublicAccess",
			)(function* (predictionId: string, token: string) {
				const prediction = yield* getInternalById(predictionId);
				if (!prediction) return null;
				if (!verifyAccessToken(token, prediction.accessTokenHash)) return null;
				if (
					prediction.accessTokenExpiresAt &&
					prediction.accessTokenExpiresAt.getTime() < Date.now()
				) {
					return null;
				}
				return prediction;
			});

			const getPublicById = Effect.fn("VideoPredictionService.getPublicById")(
				function* (predictionId: string, token: string) {
					const prediction = yield* assertPublicAccess(predictionId, token);
					if (!prediction) return null;
					const events = yield* getEvents(predictionId);
					return { ...prediction, events } as VideoPredictionDetail;
				},
			);

			const getAdminById = Effect.fn("VideoPredictionService.getAdminById")(
				function* (predictionId: string) {
					const prediction = yield* getInternalById(predictionId);
					if (!prediction) return null;
					const events = yield* getEvents(predictionId);
					return { ...prediction, events } as VideoPredictionDetail;
				},
			);

			const listAdmin = Effect.fn("VideoPredictionService.listAdmin")(
				function* () {
					return (yield* db
						.select()
						.from(videoPredictions)
						.orderBy(desc(videoPredictions.createdAt))
						.pipe(
							Effect.mapError(
								(error) =>
									new DatabaseError({
										message: "Failed to list video predictions",
										cause: error,
									}),
							),
						)) as VideoPrediction[];
				},
			);

			const markRunning = Effect.fn("VideoPredictionService.markRunning")(
				function* (predictionId: string) {
					const [prediction] = yield* db
						.update(videoPredictions)
						.set({ status: "running", updatedAt: new Date() })
						.where(eq(videoPredictions.id, predictionId))
						.returning()
						.pipe(
							Effect.mapError(
								(error) =>
									new DatabaseError({
										message: "Failed to mark video prediction running",
										cause: error,
									}),
							),
						);
					return prediction as VideoPrediction | undefined;
				},
			);

			const markFailed = Effect.fn("VideoPredictionService.markFailed")(
				function* (predictionId: string, message: string) {
					const [prediction] = yield* db
						.update(videoPredictions)
						.set({
							errorMessage: message,
							status: "failed",
							updatedAt: new Date(),
						})
						.where(eq(videoPredictions.id, predictionId))
						.returning()
						.pipe(
							Effect.mapError(
								(error) =>
									new DatabaseError({
										message: "Failed to mark video prediction failed",
										cause: error,
									}),
							),
						);
					return prediction as VideoPrediction | undefined;
				},
			);

			const applyPredictVideoResponse = Effect.fn(
				"VideoPredictionService.applyPredictVideoResponse",
			)(function* (response: PredictVideoResponse) {
				const final = response.finalPrediction;
				const status = final.status === "ok" ? "completed" : "failed";

				yield* db
					.delete(videoPredictionEvents)
					.where(eq(videoPredictionEvents.predictionId, response.predictionId))
					.pipe(
						Effect.mapError(
							(error) =>
								new DatabaseError({
									message: "Failed to clear video prediction events",
									cause: error,
								}),
						),
					);

				const eventRows: NewVideoPredictionEvent[] = response.events.map(
					(event) => ({
						apexFrame: event.apexFrame,
						apexTimeSeconds: event.apexTimeSeconds,
						durationFrames: event.durationFrames,
						durationSeconds: event.durationSeconds,
						eventNo: event.eventNo,
						label: event.label,
						offsetFrame: event.offsetFrame,
						offsetTimeSeconds: event.offsetTimeSeconds,
						onsetFrame: event.onsetFrame,
						onsetTimeSeconds: event.onsetTimeSeconds,
						predictionId: response.predictionId,
						probabilityAnxietyTinggi: event.probabilityAnxietyTinggi,
					}),
				);

				if (eventRows.length > 0) {
					yield* db
						.insert(videoPredictionEvents)
						.values(eventRows)
						.pipe(
							Effect.mapError(
								(error) =>
									new DatabaseError({
										message: "Failed to insert video prediction events",
										cause: error,
									}),
							),
						);
				}

				const [prediction] = yield* db
					.update(videoPredictions)
					.set({
						aggregation: response.aggregation,
						durationSeconds: final.durationSeconds,
						errorMessage: final.errorMessage || null,
						eventCount: response.events.length,
						fps: final.fps,
						frameCount: final.frameCount,
						label: final.label,
						modelExpName: response.expName,
						modelVersion: response.modelVersion,
						probabilityAnxietyTinggi: final.probabilityAnxietyTinggi,
						spottingSignal: response.spottingSignal ?? null,
						status,
						threshold: response.threshold,
						updatedAt: new Date(),
					})
					.where(eq(videoPredictions.id, response.predictionId))
					.returning()
					.pipe(
						Effect.mapError(
							(error) =>
								new DatabaseError({
									message: "Failed to update video prediction",
									cause: error,
								}),
						),
					);
				return prediction as VideoPrediction | undefined;
			});

			const predictVideo = Effect.fn("VideoPredictionService.predictVideo")(
				function* (request: PredictVideoRequest) {
					yield* markRunning(request.predictionId);
					const response = yield* PredictionGrpc.predictVideo(request).pipe(
						Effect.provide(GrpcClientLive),
						Effect.tapError((error) =>
							markFailed(request.predictionId, error.message),
						),
					);
					yield* applyPredictVideoResponse(response);
					return response;
				},
			);

			return {
				applyPredictVideoResponse,
				createPending,
				getAdminById,
				getInternalById,
				getPublicById,
				listAdmin,
				markFailed,
				markRunning,
				predictVideo,
			};
		}),
	},
) {
	static readonly layer = Layer.effect(this, this.make);
}

function normalizeVideoPath(videoPath: string) {
	let cleanPath = videoPath.trim();
	while (cleanPath.startsWith("/")) cleanPath = cleanPath.slice(1);
	if (cleanPath.startsWith("video_uploads/")) {
		cleanPath = cleanPath.slice("video_uploads/".length);
	}
	return cleanPath;
}

function createAccessToken() {
	return randomBytes(32).toString("base64url");
}

function hashAccessToken(token: string) {
	return createHash("sha256").update(token).digest("hex");
}

function verifyAccessToken(token: string, expectedHash: string) {
	const actualHash = hashAccessToken(token);
	const actual = Buffer.from(actualHash, "hex");
	const expected = Buffer.from(expectedHash, "hex");
	return actual.length === expected.length && timingSafeEqual(actual, expected);
}
