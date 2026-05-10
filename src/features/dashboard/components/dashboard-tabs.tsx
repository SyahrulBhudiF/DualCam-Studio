import { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { AnalyticsData, BreakdownData, SummaryData } from "./types";

const DashboardOverview = lazy(() =>
	import("./dashboard-overview").then((m) => ({ default: m.DashboardOverview })),
);
const DashboardAnalytics = lazy(() =>
	import("./dashboard-analytics").then((m) => ({
		default: m.DashboardAnalytics,
	})),
);
const DashboardResponses = lazy(() =>
	import("./dashboard-responses").then((m) => ({ default: m.DashboardResponses })),
);

function DashboardOverviewFallback() {
	return (
		<>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{["total", "active", "responses", "score"].map((key) => (
					<div key={key} className="h-[126px] rounded-xl border bg-card" />
				))}
			</div>
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
				<div className="col-span-1 h-[260px] rounded-xl border bg-card lg:col-span-4" />
				<div className="col-span-1 h-[260px] rounded-xl border bg-card lg:col-span-3" />
			</div>
		</>
	);
}

function DashboardAnalyticsFallback() {
	return (
		<>
			<div className="grid gap-4 lg:grid-cols-7">
				<div className="col-span-1 flex h-[432px] items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground lg:col-span-4">
					Loading analytics…
				</div>
				<div className="col-span-1 h-[224px] rounded-xl border bg-card lg:col-span-3" />
			</div>
			<div className="grid gap-4 lg:grid-cols-7">
				<div className="col-span-1 h-[260px] rounded-xl border bg-card lg:col-span-4" />
				<div className="col-span-1 h-[260px] rounded-xl border bg-card lg:col-span-3" />
			</div>
		</>
	);
}

function DashboardResponsesFallback() {
	return <div className="h-[420px] rounded-xl border bg-card" />;
}

type DashboardTabsProps = {
	summary: SummaryData;
	breakdown: BreakdownData;
	analytics: AnalyticsData;
	isLoading: boolean;
};

export function DashboardTabs({
	summary,
	breakdown,
	analytics,
	isLoading,
}: DashboardTabsProps) {
	return (
		<Tabs orientation="vertical" defaultValue="overview" className="space-y-3">
			<div className="w-full overflow-x-auto pb-2">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
					<TabsTrigger value="responses">Responses</TabsTrigger>
				</TabsList>
			</div>
			<TabsContent value="overview" className="space-y-3">
				<Suspense fallback={<DashboardOverviewFallback />}>
					<DashboardOverview
						summary={summary}
						breakdown={breakdown}
						isLoading={isLoading}
					/>
				</Suspense>
			</TabsContent>
			<TabsContent value="analytics" className="space-y-3">
				<Suspense fallback={<DashboardAnalyticsFallback />}>
					<DashboardAnalytics analytics={analytics} isLoading={isLoading} />
				</Suspense>
			</TabsContent>
			<TabsContent value="responses" className="space-y-3">
				<Suspense fallback={<DashboardResponsesFallback />}>
					<DashboardResponses />
				</Suspense>
			</TabsContent>
		</Tabs>
	);
}
