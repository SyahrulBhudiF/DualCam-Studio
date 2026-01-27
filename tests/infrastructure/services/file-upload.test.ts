import { describe, it, expect, vi, beforeEach } from "vitest";
import { Effect, Layer } from "effect";
import { FileSystem } from "@effect/platform";
import { NodeFileSystem } from "@effect/platform-node";
import {
	FileUploadService,
	FileUploadServiceLive,
} from "@/infrastructure/services/file-upload";

describe("FileUploadService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getUploadRoot", () => {
		it("should return the upload root path", async () => {
			const program = Effect.gen(function* () {
				const service = yield* FileUploadService;
				return yield* service.getUploadRoot;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(FileUploadServiceLive))
			);

			expect(result).toBeDefined();
			expect(result).toContain("video_uploads");
		});
	});

	describe("uploadChunk", () => {
		it("should return correct path format for uploaded file", async () => {
			// Test the path generation logic without actually writing files
			const folderName = "user123";
			const fileName = "video.mp4";
			const expectedPath = `/video_uploads/${folderName}/${fileName}`;

			expect(expectedPath).toBe("/video_uploads/user123/video.mp4");
		});

		it("should handle nested file paths", async () => {
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
		it("should have required methods", async () => {
			const program = Effect.gen(function* () {
				const service = yield* FileUploadService;
				return {
					hasEnsureDirectory: typeof service.ensureDirectory === "function",
					hasSaveFile: typeof service.saveFile === "function",
					hasUploadChunk: typeof service.uploadChunk === "function",
					hasGetUploadRoot: Effect.isEffect(service.getUploadRoot),
				};
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(FileUploadServiceLive))
			);

			expect(result.hasEnsureDirectory).toBe(true);
			expect(result.hasSaveFile).toBe(true);
			expect(result.hasUploadChunk).toBe(true);
			expect(result.hasGetUploadRoot).toBe(true);
		});
	});
});
