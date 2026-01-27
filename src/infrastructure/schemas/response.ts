import { Schema } from "@effect/schema";
import { UUID } from "./questionnaire";

// Response filter schema
export const ResponseFilterSchema = Schema.Struct({
	questionnaireId: Schema.optional(UUID),
	className: Schema.optional(Schema.String),
	startDate: Schema.optional(Schema.String),
	endDate: Schema.optional(Schema.String),
	name: Schema.optional(Schema.String),
});

// Delete responses schema
export const DeleteResponsesSchema = Schema.Struct({
	ids: Schema.Array(UUID),
});

// Inferred types
export type ResponseFilter = Schema.Schema.Type<typeof ResponseFilterSchema>;
export type DeleteResponses = Schema.Schema.Type<typeof DeleteResponsesSchema>;

// Decode functions
export const decodeResponseFilter =
	Schema.decodeUnknownSync(ResponseFilterSchema);
export const decodeDeleteResponses = Schema.decodeUnknownSync(
	DeleteResponsesSchema,
);
