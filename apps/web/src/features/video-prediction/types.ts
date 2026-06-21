import type { getPublicVideoPrediction } from "@/apis/video-prediction";

export type ViewerMode =
	| { kind: "public"; predictionId: string; token: string }
	| { kind: "admin"; predictionId: string };

export type Prediction = NonNullable<
	Awaited<ReturnType<typeof getPublicVideoPrediction>>
>;

export type ClipEvent = {
	eventNo: number;
	onsetTimeSeconds: number | null;
	apexTimeSeconds: number | null;
	offsetTimeSeconds: number | null;
	[key: string]: unknown;
};

export type FullEvent = ClipEvent & {
	onsetFrame: number;
	apexFrame: number;
	offsetFrame: number;
	durationFrames: number;
	durationSeconds: number | null;
	id: string;
	predictionId: string;
	probabilityAnxietyTinggi: number;
	label: string;
};

export type Point = {
	frameIndex: number;
	signalIndex: number;
	timeSeconds: number;
	rawMagnitude: number;
	smoothedMagnitude: number;
	eventNo: number;
	eventMarker: string;
};

export type Signal = {
	fps: number;
	heightThreshold: number;
	points: ReadonlyArray<Point>;
};

export type PlotPoint = Point & {
	event: ClipEvent | null;
};

export type ChartClick = {
	activePayload?: Array<{ payload?: PlotPoint }>;
};

export type BoolRef = { current: boolean };

export type MediaTimeStore = {
	getSnapshot: () => number;
	setCurrentTime: (nextTime: number) => void;
	subscribe: (listener: () => void) => () => void;
};

export type Player = {
	currentTime: number;
	duration: number;
	paused?: boolean;
	pause: () => Promise<void> | void;
	addEventListener?: (
		type: "seeked",
		listener: () => void,
		options?: { once?: boolean },
	) => void;
};

export type SeekEvent = {
	onsetTimeSeconds: number | null;
	apexTimeSeconds: number | null;
};
