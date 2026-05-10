import { createFileRoute } from "@tanstack/react-router";
import { getActiveQuestionnaire } from "@/apis/questionnaire";
import { SegmentedPage } from "@/features/questionnaire/segmented";
import { useQuestionnaireStore } from "@/libs/store/QuestionnaireStore";

export const Route = createFileRoute("/questionnaire/segmented/")({
	beforeLoad: () => {
		useQuestionnaireStore.getState().reset();
	},
	loader: () => getActiveQuestionnaire(),
	component: SegmentedPage,
});
