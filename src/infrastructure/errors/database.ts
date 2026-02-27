import { Schema } from "effect";

export class DatabaseError extends Schema.TaggedError<DatabaseError>()(
	"DatabaseError",
	{
		message: Schema.String,
		cause: Schema.optional(Schema.Unknown),
	},
) {}
