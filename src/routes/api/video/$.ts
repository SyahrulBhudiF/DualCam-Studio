import fs from "node:fs";
import path from "node:path";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/video/$")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const videoPath = params._splat;

				if (!videoPath) {
					return new Response("Video path is required", { status: 400 });
				}

				// Prevent directory traversal attacks
				const normalizedPath = path
					.normalize(videoPath)
					.replace(/^(\.\.(\/|\\|$))+/, "");

				const filePath = path.join(
					process.cwd(),
					"video_uploads",
					normalizedPath,
				);

				// Check if file exists
				if (!fs.existsSync(filePath)) {
					return new Response("Video not found", { status: 404 });
				}

				// Get file stats
				const stat = fs.statSync(filePath);
				const fileSize = stat.size;

				// Determine content type based on extension
				const ext = path.extname(filePath).toLowerCase();
				let contentType = "video/webm";
				if (ext === ".mp4") {
					contentType = "video/mp4";
				} else if (ext === ".avi") {
					contentType = "video/x-msvideo";
				} else if (ext === ".mov") {
					contentType = "video/quicktime";
				} else if (ext === ".mkv") {
					contentType = "video/x-matroska";
				}

				// Read the file and return as response
				const fileBuffer = fs.readFileSync(filePath);

				return new Response(fileBuffer, {
					status: 200,
					headers: {
						"Content-Type": contentType,
						"Content-Length": fileSize.toString(),
						"Accept-Ranges": "bytes",
						"Cache-Control": "public, max-age=3600",
					},
				});
			},
		},
	},
});
