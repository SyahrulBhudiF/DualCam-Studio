import { createFileRoute } from "@tanstack/react-router";
import { cancelSegmentedUpload } from "@/apis/resumable-upload";

export const Route = createFileRoute("/api/upload/segmented/$uploadId")({
	server: {
		handlers: {
			DELETE: async ({ params }) => {
				try {
					return Response.json(await cancelSegmentedUpload(params.uploadId));
				} catch (error) {
					return new Response(
						error instanceof Error ? error.message : "Cancel upload failed",
						{ status: 400 },
					);
				}
			},
		},
	},
});
