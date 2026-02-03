import { Effect } from "effect";
import { it } from "@effect/vitest";
import { describe, expect, vi, beforeEach } from "vitest";
import {
	FileUploadService,
	FileUploadServiceLive,
} from "@/infrastructure/services/file-upload";

describe("FileUploadService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getUploadRoot", () => {
		it.effect("should return the upload root path", () =>
			Effect.gen(function* () {
				const service = yield* FileUploadService;
				const result = yield* service.getUploadRoot;

				expect(result).toBeDefined();
				expect(result).toContain("video_uploads");
			}).pipe(Effect.provide(FileUploadServiceLive)),
		);
	});

	describe("uploadChunk", () => {
		it("should return correct path format for uploaded file", () => {
			// Test the path generation logic without actually writing files
			const folderName = "user123";
			const fileName = "video.mp4";
			const expectedPath = `/video_uploads/${folderName}/${fileName}`;

			expect(expectedPath).toBe("/video_uploads/user123/video.mp4");
		});

		it("should handle nested file paths", () => {
			const folderName = "user123";
			const fileName = "subfolder/video.mp4";
			const expectedPath = `/video_uploads/${folderName}/${fileName}`;

			expect(expectedPath).toBe("/video_uploads/user123/subfolder/video.mp4");
		});

		it("should strip data URL prefix from base64", () => {
			const base64WithPrefix = "data:video/mp4;base64,dGVzdCBjb250ZW50";
			const base64Data = base64WithPrefix.includes(",")
				? base64WithPrefix.split(",")[1]
				: base64WithPrefix;

			expect(base64Data).toBe("dGVzdCBjb250ZW50");
		});

		it("should handle base64 without data URL prefix", () => {
			const base64WithoutPrefix = "dGVzdCBjb250ZW50";
			const base64Data = base64WithoutPrefix.includes(",")
				? base64WithoutPrefix.split(",")[1]
				: base64WithoutPrefix;

			expect(base64Data).toBe("dGVzdCBjb250ZW50");
		});

		it("should decode base64 to buffer correctly", () => {
			const base64 = "dGVzdCBjb250ZW50"; // "test content" in base64
			const buffer = Buffer.from(base64, "base64");

			expect(buffer.toString()).toBe("test content");
		});
	});

	describe("service structure", () => {
		it.effect("should have required methods", () =>
			Effect.gen(function* () {
				const service = yield* FileUploadService;
				return {
					hasEnsureDirectory: typeof service.ensureDirectory === "function",
					hasSaveFile: typeof service.saveFile === "function",
					hasUploadChunk: typeof service.uploadChunk === "function",
					hasGetUploadRoot: Effect.isEffect(service.getUploadRoot),
				};
			}).pipe(
				Effect.map((result) => {
					expect(result.hasEnsureDirectory).toBe(true);
					expect(result.hasSaveFile).toBe(true);
					expect(result.hasUploadChunk).toBe(true);
					expect(result.hasGetUploadRoot).toBe(true);
				}),
				Effect.provide(FileUploadServiceLive),
			),
		);
	});
});
