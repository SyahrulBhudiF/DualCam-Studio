import { createServerFn } from "@tanstack/react-start";
import { Effect, type Effect as EffectType } from "effect";
import {
	FileUploadService,
	PredictionResultService,
	ResponseService,
	ResultAccessService,
	runEffect,
} from "@/infrastructure";
import {
	inputValidator,
	PredictionByResponseSchema,
	type PredictionVideoPair,
	type PredictionVideoRef,
	type PredictQuizRequest,
	PublicPredictionByResponseSchema,
	type ResponseForPrediction,
} from "@/infrastructure/schemas";
import { verifyCsrfOrigin } from "@/utils/csrf";
import { requireAuth } from "@/utils/session";

type FileUploadServiceApi = EffectType.Success<
	ReturnType<typeof FileUploadService.asEffect>
>;

const SUPPORTED_VIDEO_EXTENSIONS = new Set([
	"avi",
	"flv",
	"m4v",
	"mkv",
	"mov",
	"mp4",
	"mpeg",
	"mpg",
	"ogv",
	"webm",
	"wmv",
]);

export const getPredictionResults = createServerFn({ method: "GET" })
	.inputValidator(inputValidator(PredictionByResponseSchema))
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				yield* requireAuth;
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
				yield* requireAuth;
				return yield* runPredictionForResponse(data.responseId, {
					force: true,
				});
			}),
		);
	});

export const getPublicPredictionResult = createServerFn({ method: "GET" })
	.inputValidator(inputValidator(PublicPredictionByResponseSchema))
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				const resultAccessService = yield* ResultAccessService.asEffect();
				const predictionService = yield* PredictionResultService.asEffect();
				yield* resultAccessService.verifyPredictionOptIn(
					data.responseId,
					data.token,
				);
				return yield* predictionService.getByResponseId(data.responseId);
			}),
		);
	});

export const runPublicPrediction = createServerFn({ method: "POST" })
	.inputValidator(inputValidator(PublicPredictionByResponseSchema))
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				yield* verifyCsrfOrigin;
				const resultAccessService = yield* ResultAccessService.asEffect();
				yield* resultAccessService.verifyPredictionOptIn(
					data.responseId,
					data.token,
				);
				return yield* runPredictionForResponse(data.responseId, {
					force: false,
				});
			}),
		);
	});

function runPredictionForResponse(
	responseId: string,
	options: { force: boolean },
) {
	return Effect.gen(function* () {
		const fileUploadService = yield* FileUploadService.asEffect();
		const responseService = yield* ResponseService.asEffect();
		const predictionService = yield* PredictionResultService.asEffect();
		const existingResults =
			yield* predictionService.getByResponseId(responseId);

		if (
			!options.force &&
			existingResults.length > 0 &&
			existingResults.every((row) => row.status === "completed")
		) {
			return { accepted: false, prediction: null, results: existingResults };
		}

		const response = yield* responseService.getById(responseId);
		const videos = yield* buildPredictionVideos(response, fileUploadService);

		if (videos.length === 0) {
			return {
				accepted: false,
				prediction: null,
				results: existingResults,
			};
		}

		if (options.force || existingResults.length === 0) {
			yield* predictionService.createPending({
				responseId: response.id,
				videos,
			});
		}

		const request: PredictQuizRequest = {
			participantId: response.userId,
			responseId: response.id,
			videos,
		};

		void runEffect(
			predictionService
				.predictQuiz(request)
				.pipe(
					Effect.catchCause((cause) =>
						Effect.logError("Prediction background job failed", cause),
					),
				),
		);

		const results = yield* predictionService.getByResponseId(response.id);

		return { accepted: true, prediction: null, results };
	});
}

function buildPredictionVideos(
	response: ResponseForPrediction,
	fileUploadService: FileUploadServiceApi,
) {
	return Effect.gen(function* () {
		const videos: Array<
			PredictionVideoRef & { responseDetailId?: string | null }
		> = [];

		for (const detail of response.details) {
			yield* addVideoPair(videos, fileUploadService, {
				pair: parseVideoPair(detail.videoSegmentPath),
				questionId: detail.questionId,
				responseDetailId: detail.id,
			});
		}

		if (videos.length > 0) return videos;

		yield* addVideoPair(videos, fileUploadService, {
			pair: parseVideoPair(response.videoPath),
			questionId: "full",
			responseDetailId: null,
		});

		return videos;
	});
}

function addVideoPair(
	videos: Array<PredictionVideoRef & { responseDetailId?: string | null }>,
	fileUploadService: FileUploadServiceApi,
	input: {
		pair: PredictionVideoPair | null;
		questionId: string;
		responseDetailId?: string | null;
	},
) {
	return Effect.gen(function* () {
		yield* addVideo(videos, fileUploadService, {
			kind: "main",
			path: input.pair?.main,
			questionId: input.questionId,
			responseDetailId: input.responseDetailId,
		});
		yield* addVideo(videos, fileUploadService, {
			kind: "secondary",
			path: input.pair?.secondary,
			questionId: input.questionId,
			responseDetailId: input.responseDetailId,
		});
	});
}

function addVideo(
	videos: Array<PredictionVideoRef & { responseDetailId?: string | null }>,
	fileUploadService: FileUploadServiceApi,
	input: {
		kind: string;
		path: unknown;
		questionId: string;
		responseDetailId?: string | null;
	},
) {
	return Effect.gen(function* () {
		if (typeof input.path !== "string") return;
		const videoPath = normalizeVideoPath(input.path);
		if (!videoPath) return;

		const resolvedPaths = isSupportedVideoPath(videoPath)
			? [videoPath]
			: (yield* fileUploadService.findVideosInUploadPath(videoPath))
					.map(normalizeVideoPath)
					.filter((path): path is string => !!path && isSupportedVideoPath(path));

		for (const resolvedPath of resolvedPaths) {
			const exists = yield* fileUploadService.existsUploadPath(resolvedPath);
			if (!exists) continue;

			const format = resolvedPath.split(".").at(-1)?.toLowerCase();
			videos.push({
				format,
				kind: input.kind,
				mimeType: format ? `video/${format}` : undefined,
				path: resolvedPath,
				questionId: input.questionId,
				responseDetailId: input.responseDetailId,
				source: "web",
			});
		}
	});
}

function parseVideoPair(value: unknown): PredictionVideoPair | null {
	if (!value || value === "null") return null;
	if (typeof value === "object") return value as PredictionVideoPair;
	if (typeof value !== "string") return null;

	try {
		const parsed = JSON.parse(value) as unknown;
		if (parsed && typeof parsed === "object")
			return parsed as PredictionVideoPair;
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

function isSupportedVideoPath(videoPath: string) {
	const fileName = videoPath.split("/").at(-1) ?? "";
	const extension = fileName.split(".").at(-1)?.toLowerCase();
	return (
		!!extension &&
		extension !== fileName &&
		SUPPORTED_VIDEO_EXTENSIONS.has(extension)
	);
}
