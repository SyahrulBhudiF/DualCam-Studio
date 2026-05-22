import { Effect } from "effect";
import { FileUploadService, runEffect } from "@/infrastructure";

export const initSegmentedUpload = (data: {
	folderName: string;
	fileName: string;
	size: number;
	contentType: string;
}) =>
	runEffect(
		Effect.gen(function* () {
			const service = yield* FileUploadService.asEffect();
			return yield* service.initSegmentedUpload(data);
		}),
	);

export const uploadSegmentedPart = (data: {
	uploadId: string;
	index: number;
	totalChunks: number;
	chunk: Uint8Array;
}) =>
	runEffect(
		Effect.gen(function* () {
			const service = yield* FileUploadService.asEffect();
			return yield* service.uploadSegmentedPart(data);
		}),
	);

export const finalizeSegmentedUpload = (uploadId: string) =>
	runEffect(
		Effect.gen(function* () {
			const service = yield* FileUploadService.asEffect();
			return yield* service.finalizeSegmentedUpload(uploadId);
		}),
	);

export const cancelSegmentedUpload = (uploadId: string) =>
	runEffect(
		Effect.gen(function* () {
			const service = yield* FileUploadService.asEffect();
			return yield* service.cancelSegmentedUpload(uploadId);
		}),
	);
