import { afterEach, describe, expect, it, vi } from "vitest";
import * as uploadApi from "@/apis/upload";
import { createUploadQueue } from "@/libs/upload-queue";

describe("createUploadQueue", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("uploads jobs concurrently and finalizes paths", async () => {
		vi.spyOn(uploadApi, "getChunkSize").mockReturnValue(2);
		vi.spyOn(uploadApi, "initUpload").mockImplementation(async (input) => ({
			uploadId: `${input.fileName}-id`,
			chunkSize: 2,
			totalChunks: Math.ceil(input.size / 2),
		}));
		const chunks: Array<string> = [];
		vi.spyOn(uploadApi, "uploadChunk").mockImplementation(async (input) => {
			chunks.push(
				`${input.uploadId}:${input.index}:${await input.chunk.text()}`,
			);
			return { success: true };
		});
		vi.spyOn(uploadApi, "finalizeUpload").mockImplementation(
			async (uploadId) => ({
				success: true,
				path: `/video_uploads/${uploadId}.webm`,
			}),
		);
		vi.spyOn(uploadApi, "cancelUpload").mockResolvedValue(undefined);

		const states: Array<{ pending: number; running: number }> = [];
		const queue = await createUploadQueue({
			maxJobs: 2,
			concurrency: 2,
			onState: (state) =>
				states.push({ pending: state.pending, running: state.running }),
		});

		await queue.enqueue({
			questionId: "q1",
			folderName: "segmented/u",
			fileName: "q1/main.webm",
			blob: new Blob(["abcd"], { type: "video/webm" }),
		});
		await queue.enqueue({
			questionId: "q2",
			folderName: "segmented/u",
			fileName: "q2/main.webm",
			blob: new Blob(["efgh"], { type: "video/webm" }),
		});

		const result = await queue.waitForIdle();
		await queue.shutdown();

		expect(result.completed).toEqual({
			q1: "/video_uploads/q1/main.webm-id.webm",
			q2: "/video_uploads/q2/main.webm-id.webm",
		});
		expect(result.failed).toEqual({});
		expect(chunks).toEqual(
			expect.arrayContaining([
				"q1/main.webm-id:0:ab",
				"q1/main.webm-id:1:cd",
				"q2/main.webm-id:0:ef",
				"q2/main.webm-id:1:gh",
			]),
		);
		expect(states.some((state) => state.running === 2)).toBe(true);
	});

	it("marks failed jobs and cancels upload session", async () => {
		vi.spyOn(uploadApi, "getChunkSize").mockReturnValue(2);
		vi.spyOn(uploadApi, "initUpload").mockResolvedValue({
			uploadId: "failed-id",
			chunkSize: 2,
			totalChunks: 1,
		});
		vi.spyOn(uploadApi, "uploadChunk").mockRejectedValue(
			new Error("network down"),
		);
		vi.spyOn(uploadApi, "finalizeUpload").mockResolvedValue({
			success: true,
			path: "/unused",
		});
		const cancelUpload = vi
			.spyOn(uploadApi, "cancelUpload")
			.mockResolvedValue(undefined);

		const queue = await createUploadQueue({
			maxJobs: 1,
			concurrency: 1,
			onState: () => {},
		});

		await queue.enqueue({
			questionId: "q1",
			folderName: "segmented/u",
			fileName: "q1/main.webm",
			blob: new Blob(["ab"], { type: "video/webm" }),
		});

		const result = await queue.waitForIdle();
		await queue.shutdown();

		expect(result.completed).toEqual({});
		expect(result.failed.q1).toBeTruthy();
		expect(cancelUpload).toHaveBeenCalledWith("failed-id");
	});
});
