import { createFileRoute } from "@tanstack/react-router";
import { finalizeSegmentedUpload } from "@/apis/resumable-upload";

export const Route = createFileRoute("/api/upload/segmented/finalize")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const { uploadId } = (await request.json()) as { uploadId?: string };
					if (!uploadId) {
						return new Response("Missing uploadId", { status: 400 });
					}
					return Response.json(await finalizeSegmentedUpload(uploadId));
				} catch (error) {
					return new Response(
						error instanceof Error ? error.message : "Finalize failed",
						{ status: 400 },
					);
				}
			},
		},
	},
});
