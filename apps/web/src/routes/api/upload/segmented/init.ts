import { createFileRoute } from "@tanstack/react-router";
import { initSegmentedUpload } from "@/apis/resumable-upload";

type InitBody = {
	folderName: string;
	fileName: string;
	size: number;
	contentType: string;
};

export const Route = createFileRoute("/api/upload/segmented/init")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const body = (await request.json()) as InitBody;
					return Response.json(await initSegmentedUpload(body));
				} catch (error) {
					return new Response(
						error instanceof Error ? error.message : "Upload init failed",
						{ status: 400 },
					);
				}
			},
		},
	},
});
