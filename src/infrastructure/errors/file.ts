import { Schema } from"effect";

export class FileError extends Schema.TaggedErrorClass<FileError>()("FileError",
	{
		message: Schema.String,
		cause: Schema.optional(Schema.Unknown),
	},
) {}
