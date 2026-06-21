import { queryOptions } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { listAdminVideoPredictions } from "@/apis/video-prediction";
import { VideoPredictionsList } from "@/features/admin/video-predictions/VideoPredictionsList";

const videoPredictionsQueryOptions = queryOptions({
	queryFn: () => listAdminVideoPredictions(),
	queryKey: ["admin", "video-predictions"],
});

export const Route = createFileRoute("/admin/video-predictions/")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(videoPredictionsQueryOptions),
	component: RouteComponent,
});

function RouteComponent() {
	const predictions = Route.useLoaderData();
	return <VideoPredictionsList predictions={predictions} />;
}
