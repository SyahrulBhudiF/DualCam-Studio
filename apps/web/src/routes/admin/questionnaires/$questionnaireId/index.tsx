import { queryOptions } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	getQuestionnaireById,
	getQuestionsByQuestionnaireId,
} from "@/apis/admin/questionnaires";
import { QuestionnaireDetail } from "@/features/admin/questionnaire/QuestionnaireDetail";

export const Route = createFileRoute("/admin/questionnaires/$questionnaireId/")(
	{
		loader: ({ context, params }) => {
			const { queryClient } = context;
			const { questionnaireId } = params;

			const questionnaireOptions = queryOptions({
				queryKey: ["admin", "questionnaire", questionnaireId],
				queryFn: () => getQuestionnaireById({ data: questionnaireId }),
			});

			const questionsOptions = queryOptions({
				queryKey: ["admin", "questions", questionnaireId],
				queryFn: () => getQuestionsByQuestionnaireId({ data: questionnaireId }),
			});

			return Promise.all([
				queryClient.ensureQueryData(questionnaireOptions),
				queryClient.ensureQueryData(questionsOptions),
			]);
		},
		component: QuestionnaireDetailRouteComponent,
	},
);

function QuestionnaireDetailRouteComponent() {
	const [questionnaire, questions] = Route.useLoaderData();

	return (
		<QuestionnaireDetail questionnaire={questionnaire} questions={questions} />
	);
}
