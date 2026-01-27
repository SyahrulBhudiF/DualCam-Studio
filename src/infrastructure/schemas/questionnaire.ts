import { Schema } from "@effect/schema";

export const UUID = Schema.String.pipe(
	Schema.pattern(
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
	),
);

// Create questionnaire
export const CreateQuestionnaireSchema = Schema.Struct({
	title: Schema.String.pipe(Schema.minLength(1)),
	description: Schema.optional(Schema.NullOr(Schema.String)),
	is_active: Schema.optionalWith(Schema.Boolean, { default: () => false }),
});

// Update questionnaire
export const UpdateQuestionnaireSchema = Schema.Struct({
	id: UUID,
	title: Schema.optional(Schema.String),
	description: Schema.optional(Schema.NullOr(Schema.String)),
	is_active: Schema.optional(Schema.Boolean),
});

// Create question
export const CreateQuestionSchema = Schema.Struct({
	questionnaire_id: UUID,
	question_text: Schema.String.pipe(Schema.minLength(1)),
	order_number: Schema.optionalWith(Schema.Number, { default: () => 0 }),
});

// Update question
export const UpdateQuestionSchema = Schema.Struct({
	id: UUID,
	question_text: Schema.optional(Schema.String),
	order_number: Schema.optional(Schema.Number),
});

// Create answer
export const CreateAnswerSchema = Schema.Struct({
	question_id: UUID,
	answer_text: Schema.String.pipe(Schema.minLength(1)),
	score: Schema.optionalWith(Schema.Number, { default: () => 0 }),
});

// Update answer
export const UpdateAnswerSchema = Schema.Struct({
	id: UUID,
	answer_text: Schema.optional(Schema.String),
	score: Schema.optional(Schema.Number),
});

// Bulk delete
export const BulkDeleteSchema = Schema.Struct({
	ids: Schema.Array(UUID),
});

// Submission schema (for public questionnaire submission)
export const SubmissionSchema = Schema.Struct({
	userEmail: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
	userName: Schema.String,
	userClass: Schema.String,
	userSemester: Schema.String,
	userGender: Schema.String,
	userAge: Schema.Number,
	userNim: Schema.String,
	questionnaireId: Schema.String,
	videoBase64Main: Schema.optional(Schema.String),
	videoBase64Secondary: Schema.optional(Schema.String),
	answers: Schema.Record({ key: Schema.String, value: Schema.String }),
	folderName: Schema.String,
});

// Final submit schema (for segmented upload)
export const FinalSubmitSchema = Schema.Struct({
	userEmail: Schema.String.pipe(Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
	userName: Schema.String,
	userClass: Schema.String,
	userSemester: Schema.String,
	userGender: Schema.String,
	userAge: Schema.Number,
	userNim: Schema.String,
	questionnaireId: Schema.String,
	folderName: Schema.String,
	answers: Schema.Array(
		Schema.Struct({
			questionId: Schema.String,
			answerId: Schema.String,
			videoMainPath: Schema.String,
			videoSecPath: Schema.String,
		}),
	),
});

// Upload chunk schema
export const UploadChunkSchema = Schema.Struct({
	folderName: Schema.String,
	fileName: Schema.String,
	fileBase64: Schema.String,
});

// Inferred types
export type CreateQuestionnaire = Schema.Schema.Type<
	typeof CreateQuestionnaireSchema
>;
export type UpdateQuestionnaire = Schema.Schema.Type<
	typeof UpdateQuestionnaireSchema
>;
export type CreateQuestion = Schema.Schema.Type<typeof CreateQuestionSchema>;
export type UpdateQuestion = Schema.Schema.Type<typeof UpdateQuestionSchema>;
export type CreateAnswer = Schema.Schema.Type<typeof CreateAnswerSchema>;
export type UpdateAnswer = Schema.Schema.Type<typeof UpdateAnswerSchema>;
export type BulkDelete = Schema.Schema.Type<typeof BulkDeleteSchema>;
export type Submission = Schema.Schema.Type<typeof SubmissionSchema>;
export type FinalSubmit = Schema.Schema.Type<typeof FinalSubmitSchema>;
export type UploadChunk = Schema.Schema.Type<typeof UploadChunkSchema>;

// Decode functions
export const decodeCreateQuestionnaire = Schema.decodeUnknownSync(
	CreateQuestionnaireSchema,
);
export const decodeUpdateQuestionnaire = Schema.decodeUnknownSync(
	UpdateQuestionnaireSchema,
);
export const decodeCreateQuestion =
	Schema.decodeUnknownSync(CreateQuestionSchema);
export const decodeUpdateQuestion =
	Schema.decodeUnknownSync(UpdateQuestionSchema);
export const decodeCreateAnswer = Schema.decodeUnknownSync(CreateAnswerSchema);
export const decodeUpdateAnswer = Schema.decodeUnknownSync(UpdateAnswerSchema);
export const decodeBulkDelete = Schema.decodeUnknownSync(BulkDeleteSchema);
export const decodeSubmission = Schema.decodeUnknownSync(SubmissionSchema);
export const decodeFinalSubmit = Schema.decodeUnknownSync(FinalSubmitSchema);
export const decodeUploadChunk = Schema.decodeUnknownSync(UploadChunkSchema);
