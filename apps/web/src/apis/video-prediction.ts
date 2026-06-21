import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";

const execFileAsync = promisify(execFile);

import { runEffect } from "@/infrastructure/runtime";
import {
	CreateVideoPredictionSchema,
	type PredictVideoRequest,
	PublicVideoPredictionAccessSchema,
	VideoPredictionByIdSchema,
} from "@/infrastructure/schemas/prediction";
import { inputValidator } from "@/infrastructure/schemas/validator";
import { FileUploadService } from "@/infrastructure/services/file-upload";
import { VideoPredictionService } from "@/infrastructure/services/video-prediction";
import { verifyCsrfOrigin } from "@/utils/csrf";
import { requireAuth } from "@/utils/session";

export const createVideoPrediction = createServerFn({ method: "POST" })
	.inputValidator(inputValidator(CreateVideoPredictionSchema))
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				yield* verifyCsrfOrigin;
				const fileUploadService = yield* FileUploadService.asEffect();
				const service = yield* VideoPredictionService.asEffect();
				const videoPath = normalizeVideoPath(data.videoPath);
				const exists = yield* fileUploadService.existsUploadPath(videoPath);
				if (!exists) throw new Error("Video tidak ditemukan");
				const playbackVideoPath = yield* createPlaybackVideoPath(
					fileUploadService,
					videoPath,
					data.mimeType,
				);
				return yield* service.createPending({
					...data,
					playbackVideoPath,
					videoPath,
				});
			}).pipe(
				Effect.catchCause((cause) =>
					Effect.logError("Create video prediction failed", cause).pipe(
						Effect.flatMap(() => Effect.failCause(cause)),
					),
				),
			),
		);
	});

export const getPublicVideoPrediction = createServerFn({ method: "GET" })
	.inputValidator(inputValidator(PublicVideoPredictionAccessSchema))
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* VideoPredictionService.asEffect();
				return yield* service.getPublicById(data.predictionId, data.token);
			}),
		);
	});

export const listAdminVideoPredictions = createServerFn({
	method: "GET",
}).handler(async () => {
	return runEffect(
		Effect.gen(function* () {
			yield* requireAuth;
			const service = yield* VideoPredictionService.asEffect();
			return yield* service.listAdmin();
		}),
	);
});

export const getAdminVideoPrediction = createServerFn({ method: "GET" })
	.inputValidator(inputValidator(VideoPredictionByIdSchema))
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				yield* requireAuth;
				const service = yield* VideoPredictionService.asEffect();
				return yield* service.getAdminById(data.predictionId);
			}),
		);
	});

export const runVideoPrediction = createServerFn({ method: "POST" })
	.inputValidator(inputValidator(VideoPredictionByIdSchema))
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				yield* verifyCsrfOrigin;
				const service = yield* VideoPredictionService.asEffect();
				const prediction = yield* service.getInternalById(data.predictionId);
				if (!prediction) throw new Error("Prediksi tidak ditemukan");

				const request: PredictVideoRequest = {
					predictionId: prediction.id,
					video: {
						format: prediction.videoFormat ?? undefined,
						kind: "main",
						mimeType: prediction.videoMimeType ?? undefined,
						path: prediction.videoPath,
						questionId: "single",
						sizeBytes: prediction.videoSizeBytes ?? undefined,
						source: "web",
					},
				};

				void runEffect(
					service
						.predictVideo(request)
						.pipe(
							Effect.catchCause((cause) =>
								Effect.logError(
									"Video prediction background execution failed",
									cause,
								),
							),
						),
				);

				return { accepted: true, prediction };
			}),
		);
	});

function createPlaybackVideoPath(
	fileUploadService: {
		getUploadRoot: () => Effect.Effect<string, unknown>;
	},
	videoPath: string,
	mimeType: string | undefined,
) {
	const extension = path.extname(videoPath).toLowerCase();
	if (mimeType === "video/mp4" || mimeType === "video/webm") {
		return Effect.succeed(videoPath);
	}
	if (extension === ".mp4" || extension === ".webm") {
		return Effect.succeed(videoPath);
	}

	return Effect.gen(function* () {
		const uploadRoot = yield* fileUploadService.getUploadRoot();
		const sourcePath = path.resolve(uploadRoot, videoPath);
		const relativeSource = path.relative(uploadRoot, sourcePath);
		if (relativeSource.startsWith("..") || path.isAbsolute(relativeSource)) {
			throw new Error("Path video tidak valid");
		}

		const parsed = path.parse(relativeSource);
		const playbackRelativePath = path.join(
			parsed.dir,
			`${parsed.name}.playback.mp4`,
		);
		const playbackPath = path.resolve(uploadRoot, playbackRelativePath);
		if (!existsSync(playbackPath)) {
			yield* Effect.tryPromise({
				try: () =>
					execFileAsync("ffmpeg", [
						"-y",
						"-i",
						sourcePath,
						"-c:v",
						"libx264",
						"-pix_fmt",
						"yuv420p",
						"-c:a",
						"aac",
						"-movflags",
						"+faststart",
						playbackPath,
					]),
				catch: (error) => error,
			});
		}

		return playbackRelativePath.split(path.sep).join("/");
	});
}

function normalizeVideoPath(videoPath: string) {
	let cleanPath = videoPath.trim();
	while (cleanPath.startsWith("/")) cleanPath = cleanPath.slice(1);
	if (cleanPath.startsWith("video_uploads/")) {
		cleanPath = cleanPath.slice("video_uploads/".length);
	}
	if (
		!cleanPath ||
		cleanPath.startsWith("/") ||
		cleanPath.includes("\\") ||
		cleanPath.split("/").some((part) => !part || part === "." || part === "..")
	) {
		throw new Error("Path video tidak valid");
	}
	return cleanPath;
}
