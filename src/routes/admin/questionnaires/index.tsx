import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getQuestionnaires } from "@/apis/admin/questionnaires";
import { QuestionnaireList } from "@/features/admin/questionnaire/questionnaire-list";

const questionnairesQueryOptions = queryOptions({
	queryKey: ["admin", "questionnaires"],
	queryFn: () => getQuestionnaires(),
});

export const Route = createFileRoute("/admin/questionnaires/")({
	loader: ({ context }) => {
		context.queryClient.prefetchQuery(questionnairesQueryOptions);
	},
	component: QuestionnairesRouteComponent,
});

function QuestionnairesRouteComponent() {
	const query = useQuery(questionnairesQueryOptions);
	return <QuestionnaireList data={query.data} isLoading={query.isLoading} />;
}
