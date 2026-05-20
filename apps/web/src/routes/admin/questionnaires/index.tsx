import { queryOptions } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getQuestionnaires } from "@/apis/admin/questionnaires";
import { QuestionnaireList } from "@/features/admin/questionnaire/QuestionnaireList";

const questionnairesQueryOptions = queryOptions({
	queryKey: ["admin", "questionnaires"],
	queryFn: () => getQuestionnaires(),
});

export const Route = createFileRoute("/admin/questionnaires/")({
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(questionnairesQueryOptions),
	component: QuestionnairesRouteComponent,
});

function QuestionnairesRouteComponent() {
	const questionnaires = Route.useLoaderData();
	return <QuestionnaireList data={questionnaires} isLoading={false} />;
}
