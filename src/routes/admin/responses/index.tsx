import { createFileRoute } from "@tanstack/react-router";
import { getFilterOptions, getResponses } from "@/apis/admin/responses";
import { ResponseList } from "@/features/admin/responses";

export const Route = createFileRoute("/admin/responses/")({
	loader: async () => {
		const [responses, filterOptions] = await Promise.all([
			getResponses(),
			getFilterOptions(),
		]);

		return {
			responses,
			filterOptions,
		};
	},
	component: ResponsesPage,
});

function ResponsesPage() {
	const { responses, filterOptions } = Route.useLoaderData();

	return <ResponseList data={responses} filterOptions={filterOptions} />;
}
