import { Schema } from"effect";

export class ValidationError extends Schema.TaggedErrorClass<ValidationError>()("ValidationError",
	{
		message: Schema.String,
		field: Schema.optional(Schema.String),
		errors: Schema.optional(
			Schema.Array(
				Schema.Struct({
					path: Schema.String,
					message: Schema.String,
				}),
			),
		),
	},
) {}

export class ParseError extends Schema.TaggedErrorClass<ParseError>()("ParseError",
	{
		message: Schema.String,
		cause: Schema.optional(Schema.Unknown),
	},
) {}
