import type { ResponseDetail as ResponseDetailType } from "./responses.types";

export type VideoManifestItem = {
	questionId: string;
	questionNumber: number;
	videos: Array<{
		kind: "main" | "secondary";
		path: string;
	}>;
};

export type VideoManifest = {
	responseId: string;
	mode: "full" | "segmented";
	root: "video_uploads";
	items: VideoManifestItem[];
};

type VideoPair = {
	main?: unknown;
	secondary?: unknown;
};

const VIDEO_EXTENSIONS = new Set([
	"3g2",
	"3gp",
	"avi",
	"flv",
	"m4v",
	"mkv",
	"mov",
	"mp4",
	"mpeg",
	"mpg",
	"ogv",
	"ts",
	"webm",
	"wmv",
]);

export function toVideoApiUrl(videoPath: string | null): string | null {
	const normalized = normalizeVideoPath(videoPath);
	return normalized ? `/api/video/${normalized}` : null;
}

export function normalizeVideoPath(videoPath: string | null): string | null {
	if (!videoPath || videoPath === "null") return null;

	let cleanPath = videoPath.trim();
	if (!cleanPath) return null;

	while (cleanPath.startsWith("/")) {
		cleanPath = cleanPath.slice(1);
	}

	if (cleanPath.startsWith("video_uploads/")) {
		cleanPath = cleanPath.slice("video_uploads/".length);
	}

	if (!isValidVideoPath(cleanPath)) return null;

	return cleanPath;
}

function isValidVideoPath(videoPath: string): boolean {
	if (!videoPath || videoPath.startsWith("/") || videoPath.includes("\\")) {
		return false;
	}

	const parts = videoPath.split("/");
	if (parts.some((part) => !part || part === "." || part === "..")) {
		return false;
	}

	const fileName = parts.at(-1);
	const extension = fileName?.split(".").at(-1)?.toLowerCase();

	return !!extension && VIDEO_EXTENSIONS.has(extension);
}

function parseVideoPair(value: string | null): VideoPair | null {
	if (!value || value === "null") return null;

	try {
		const parsed = JSON.parse(value) as unknown;
		if (parsed && typeof parsed === "object") return parsed as VideoPair;
	} catch {
		return { main: value };
	}

	return null;
}

function addVideo(
	videos: VideoManifestItem["videos"],
	kind: "main" | "secondary",
	path: unknown,
) {
	if (typeof path !== "string") return;

	const normalized = normalizeVideoPath(path);
	if (!normalized) return;

	videos.push({ kind, path: normalized });
}

export function createVideoManifest(
	response: Pick<ResponseDetailType, "id" | "videoPath" | "details">,
): VideoManifest {
	const items: VideoManifestItem[] = [];
	const details = response.details.toSorted(
		(a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0),
	);

	for (const [index, detail] of details.entries()) {
		const videos: VideoManifestItem["videos"] = [];
		const pair = parseVideoPair(detail.videoSegmentPath);

		addVideo(videos, "main", pair?.main);
		addVideo(videos, "secondary", pair?.secondary);

		if (videos.length > 0) {
			items.push({
				questionId: detail.questionId,
				questionNumber: detail.orderNumber ?? index + 1,
				videos,
			});
		}
	}

	if (items.length > 0) {
		return {
			responseId: response.id,
			mode: "segmented",
			root: "video_uploads",
			items,
		};
	}

	const pair = parseVideoPair(response.videoPath);
	const videos: VideoManifestItem["videos"] = [];
	addVideo(videos, "main", pair?.main);
	addVideo(videos, "secondary", pair?.secondary);

	return {
		responseId: response.id,
		mode: "full",
		root: "video_uploads",
		items:
			videos.length > 0
				? [
						{
							questionId: "full",
							questionNumber: 0,
							videos,
						},
					]
				: [],
	};
}
