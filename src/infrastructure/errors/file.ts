import { Schema } from "effect";

export class FileError extends Schema.TaggedError<FileError>()(
	"FileError",
	{
		message: Schema.String,
		cause: Schema.optional(Schema.Unknown),
	},
) {}
