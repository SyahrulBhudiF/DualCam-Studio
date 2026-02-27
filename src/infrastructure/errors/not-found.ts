import { Schema } from "effect";

export class QuestionnaireNotFoundError extends Schema.TaggedError<QuestionnaireNotFoundError>()(
	"QuestionnaireNotFoundError",
	{
		id: Schema.String,
		message: Schema.optional(Schema.String),
	},
) {}

export class QuestionNotFoundError extends Schema.TaggedError<QuestionNotFoundError>()(
	"QuestionNotFoundError",
	{
		id: Schema.String,
		message: Schema.optional(Schema.String),
	},
) {}

export class AnswerNotFoundError extends Schema.TaggedError<AnswerNotFoundError>()(
	"AnswerNotFoundError",
	{
		id: Schema.String,
		message: Schema.optional(Schema.String),
	},
) {}

export class ProfileNotFoundError extends Schema.TaggedError<ProfileNotFoundError>()(
	"ProfileNotFoundError",
	{
		id: Schema.optional(Schema.String),
		email: Schema.optional(Schema.String),
		message: Schema.optional(Schema.String),
	},
) {}

export class ResponseNotFoundError extends Schema.TaggedError<ResponseNotFoundError>()(
	"ResponseNotFoundError",
	{
		id: Schema.String,
		message: Schema.optional(Schema.String),
	},
) {}

export class UserNotFoundError extends Schema.TaggedError<UserNotFoundError>()(
	"UserNotFoundError",
	{
		id: Schema.optional(Schema.String),
		email: Schema.optional(Schema.String),
		message: Schema.optional(Schema.String),
	},
) {}
