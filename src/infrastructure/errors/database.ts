import { Schema } from"effect";

export class DatabaseError extends Schema.TaggedErrorClass<DatabaseError>()("DatabaseError",
	{
		message: Schema.String,
		cause: Schema.optional(Schema.Unknown),
	},
) {}
