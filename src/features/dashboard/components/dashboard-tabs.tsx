import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardAnalytics } from "./dashboard-analytics";
import { DashboardOverview } from "./dashboard-overview";
import { DashboardResponses } from "./dashboard-responses";
import type { AnalyticsData, BreakdownData, SummaryData } from "./types";

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
		<Tabs orientation="vertical" defaultValue="overview" className="space-y-4">
			<div className="w-full overflow-x-auto pb-2">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
					<TabsTrigger value="responses">Responses</TabsTrigger>
				</TabsList>
			</div>
			<TabsContent value="overview" className="space-y-4">
				<DashboardOverview
					summary={summary}
					breakdown={breakdown}
					isLoading={isLoading}
				/>
			</TabsContent>
			<TabsContent value="analytics" className="space-y-4">
				<DashboardAnalytics analytics={analytics} isLoading={isLoading} />
			</TabsContent>
			<TabsContent value="responses" className="space-y-4">
				<DashboardResponses />
			</TabsContent>
		</Tabs>
	);
}
