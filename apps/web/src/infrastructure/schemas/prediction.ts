import { Schema } from "effect";

const PredictionHealthSchema = Schema.Struct({
	status: Schema.String,
	version: Schema.String,
});

export const PredictionByResponseSchema = Schema.Struct({
	responseId: Schema.String,
});

export const VideoPredictionByIdSchema = Schema.Struct({
	predictionId: Schema.String,
});

export const PublicVideoPredictionAccessSchema = Schema.Struct({
	predictionId: Schema.String,
	token: Schema.String,
});

export const CreateVideoPredictionSchema = Schema.Struct({
	videoPath: Schema.String,
	playbackVideoPath: Schema.optional(Schema.String),
	format: Schema.optional(Schema.String),
	mimeType: Schema.optional(Schema.String),
	sizeBytes: Schema.optional(Schema.Number),
});

export const PublicPredictionByResponseSchema = Schema.Struct({
	responseId: Schema.String,
	token: Schema.String,
});

export type ResponseForPrediction = {
	id: string;
	userId: string;
	videoPath: string | null;
	details: ReadonlyArray<{
		id: string;
		questionId: string;
		videoSegmentPath: unknown;
	}>;
};

export type PredictionVideoPair = {
	main?: unknown;
	secondary?: unknown;
};

const PredictionVideoRefSchema = Schema.Struct({
	questionId: Schema.String,
	kind: Schema.String,
	path: Schema.String,
	format: Schema.optional(Schema.String),
	mimeType: Schema.optional(Schema.String),
	sizeBytes: Schema.optional(Schema.Number),
	source: Schema.optional(Schema.String),
	createdAt: Schema.optional(Schema.String),
});

const PredictQuizRequestSchema = Schema.Struct({
	responseId: Schema.String,
	participantId: Schema.String,
	videos: Schema.Array(PredictionVideoRefSchema),
});

const PredictVideoRequestSchema = Schema.Struct({
	predictionId: Schema.String,
	video: PredictionVideoRefSchema,
});

const PredictionResultSchema = Schema.Struct({
	questionId: Schema.String,
	videoKind: Schema.String,
	label: Schema.String,
	probabilityAnxietyTinggi: Schema.Number,
	threshold: Schema.Number,
	frameCount: Schema.Number,
	durationSeconds: Schema.Number,
	status: Schema.String,
	errorMessage: Schema.String,
	path: Schema.String,
});

const PredictQuizResponseSchema = Schema.Struct({
	responseId: Schema.String,
	modelVersion: Schema.String,
	expName: Schema.String,
	threshold: Schema.Number,
	aggregation: Schema.String,
	results: Schema.Array(PredictionResultSchema),
});

const VideoPredictionFinalSchema = Schema.Struct({
	label: Schema.String,
	probabilityAnxietyTinggi: Schema.Number,
	frameCount: Schema.Number,
	durationSeconds: Schema.Number,
	fps: Schema.Number,
	status: Schema.String,
	errorMessage: Schema.String,
	path: Schema.String,
});

const VideoPredictionEventSchema = Schema.Struct({
	eventNo: Schema.Number,
	onsetFrame: Schema.Number,
	apexFrame: Schema.Number,
	offsetFrame: Schema.Number,
	onsetTimeSeconds: Schema.Number,
	apexTimeSeconds: Schema.Number,
	offsetTimeSeconds: Schema.Number,
	durationFrames: Schema.Number,
	durationSeconds: Schema.Number,
	probabilityAnxietyTinggi: Schema.Number,
	label: Schema.String,
});

const SpottingSignalPointSchema = Schema.Struct({
	frameIndex: Schema.Number,
	signalIndex: Schema.Number,
	timeSeconds: Schema.Number,
	rawMagnitude: Schema.Number,
	smoothedMagnitude: Schema.Number,
	eventNo: Schema.Number,
	eventMarker: Schema.String,
});

const SpottingSignalSchema = Schema.Struct({
	fps: Schema.Number,
	heightThreshold: Schema.Number,
	points: Schema.Array(SpottingSignalPointSchema),
});

const PredictVideoResponseSchema = Schema.Struct({
	predictionId: Schema.String,
	modelVersion: Schema.String,
	expName: Schema.String,
	threshold: Schema.Number,
	aggregation: Schema.String,
	finalPrediction: VideoPredictionFinalSchema,
	frames: Schema.Array(Schema.Unknown),
	events: Schema.Array(VideoPredictionEventSchema),
	spottingSignal: Schema.optional(SpottingSignalSchema),
});

export type PredictionByResponse = Schema.Schema.Type<
	typeof PredictionByResponseSchema
>;
export type VideoPredictionById = Schema.Schema.Type<
	typeof VideoPredictionByIdSchema
>;
export type PublicVideoPredictionAccess = Schema.Schema.Type<
	typeof PublicVideoPredictionAccessSchema
>;
export type CreateVideoPrediction = Schema.Schema.Type<
	typeof CreateVideoPredictionSchema
>;
export type PublicPredictionByResponse = Schema.Schema.Type<
	typeof PublicPredictionByResponseSchema
>;
export type PredictionHealth = Schema.Schema.Type<
	typeof PredictionHealthSchema
>;
export type PredictionVideoRef = Schema.Schema.Type<
	typeof PredictionVideoRefSchema
>;
export type PredictQuizRequest = Schema.Schema.Type<
	typeof PredictQuizRequestSchema
>;
export type PredictVideoRequest = Schema.Schema.Type<
	typeof PredictVideoRequestSchema
>;
export type PredictionResult = Schema.Schema.Type<
	typeof PredictionResultSchema
>;
export type PredictQuizResponse = Schema.Schema.Type<
	typeof PredictQuizResponseSchema
>;
export type VideoPredictionFinal = Schema.Schema.Type<
	typeof VideoPredictionFinalSchema
>;
export type VideoPredictionEvent = Schema.Schema.Type<
	typeof VideoPredictionEventSchema
>;
export type SpottingSignal = Schema.Schema.Type<typeof SpottingSignalSchema>;
export type PredictVideoResponse = Schema.Schema.Type<
	typeof PredictVideoResponseSchema
>;
