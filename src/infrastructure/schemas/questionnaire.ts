import { Schema } from "effect";

// Common UUID schema
export const UUID = Schema.UUID;

// ============================================
// Questionnaire Schemas
// ============================================

export const CreateQuestionnaireSchema = Schema.Struct({
	title: Schema.String.pipe(Schema.minLength(1)),
	description: Schema.optional(Schema.NullOr(Schema.String)),
	isActive: Schema.optional(Schema.Boolean),
});

export const UpdateQuestionnaireSchema = Schema.Struct({
	id: UUID,
	title: Schema.optional(Schema.String),
	description: Schema.optional(Schema.NullOr(Schema.String)),
	isActive: Schema.optional(Schema.Boolean),
});

// ============================================
// Question Schemas
// ============================================

export const CreateQuestionSchema = Schema.Struct({
	questionnaireId: UUID,
	questionText: Schema.String.pipe(Schema.minLength(1)),
	orderNumber: Schema.Number,
});

export const UpdateQuestionSchema = Schema.Struct({
	id: UUID,
	questionText: Schema.optional(Schema.String),
	orderNumber: Schema.optional(Schema.Number),
});

// ============================================
// Answer Schemas
// ============================================

export const CreateAnswerSchema = Schema.Struct({
	questionId: UUID,
	answerText: Schema.String.pipe(Schema.minLength(1)),
	score: Schema.Number,
});

export const UpdateAnswerSchema = Schema.Struct({
	id: UUID,
	answerText: Schema.optional(Schema.String),
	score: Schema.optional(Schema.Number),
});

// ============================================
// Bulk Delete Schema
// ============================================

export const BulkDeleteSchema = Schema.Struct({
	ids: Schema.mutable(Schema.Array(UUID)),
});

// ============================================
// Submission Schemas (Public questionnaire)
// ============================================

export const SubmissionSchema = Schema.Struct({
	questionnaireId: UUID,
	userEmail: Schema.String,
	userName: Schema.String,
	userClass: Schema.String,
	answers: Schema.Record({ key: Schema.String, value: UUID }),
	folderName: Schema.String,
	videoBase64Main: Schema.optional(Schema.String),
	videoBase64Secondary: Schema.optional(Schema.String),
});

// ============================================
// Segmented Upload Schemas
// ============================================

export const UploadChunkSchema = Schema.Struct({
	folderName: Schema.String,
	fileName: Schema.String,
	fileBase64: Schema.String,
});

const AnswerSubmissionSchema = Schema.Struct({
	questionId: UUID,
	answerId: UUID,
	videoMainPath: Schema.optional(Schema.String),
	videoSecPath: Schema.optional(Schema.String),
});

export const FinalSubmitSchema = Schema.Struct({
	questionnaireId: UUID,
	userEmail: Schema.String,
	userName: Schema.String,
	userClass: Schema.String,
	userSemester: Schema.optional(Schema.String),
	userNim: Schema.optional(Schema.String),
	userGender: Schema.optional(Schema.String),
	userAge: Schema.optional(Schema.Number),
	folderName: Schema.String,
	answers: Schema.Array(AnswerSubmissionSchema),
});

// ============================================
// Response Filter Schema
// ============================================

export const ResponseFilterSchema = Schema.Struct({
	questionnaireId: Schema.optional(UUID),
	className: Schema.optional(Schema.String),
	startDate: Schema.optional(Schema.String),
	endDate: Schema.optional(Schema.String),
	name: Schema.optional(Schema.String),
});
