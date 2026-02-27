import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { createFileRoute } from "@tanstack/react-router";

const UPLOAD_ROOT = path.resolve(process.cwd(), "video_uploads");

export const Route = createFileRoute("/api/video/$")({
	server: {
		handlers: {
			GET: async ({ params, request }) => {
				const videoPath = params._splat;

				if (!videoPath) {
					return new Response("Video path is required", { status: 400 });
				}

				// Prevent directory traversal attacks
				const normalizedPath = path.normalize(videoPath);
				const filePath = path.resolve(UPLOAD_ROOT, normalizedPath);

				// Guard: resolved path must stay within upload root
				if (!filePath.startsWith(UPLOAD_ROOT + path.sep) && filePath !== UPLOAD_ROOT) {
					return new Response("Forbidden", { status: 403 });
				}

				// Check if file exists
				if (!fs.existsSync(filePath)) {
					return new Response("Video not found", { status: 404 });
				}

				// Get file stats
				const stat = fs.statSync(filePath);
				const fileSize = stat.size;

				// Determine content type based on extension
				const ext = path.extname(filePath).toLowerCase();
				const contentTypes: Record<string, string> = {
					".webm": "video/webm",
					".mp4": "video/mp4",
					".avi": "video/x-msvideo",
					".mov": "video/quicktime",
					".mkv": "video/x-matroska",
				};
				const contentType = contentTypes[ext] ?? "video/webm";

				// Parse Range header for streaming
				const rangeHeader = request.headers.get("range");

				if (rangeHeader) {
					const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
					if (!match) {
						return new Response("Invalid Range", { status: 416 });
					}

					const start = Number.parseInt(match[1], 10);
					const end = match[2] ? Number.parseInt(match[2], 10) : fileSize - 1;

					if (start >= fileSize || end >= fileSize || start > end) {
						return new Response("Range Not Satisfiable", {
							status: 416,
							headers: {
								"Content-Range": `bytes */${fileSize}`,
							},
						});
					}

					const chunkSize = end - start + 1;
					const stream = fs.createReadStream(filePath, { start, end });
					const readable = Readable.toWeb(stream) as ReadableStream;

					return new Response(readable, {
						status: 206,
						headers: {
							"Content-Type": contentType,
							"Content-Length": chunkSize.toString(),
							"Content-Range": `bytes ${start}-${end}/${fileSize}`,
							"Accept-Ranges": "bytes",
							"Cache-Control": "public, max-age=3600",
						},
					});
				}

				// Full file response — still streamed
				const stream = fs.createReadStream(filePath);
				const readable = Readable.toWeb(stream) as ReadableStream;

				return new Response(readable, {
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
