import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NodeFileSystem } from "@effect/platform-node";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { beforeEach, describe, expect } from "vitest";
import { FileUploadService } from "@/infrastructure/services/file-upload";

const serviceLayer = FileUploadService.layer.pipe(
	Layer.provide(NodeFileSystem.layer),
);

describe("FileUploadService resumable upload", () => {
	beforeEach(() => {
		process.env.UPLOAD_ROOT = join(
			mkdtempSync(join(tmpdir(), "quis-resumable-")),
			"video_uploads",
		);
	});

	it.effect("assembles uploaded chunks and returns public path", () =>
		Effect.gen(function* () {
			const service = yield* FileUploadService.asEffect();
			const session = yield* service.initSegmentedUpload({
				folderName: "segmented/user_1",
				fileName: "q1/main.webm",
				size: 5 * 1024 * 1024,
				contentType: "video/webm",
			});

			yield* service.uploadSegmentedPart({
				uploadId: session.uploadId,
				index: 0,
				totalChunks: session.totalChunks,
				chunk: new TextEncoder().encode("hello"),
			});
			yield* service.uploadSegmentedPart({
				uploadId: session.uploadId,
				index: 1,
				totalChunks: session.totalChunks,
				chunk: new TextEncoder().encode("world"),
			});

			const result = yield* service.finalizeSegmentedUpload(session.uploadId);
			expect(result.path).toBe("/video_uploads/segmented/user_1/q1/main.webm");
			expect(
				readFileSync(
					join(
						process.env.UPLOAD_ROOT as string,
						"segmented/user_1/q1/main.webm",
					),
					"utf8",
				),
			).toBe("helloworld");
			expect(
				existsSync(
					join(
						process.env.UPLOAD_ROOT as string,
						".tmp/segmented",
						session.uploadId,
					),
				),
			).toBe(false);
		}).pipe(Effect.provide(serviceLayer)),
	);

	it.effect("rejects path traversal", () =>
		Effect.gen(function* () {
			const service = yield* FileUploadService.asEffect();
			const exit = yield* Effect.exit(
				service.initSegmentedUpload({
					folderName: "../bad",
					fileName: "main.webm",
					size: 1,
					contentType: "video/webm",
				}),
			);
			expect(exit._tag).toBe("Failure");
		}).pipe(Effect.provide(serviceLayer)),
	);

	it.effect("cancel removes the upload session", () =>
		Effect.gen(function* () {
			const service = yield* FileUploadService.asEffect();
			const session = yield* service.initSegmentedUpload({
				folderName: "segmented/user_1",
				fileName: "q1/main.webm",
				size: 1,
				contentType: "video/webm",
			});

			yield* service.cancelSegmentedUpload(session.uploadId);
			expect(
				existsSync(
					join(
						process.env.UPLOAD_ROOT as string,
						".tmp/segmented",
						session.uploadId,
					),
				),
			).toBe(false);
		}).pipe(Effect.provide(serviceLayer)),
	);
});
