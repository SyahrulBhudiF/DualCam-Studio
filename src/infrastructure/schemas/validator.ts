import { Schema } from"effect";

export const inputValidator =
	<S extends Schema.Decoder<unknown, never>>(schema: S) =>
	(input: unknown): S["Type"] =>
		Schema.decodeUnknownSync(schema)(input);
