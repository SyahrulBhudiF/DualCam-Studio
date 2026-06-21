import { createFileRoute } from "@tanstack/react-router";
import { VideoPredictionViewer } from "@/features/video-prediction/components/VideoPredictionViewer";

export const Route = createFileRoute("/admin/video-predictions/$predictionId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { predictionId } = Route.useParams();
	return <VideoPredictionViewer mode={{ kind: "admin", predictionId }} />;
}
