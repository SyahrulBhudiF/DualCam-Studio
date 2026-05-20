import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import {
	PredictionResultService,
	ResponseService,
	runEffect,
} from "@/infrastructure";
import {
	PredictionByResponseSchema,
	type PredictionVideoPair,
	type PredictionVideoRef,
	type PredictQuizRequest,
	type ResponseForPrediction,
	inputValidator,
} from "@/infrastructure/schemas";
import { verifyCsrfOrigin } from "@/utils/csrf";

export const getPredictionResults = createServerFn({ method: "GET" })
	.inputValidator(inputValidator(PredictionByResponseSchema))
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* PredictionResultService.asEffect();
				return yield* service.getByResponseId(data.responseId);
			}),
		);
	});

export const runPrediction = createServerFn({ method: "POST" })
	.inputValidator(inputValidator(PredictionByResponseSchema))
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				yield* verifyCsrfOrigin;

				const responseService = yield* ResponseService.asEffect();
				const predictionService = yield* PredictionResultService.asEffect();
				const response = yield* responseService.getById(data.responseId);
				const videos = buildPredictionVideos(response);

				if (videos.length === 0) {
					return {
						prediction: null,
						results: yield* predictionService.getByResponseId(data.responseId),
					};
				}

				const request: PredictQuizRequest = {
					participantId: response.userId,
					responseId: response.id,
					videos,
				};

				yield* predictionService.createPending({
					responseId: response.id,
					videos,
				});
				const prediction = yield* predictionService.predictQuiz(request);
				const results = yield* predictionService.getByResponseId(response.id);

				return { prediction, results };
			}),
		);
	});

function buildPredictionVideos(
	response: ResponseForPrediction,
): Array<PredictionVideoRef & { responseDetailId?: string | null }> {
	const videos: Array<PredictionVideoRef & { responseDetailId?: string | null }> = [];

	for (const detail of response.details) {
		addVideoPair(videos, {
			pair: parseVideoPair(detail.videoSegmentPath),
			questionId: detail.questionId,
			responseDetailId: detail.id,
		});
	}

	if (videos.length > 0) return videos;

	addVideoPair(videos, {
		pair: parseVideoPair(response.videoPath),
		questionId: "full",
		responseDetailId: null,
	});

	return videos;
}

function addVideoPair(
	videos: Array<PredictionVideoRef & { responseDetailId?: string | null }>,
	input: {
		pair: PredictionVideoPair | null;
		questionId: string;
		responseDetailId?: string | null;
	},
) {
	addVideo(videos, {
		kind: "main",
		path: input.pair?.main,
		questionId: input.questionId,
		responseDetailId: input.responseDetailId,
	});
	addVideo(videos, {
		kind: "secondary",
		path: input.pair?.secondary,
		questionId: input.questionId,
		responseDetailId: input.responseDetailId,
	});
}

function addVideo(
	videos: Array<PredictionVideoRef & { responseDetailId?: string | null }>,
	input: {
		kind: string;
		path: unknown;
		questionId: string;
		responseDetailId?: string | null;
	},
) {
	if (typeof input.path !== "string") return;
	const videoPath = normalizeVideoPath(input.path);
	if (!videoPath) return;

	videos.push({
		format: videoPath.split(".").at(-1)?.toLowerCase(),
		kind: input.kind,
		path: videoPath,
		questionId: input.questionId,
		responseDetailId: input.responseDetailId,
		source: "web",
	});
}

function parseVideoPair(value: unknown): PredictionVideoPair | null {
	if (!value || value === "null") return null;
	if (typeof value === "object") return value as PredictionVideoPair;
	if (typeof value !== "string") return null;

	try {
		const parsed = JSON.parse(value) as unknown;
		if (parsed && typeof parsed === "object") return parsed as PredictionVideoPair;
	} catch {
		return { main: value };
	}

	return null;
}

function normalizeVideoPath(videoPath: string): string | null {
	let cleanPath = videoPath.trim();
	if (!cleanPath) return null;
	while (cleanPath.startsWith("/")) cleanPath = cleanPath.slice(1);
	if (cleanPath.startsWith("video_uploads/")) {
		cleanPath = cleanPath.slice("video_uploads/".length);
	}
	if (cleanPath.startsWith("/") || cleanPath.includes("\\")) return null;
	const parts = cleanPath.split("/");
	if (parts.some((part) => !part || part === "." || part === "..")) return null;
	return cleanPath;
}
