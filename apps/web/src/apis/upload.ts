const CHUNK_SIZE = 4 * 1024 * 1024;

export type UploadInitInput = {
	folderName: string;
	fileName: string;
	size: number;
	contentType: string;
};

export type UploadSession = {
	uploadId: string;
	chunkSize: number;
	totalChunks: number;
};

export type UploadResult = {
	success: boolean;
	path: string;
};

const parseJson = async <T>(response: Response): Promise<T> => {
	if (response.ok) return response.json() as Promise<T>;
	throw new Error(await response.text());
};

export async function initUpload(input: UploadInitInput, signal?: AbortSignal) {
	const response = await fetch("/api/upload/segmented/init", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
		signal,
	});
	return parseJson<UploadSession>(response);
}

export async function uploadChunk(
	input: {
		uploadId: string;
		index: number;
		totalChunks: number;
		chunk: Blob;
	},
	signal?: AbortSignal,
) {
	const response = await fetch(
		`/api/upload/segmented/chunk?uploadId=${encodeURIComponent(input.uploadId)}&index=${input.index}&totalChunks=${input.totalChunks}`,
		{
			method: "PUT",
			body: input.chunk,
			signal,
		},
	);
	return parseJson<{ success: boolean }>(response);
}

export async function finalizeUpload(uploadId: string, signal?: AbortSignal) {
	const response = await fetch("/api/upload/segmented/finalize", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ uploadId }),
		signal,
	});
	return parseJson<UploadResult>(response);
}

export async function cancelUpload(uploadId: string, signal?: AbortSignal) {
	await fetch(`/api/upload/segmented/${encodeURIComponent(uploadId)}`, {
		method: "DELETE",
		signal,
	});
}

export function getChunkSize() {
	return CHUNK_SIZE;
}
