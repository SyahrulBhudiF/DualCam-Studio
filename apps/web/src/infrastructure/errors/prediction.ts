import { Schema } from "effect";

export class PredictionUnavailableError extends Schema.TaggedErrorClass<PredictionUnavailableError>()(
	"PredictionUnavailableError",
	{
		message: Schema.String,
		cause: Schema.optional(Schema.Unknown),
	},
) {}

export class PredictionRequestError extends Schema.TaggedErrorClass<PredictionRequestError>()(
	"PredictionRequestError",
	{
		message: Schema.String,
		cause: Schema.optional(Schema.Unknown),
	},
) {}
