import { queryOptions } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	getAnswersByQuestionId,
	getQuestionById,
} from "@/apis/admin/questionnaires";
import { QuestionDetail } from "@/features/admin/questionnaire/QuestionDetail";

export const Route = createFileRoute(
	"/admin/questionnaires/$questionnaireId/$questionId/",
)({
	loader: ({ context, params }) => {
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

		return Promise.all([
			queryClient.ensureQueryData(questionOptions),
			queryClient.ensureQueryData(answersOptions),
		]);
	},
	component: QuestionDetailRouteComponent,
});

function QuestionDetailRouteComponent() {
	const [question, answers] = Route.useLoaderData();

	return <QuestionDetail question={question} answers={answers} />;
}
