import { createFileRoute } from "@tanstack/react-router";
import { Viewer } from "@/features/video-prediction/components/Viewer";

export const Route = createFileRoute("/predict-video/result/$predictionId")({
	validateSearch: (search) => ({
		token: typeof search.token === "string" ? search.token : "",
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { predictionId } = Route.useParams();
	const { token } = Route.useSearch();
	return (
		<Viewer mode={{ kind: "public", predictionId, token }} />
	);
}
