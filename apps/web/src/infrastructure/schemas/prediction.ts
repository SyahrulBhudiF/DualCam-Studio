import { Schema } from "effect";

export const PredictionHealthSchema = Schema.Struct({
	status: Schema.String,
	version: Schema.String,
});

export const PredictionByResponseSchema = Schema.Struct({
	responseId: Schema.String,
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

export const PredictionVideoRefSchema = Schema.Struct({
	questionId: Schema.String,
	kind: Schema.String,
	path: Schema.String,
	format: Schema.optional(Schema.String),
	mimeType: Schema.optional(Schema.String),
	sizeBytes: Schema.optional(Schema.Number),
	source: Schema.optional(Schema.String),
	createdAt: Schema.optional(Schema.String),
});

export const PredictQuizRequestSchema = Schema.Struct({
	responseId: Schema.String,
	participantId: Schema.String,
	videos: Schema.Array(PredictionVideoRefSchema),
});

export const PredictionResultSchema = Schema.Struct({
	questionId: Schema.String,
	videoKind: Schema.String,
	label: Schema.String,
	probabilityAnxietyTinggi: Schema.Number,
	frameCount: Schema.Number,
	durationSeconds: Schema.Number,
	status: Schema.String,
	errorMessage: Schema.String,
});

export const PredictQuizResponseSchema = Schema.Struct({
	responseId: Schema.String,
	modelVersion: Schema.String,
	expName: Schema.String,
	threshold: Schema.Number,
	aggregation: Schema.String,
	results: Schema.Array(PredictionResultSchema),
});

export type PredictionByResponse = Schema.Schema.Type<
	typeof PredictionByResponseSchema
>;
export type PredictionHealth = Schema.Schema.Type<typeof PredictionHealthSchema>;
export type PredictionVideoRef = Schema.Schema.Type<
	typeof PredictionVideoRefSchema
>;
export type PredictQuizRequest = Schema.Schema.Type<
	typeof PredictQuizRequestSchema
>;
export type PredictionResult = Schema.Schema.Type<typeof PredictionResultSchema>;
export type PredictQuizResponse = Schema.Schema.Type<
	typeof PredictQuizResponseSchema
>;
