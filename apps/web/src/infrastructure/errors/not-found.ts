import { Schema } from "effect";

export class QuestionnaireNotFoundError extends Schema.TaggedErrorClass<QuestionnaireNotFoundError>()(
	"QuestionnaireNotFoundError",
	{
		id: Schema.String,
		message: Schema.optional(Schema.String),
	},
) {}

export class QuestionNotFoundError extends Schema.TaggedErrorClass<QuestionNotFoundError>()(
	"QuestionNotFoundError",
	{
		id: Schema.String,
		message: Schema.optional(Schema.String),
	},
) {}

export class AnswerNotFoundError extends Schema.TaggedErrorClass<AnswerNotFoundError>()(
	"AnswerNotFoundError",
	{
		id: Schema.String,
		message: Schema.optional(Schema.String),
	},
) {}

export class ProfileNotFoundError extends Schema.TaggedErrorClass<ProfileNotFoundError>()(
	"ProfileNotFoundError",
	{
		id: Schema.optional(Schema.String),
		email: Schema.optional(Schema.String),
		message: Schema.optional(Schema.String),
	},
) {}

export class ResponseNotFoundError extends Schema.TaggedErrorClass<ResponseNotFoundError>()(
	"ResponseNotFoundError",
	{
		id: Schema.String,
		message: Schema.optional(Schema.String),
	},
) {}

export class UserNotFoundError extends Schema.TaggedErrorClass<UserNotFoundError>()(
	"UserNotFoundError",
	{
		id: Schema.optional(Schema.String),
		email: Schema.optional(Schema.String),
		message: Schema.optional(Schema.String),
	},
) {}
