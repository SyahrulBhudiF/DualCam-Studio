import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	getQuestionnaireById,
	getQuestionsByQuestionnaireId,
} from "@/apis/admin/questionnaires";
import { QuestionnaireDetail } from "@/features/admin/questionnaire/questionnaire-detail";

export const Route = createFileRoute("/admin/questionnaires/$questionnaireId/")(
	{
		loader: async ({ context, params }) => {
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

			await Promise.all([
				queryClient.ensureQueryData(questionnaireOptions),
				queryClient.ensureQueryData(questionsOptions),
			]);
		},
		component: QuestionnaireDetailRouteComponent,
	},
);

function QuestionnaireDetailRouteComponent() {
	const params = Route.useParams();

	const questionnaireQuery = useSuspenseQuery(
		queryOptions({
			queryKey: ["admin", "questionnaire", params.questionnaireId],
			queryFn: () => getQuestionnaireById({ data: params.questionnaireId }),
		}),
	);

	const questionsQuery = useSuspenseQuery(
		queryOptions({
			queryKey: ["admin", "questions", params.questionnaireId],
			queryFn: () =>
				getQuestionsByQuestionnaireId({ data: params.questionnaireId }),
		}),
	);

	return (
		<QuestionnaireDetail
			questionnaire={questionnaireQuery.data}
			questions={questionsQuery.data}
		/>
	);
}
