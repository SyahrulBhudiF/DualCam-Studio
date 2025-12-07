import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	getAnswersByQuestionId,
	getQuestionById,
} from "@/apis/admin/questionnaires";
import { QuestionDetail } from "@/features/admin/questionnaire/question-detail";

export const Route = createFileRoute(
	"/admin/questionnaires/$questionnaireId/$questionId/",
)({
	loader: async ({ context, params }) => {
		const { queryClient } = context;
		const { questionId } = params;

		const questionOptions = queryOptions({
			queryKey: ["admin", "question", questionId],
			queryFn: () => getQuestionById({ data: questionId }),
		});

		const answersOptions = queryOptions({
			queryKey: ["admin", "answers", questionId],
			queryFn: () => getAnswersByQuestionId({ data: questionId }),
		});

		await Promise.all([
			queryClient.ensureQueryData(questionOptions),
			queryClient.ensureQueryData(answersOptions),
		]);
	},
	component: QuestionDetailRouteComponent,
});

function QuestionDetailRouteComponent() {
	const params = Route.useParams();

	const questionQuery = useSuspenseQuery(
		queryOptions({
			queryKey: ["admin", "question", params.questionId],
			queryFn: () => getQuestionById({ data: params.questionId }),
		}),
	);

	const answersQuery = useSuspenseQuery(
		queryOptions({
			queryKey: ["admin", "answers", params.questionId],
			queryFn: () => getAnswersByQuestionId({ data: params.questionId }),
		}),
	);

	return (
		<QuestionDetail question={questionQuery.data} answers={answersQuery.data} />
	);
}
