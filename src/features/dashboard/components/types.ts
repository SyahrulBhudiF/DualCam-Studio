import type {
	getAnalyticsDetails,
	getDashboardBreakdown,
	getDashboardSummary,
} from "@/apis/dashboard";

export type SummaryData =
	| Awaited<ReturnType<typeof getDashboardSummary>>
	| undefined;

export type BreakdownData =
	| Awaited<ReturnType<typeof getDashboardBreakdown>>
	| undefined;

export type AnalyticsData =
	| Awaited<ReturnType<typeof getAnalyticsDetails>>
	| undefined;

export interface DashboardProps {
	summary: SummaryData;
	breakdown: BreakdownData;
	analytics: AnalyticsData;
}
