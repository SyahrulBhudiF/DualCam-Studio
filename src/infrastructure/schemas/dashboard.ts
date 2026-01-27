import { Schema } from "@effect/schema";
import { UUID } from "./questionnaire";

// Dashboard summary response schema (for type safety)
export const DashboardSummarySchema = Schema.Struct({
	totalQuestionnaires: Schema.Number,
	activeQuestionnaires: Schema.Number,
	totalResponses: Schema.Number,
	averageScore: Schema.Number,
	totalClasses: Schema.Number,
});

// Dashboard breakdown request schema
export const DashboardBreakdownFilterSchema = Schema.Struct({
	questionnaireId: Schema.optional(UUID),
	className: Schema.optional(Schema.String),
	startDate: Schema.optional(Schema.String),
	endDate: Schema.optional(Schema.String),
});

// Inferred types
export type DashboardSummary = Schema.Schema.Type<
	typeof DashboardSummarySchema
>;
export type DashboardBreakdownFilter = Schema.Schema.Type<
	typeof DashboardBreakdownFilterSchema
>;

// Decode functions
export const decodeDashboardSummary = Schema.decodeUnknownSync(
	DashboardSummarySchema,
);
export const decodeDashboardBreakdownFilter = Schema.decodeUnknownSync(
	DashboardBreakdownFilterSchema,
);
