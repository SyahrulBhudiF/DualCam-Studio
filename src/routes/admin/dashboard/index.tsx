import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
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
	loader: async ({ context }) => {
		const { queryClient } = context;

		await Promise.all([
			queryClient.ensureQueryData(summaryOptions),
			queryClient.ensureQueryData(breakdownOptions),
			queryClient.ensureQueryData(analyticsOptions),
		]);
	},
	component: DashboardRouteComponent,
});

function DashboardRouteComponent() {
	const summary = useSuspenseQuery(summaryOptions);
	const breakdown = useSuspenseQuery(breakdownOptions);
	const analytics = useSuspenseQuery(analyticsOptions);

	return (
		<Dashboard
			summary={summary.data}
			breakdown={breakdown.data}
			analytics={analytics.data}
		/>
	);
}
