import { createFileRoute } from "@tanstack/react-router";
import { getActiveQuestionnaire } from "@/apis/questionnaire";
import { QuestionnairePage } from "@/features/questionnaire";

export const Route = createFileRoute("/questionnaire/")({
	loader: () => getActiveQuestionnaire(),
	component: QuestionnairePage,
});
