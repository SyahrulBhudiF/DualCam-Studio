import { afterEach, describe, expect, it, vi } from "vitest";
import { uploadChunks } from "@/apis/upload";

describe("uploadChunks", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("uploads chunks with bounded concurrency", async () => {
		let active = 0;
		let maxActive = 0;
		const order: number[] = [];
		const progress: number[] = [];
		vi.stubGlobal(
			"fetch",
			vi.fn(async (input: RequestInfo | URL) => {
				const url = String(input);
				const index = Number(new URL(url, "http://localhost").searchParams.get("index"));
				active += 1;
				maxActive = Math.max(maxActive, active);
				order.push(index);
				await new Promise((resolve) => setTimeout(resolve, 10));
				active -= 1;
				return new Response(JSON.stringify({ success: true }), { status: 200 });
			}),
		);

		await uploadChunks({
			concurrency: 3,
			file: new File(["abcdefghijkl"], "video.webm", { type: "video/webm" }),
			onProgress: (value) => progress.push(value),
			session: { chunkSize: 2, totalChunks: 6, uploadId: "upload-1" },
		});

		expect(maxActive).toBe(3);
		expect(order).toHaveLength(6);
		expect(progress.at(-1)).toBe(100);
		expect(progress).toEqual(expect.arrayContaining([17, 33, 50, 67, 83, 100]));
	});
});
