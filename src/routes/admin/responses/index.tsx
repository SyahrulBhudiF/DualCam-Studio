import { queryOptions } from "@tanstack/react-query";
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
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(responsesQueryOptions),
			context.queryClient.ensureQueryData(filterOptionsQueryOptions),
		]),
	component: ResponsesPage,
});

function ResponsesPage() {
	const [responses, filterOptions] = Route.useLoaderData();

	return (
		<ResponseList
			data={responses}
			filterOptions={filterOptions}
			isLoading={false}
		/>
	);
}
