import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	getAnalyticsDetails,
	getDashboardBreakdown,
	getDashboardSummary,
} from "@/apis/dashboard";
import { Dashboard } from "@/features/dashboard";

const summaryOptions = queryOptions({
	queryKey: ["dashboard", "summary"],
	queryFn: () => getDashboardSummary(),
});

const breakdownOptions = queryOptions({
	queryKey: ["dashboard", "breakdown"],
	queryFn: () => getDashboardBreakdown(),
});

const analyticsOptions = queryOptions({
	queryKey: ["dashboard", "analytics"],
	queryFn: () => getAnalyticsDetails(),
});

export const Route = createFileRoute("/admin/dashboard/")({
	loader: ({ context }) => {
		const { queryClient } = context;

		// Prefetch in background - don't block navigation
		queryClient.prefetchQuery(summaryOptions);
		queryClient.prefetchQuery(breakdownOptions);
		queryClient.prefetchQuery(analyticsOptions);
	},
	component: DashboardRouteComponent,
});

function DashboardRouteComponent() {
	const summary = useQuery(summaryOptions);
	const breakdown = useQuery(breakdownOptions);
	const analytics = useQuery(analyticsOptions);

	const isLoading =
		summary.isLoading || breakdown.isLoading || analytics.isLoading;

	return (
		<Dashboard
			summary={summary.data}
			breakdown={breakdown.data}
			analytics={analytics.data}
			isLoading={isLoading}
		/>
	);
}
