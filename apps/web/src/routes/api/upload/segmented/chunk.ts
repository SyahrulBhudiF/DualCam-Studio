import { createFileRoute } from "@tanstack/react-router";
import { uploadSegmentedPart } from "@/apis/resumable-upload";

export const Route = createFileRoute("/api/upload/segmented/chunk")({
	server: {
		handlers: {
			PUT: async ({ request }) => {
				try {
					const url = new URL(request.url);
					const uploadId = url.searchParams.get("uploadId");
					const index = Number(url.searchParams.get("index"));
					const totalChunks = Number(url.searchParams.get("totalChunks"));

					if (!uploadId) {
						return new Response("Missing uploadId", { status: 400 });
					}

					const chunk = new Uint8Array(await request.arrayBuffer());
					return Response.json(
						await uploadSegmentedPart({ uploadId, index, totalChunks, chunk }),
					);
				} catch (error) {
					return new Response(
						error instanceof Error ? error.message : "Chunk upload failed",
						{ status: 400 },
					);
				}
			},
		},
	},
});
