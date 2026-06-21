import { createFileRoute } from "@tanstack/react-router";
import { PredictVideoPage } from "@/features/video-prediction/PredictVideoPage";

export const Route = createFileRoute("/predict-video/")({
	component: PredictVideoPage,
});
