import type {
	getFilterOptions,
	getResponseById,
	getResponses,
} from "@/apis/admin/responses";

export type ResponseListItem = Awaited<ReturnType<typeof getResponses>>[number];

export type ResponseDetail = Awaited<ReturnType<typeof getResponseById>>;

export type FilterOptions = Awaited<ReturnType<typeof getFilterOptions>>;

export type ResponseProfile = {
	id: string;
	name: string | null;
	class: string | null;
	email: string | null;
	nim: string | null;
	semester: string | null;
	gender: string | null;
	age: number | null;
};

export type ResponseDetailItem = {
	id: string;
	questionId: string;
	answerId: string;
	score: number;
	videoSegmentPath: string | null;
	questionText: string | null;
	orderNumber: number | null;
	answerText: string | null;
	maxScore: number | null;
};

export type VideoPath = {
	main: string | null;
	secondary: string | null;
};

export type SegmentedVideoPath = {
	questionId: string;
	questionNumber: number;
	main: string | null;
	secondary: string | null;
};

export type VideoData = {
	mode: "full" | "segmented";
	fullVideo?: VideoPath;
	segmentedVideos?: SegmentedVideoPath[];
};
