import { createFileRoute } from "@tanstack/react-router";
import { getResponseById } from "@/apis/admin/responses";
import { ResponseDetail } from "@/features/admin/responses";

export const Route = createFileRoute("/admin/responses/$responseId/")({
	loader: async ({ params }) => {
		const response = await getResponseById({ data: params.responseId });

		return {
			response,
		};
	},
	component: ResponseDetailPage,
});

function ResponseDetailPage() {
	const { response } = Route.useLoaderData();

	return <ResponseDetail response={response} />;
}
