import { and, eq } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import type { NewPredictionResult, PredictionResult } from "../db";
import { predictionResults } from "../db";
import { DatabaseError } from "../errors";
import { PredictionGrpc } from "../grpc";
import { GrpcClientLive } from "../grpc/client";
import { DB } from "../layers/database";
import type {
	PredictQuizRequest,
	PredictQuizResponse,
	PredictionVideoRef,
} from "../schemas/prediction";

export type CreatePredictionRowsInput = {
	responseId: string;
	videos: ReadonlyArray<PredictionVideoRef & { responseDetailId?: string | null }>;
};

export class PredictionResultService extends Context.Service<PredictionResultService>()(
	"PredictionResultService",
	{
		make: Effect.gen(function* () {
			const db = yield* DB.asEffect();

			const getByResponseId = Effect.fn(
				"PredictionResultService.getByResponseId",
			)(function* (responseId: string) {
				const rows = yield* db
					.select()
					.from(predictionResults)
					.where(eq(predictionResults.responseId, responseId))
					.pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to fetch prediction results",
									cause: e,
								}),
						),
					);
				return rows as PredictionResult[];
			});

			const createPending = Effect.fn(
				"PredictionResultService.createPending",
			)(function* (input: CreatePredictionRowsInput) {
				if (input.videos.length === 0) return [];

				const rows: NewPredictionResult[] = input.videos.map((video) => ({
					responseId: input.responseId,
					responseDetailId: video.responseDetailId ?? null,
					questionId: video.questionId,
					videoKind: video.kind,
					videoPath: video.path,
					videoFormat: video.format,
					videoMimeType: video.mimeType,
					status: "pending",
				}));

				const created = yield* db
					.insert(predictionResults)
					.values(rows)
					.returning()
					.pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to create prediction results",
									cause: e,
								}),
						),
					);

				return created as PredictionResult[];
			});

			const predictQuiz = Effect.fn(
				"PredictionResultService.predictQuiz",
			)(function* (request: PredictQuizRequest) {
				yield* markRunning(request.responseId);
				const response = yield* PredictionGrpc.predictQuiz(request).pipe(
					Effect.provide(GrpcClientLive),
					Effect.tapError((error) =>
						markFailed(request.responseId, error.message),
					),
				);
				yield* applyPredictQuizResponse(response);
				return response;
			});

			const markRunning = Effect.fn(
				"PredictionResultService.markRunning",
			)(function* (responseId: string) {
				const rows = yield* db
					.update(predictionResults)
					.set({ status: "running", updatedAt: new Date() })
					.where(eq(predictionResults.responseId, responseId))
					.returning()
					.pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to mark prediction results running",
									cause: e,
								}),
						),
					);
				return rows as PredictionResult[];
			});

			const applyPredictQuizResponse = Effect.fn(
				"PredictionResultService.applyPredictQuizResponse",
			)(function* (response: PredictQuizResponse) {
				const updated: PredictionResult[] = [];

				for (const result of response.results) {
					const status = result.status === "ok" ? "completed" : "failed";
					const [row] = yield* db
						.update(predictionResults)
						.set({
							aggregation: response.aggregation,
							durationSeconds: result.durationSeconds,
							errorMessage: result.errorMessage || null,
							frameCount: result.frameCount,
							label: result.label,
							modelExpName: response.expName,
							modelVersion: response.modelVersion,
							probabilityAnxietyTinggi: result.probabilityAnxietyTinggi,
							status,
							threshold: response.threshold,
							updatedAt: new Date(),
						})
						.where(
							and(
								eq(predictionResults.responseId, response.responseId),
								eq(predictionResults.questionId, result.questionId),
								eq(predictionResults.videoKind, result.videoKind),
							),
						)
						.returning()
						.pipe(
							Effect.mapError(
								(e) =>
									new DatabaseError({
										message: "Failed to update prediction result",
										cause: e,
									}),
							),
						);
					if (row) updated.push(row as PredictionResult);
				}

				return updated;
			});

			const markFailed = Effect.fn("PredictionResultService.markFailed")(
				function* (responseId: string, message: string) {
					const rows = yield* db
						.update(predictionResults)
						.set({
							errorMessage: message,
							status: "failed",
							updatedAt: new Date(),
						})
						.where(eq(predictionResults.responseId, responseId))
						.returning()
						.pipe(
							Effect.mapError(
								(e) =>
									new DatabaseError({
										message: "Failed to mark prediction results failed",
										cause: e,
									}),
							),
						);
					return rows as PredictionResult[];
				},
			);

			return {
				applyPredictQuizResponse,
				createPending,
				getByResponseId,
				markFailed,
				markRunning,
				predictQuiz,
			};
		}),
	},
) {
	static readonly layer = Layer.effect(this, this.make);
}
