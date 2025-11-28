import { getActiveQuestionnaire } from "@/apis/questionnaire";
import { useQuestionnaireStore } from "@/libs/store/QuestionnaireStore";
import { createFileRoute } from "@tanstack/react-router";
import { SegmentedPage } from "@/features/questionnaire/segmented";

export const Route = createFileRoute("/questionnaire/segmented/")({
	beforeLoad: () => {
		useQuestionnaireStore.getState().reset();
	},
	loader: () => getActiveQuestionnaire(),
	component: SegmentedPage,
});
