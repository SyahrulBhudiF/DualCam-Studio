import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getQuestionnaires } from "@/apis/admin/questionnaires";
import { QuestionnaireList } from "@/features/admin/questionnaire/questionnaire-list";

const questionnairesQueryOptions = queryOptions({
	queryKey: ["admin", "questionnaires"],
	queryFn: () => getQuestionnaires(),
});

export const Route = createFileRoute("/admin/questionnaires/")({
	loader: async ({ context }) => {
		const { queryClient } = context;
		await queryClient.ensureQueryData(questionnairesQueryOptions);
	},
	component: QuestionnairesRouteComponent,
});

function QuestionnairesRouteComponent() {
	const query = useSuspenseQuery(questionnairesQueryOptions);
	return <QuestionnaireList data={query.data} />;
}
