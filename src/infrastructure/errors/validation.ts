import { Data } from "effect";

export class ValidationError extends Data.TaggedError("ValidationError")<{
	readonly message: string;
	readonly field?: string;
	readonly errors?: ReadonlyArray<{
		readonly path: string;
		readonly message: string;
	}>;
}> {}

export class ParseError extends Data.TaggedError("ParseError")<{
	readonly message: string;
	readonly cause?: unknown;
}> {}
