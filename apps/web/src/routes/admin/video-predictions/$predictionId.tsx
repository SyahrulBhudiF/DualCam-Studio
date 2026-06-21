import { createFileRoute } from "@tanstack/react-router";
import { Viewer } from "@/features/video-prediction/components/Viewer";

export const Route = createFileRoute("/admin/video-predictions/$predictionId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { predictionId } = Route.useParams();
	return <Viewer mode={{ kind: "admin", predictionId }} />;
}
