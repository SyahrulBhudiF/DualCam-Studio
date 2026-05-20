import { queryOptions } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getDashboardData } from "@/apis/dashboard";
import { Dashboard } from "@/features/dashboard";

const dashboardOptions = queryOptions({
	queryKey: ["dashboard"],
	queryFn: () => getDashboardData(),
});

export const Route = createFileRoute("/admin/dashboard/")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(dashboardOptions),
	component: DashboardRouteComponent,
});

function DashboardRouteComponent() {
	const data = Route.useLoaderData();

	return <Dashboard {...data} />;
}
