import { queryOptions, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getFilterOptions, getResponses } from "@/apis/admin/responses";
import { ResponseList } from "@/features/admin/responses";

const responsesQueryOptions = queryOptions({
	queryKey: ["admin", "responses"],
	queryFn: () => getResponses(),
});

const filterOptionsQueryOptions = queryOptions({
	queryKey: ["admin", "responses", "filterOptions"],
	queryFn: () => getFilterOptions(),
});

export const Route = createFileRoute("/admin/responses/")({
	loader: ({ context }) => {
		context.queryClient.prefetchQuery(responsesQueryOptions);
		context.queryClient.prefetchQuery(filterOptionsQueryOptions);
	},
	component: ResponsesPage,
});

function ResponsesPage() {
	const responses = useQuery(responsesQueryOptions);
	const filterOptions = useQuery(filterOptionsQueryOptions);

	const isLoading = responses.isLoading || filterOptions.isLoading;

	return (
		<ResponseList
			data={responses.data}
			filterOptions={filterOptions.data}
			isLoading={isLoading}
		/>
	);
}
