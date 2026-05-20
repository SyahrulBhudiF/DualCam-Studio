import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";
import { PredictionResultPage } from "@/features/questionnaire/PredictionResultPage";

const PredictionSearchSchema = Schema.Struct({
	token: Schema.optional(Schema.String),
});

export const Route = createFileRoute("/prediction/$responseId/")({
	validateSearch: (search) =>
		Schema.decodeUnknownSync(PredictionSearchSchema)(search),
	component: PredictionRoute,
});

function PredictionRoute() {
	const { responseId } = Route.useParams();
	const { token = "" } = Route.useSearch();

	return <PredictionResultPage responseId={responseId} token={token} />;
}
