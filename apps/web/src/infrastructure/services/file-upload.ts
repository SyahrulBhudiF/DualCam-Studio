import * as crypto from "node:crypto";
import * as path from "node:path";
import { Context, Effect, FileSystem, Layer } from "effect";
import { StorageConfig } from "../config";
import { FileError } from "../errors/file";

const CHUNK_SIZE = 4 * 1024 * 1024;

const SUPPORTED_VIDEO_EXTENSIONS = new Set([
	".avi",
	".flv",
	".m4v",
	".mkv",
	".mov",
	".mp4",
	".mpeg",
	".mpg",
	".ogv",
	".webm",
	".wmv",
]);

export class FileUploadService extends Context.Service<FileUploadService>()(
	"FileUploadService",
	{
		make: Effect.gen(function* () {
			const fs = yield* FileSystem.FileSystem;
			const config = yield* StorageConfig;
			const uploadRoot = path.resolve(config.uploadRoot);
			const sessionsRoot = path.join(uploadRoot, ".tmp", "segmented");

			const resolveUploadPath = Effect.fn(
				"FileUploadService.resolveUploadPath",
			)((...segments: Array<string>) =>
				Effect.gen(function* () {
					if (segments.some((segment) => path.isAbsolute(segment))) {
						return yield* Effect.fail(
							new FileError({
								message: "Upload paths must be relative",
							}),
						);
					}

					const resolved = path.resolve(uploadRoot, ...segments);
					const relative = path.relative(uploadRoot, resolved);

					if (
						relative === "" ||
						relative.startsWith("..") ||
						path.isAbsolute(relative)
					) {
						return yield* Effect.fail(
							new FileError({
								message: "Upload path escapes upload root",
							}),
						);
					}

					return resolved;
				}),
			);

			const toPublicUploadPath = Effect.fn(
				"FileUploadService.toPublicUploadPath",
			)((filePath: string) =>
				Effect.gen(function* () {
					const relative = path.relative(uploadRoot, filePath);

					if (relative.startsWith("..") || path.isAbsolute(relative)) {
						return yield* Effect.fail(
							new FileError({
								message: "Upload path escapes upload root",
							}),
						);
					}

					return `/video_uploads/${relative.split(path.sep).join("/")}`;
				}),
			);

			const ensureDirectory = Effect.fn("FileUploadService.ensureDirectory")(
				function* (dirPath: string) {
					const exists = yield* fs.exists(dirPath).pipe(
						Effect.mapError(
							(error) =>
								new FileError({
									message: `Failed to ensure directory: ${dirPath}`,
									cause: error,
								}),
						),
					);
					if (!exists) {
						yield* fs.makeDirectory(dirPath, { recursive: true }).pipe(
							Effect.mapError(
								(error) =>
									new FileError({
										message: `Failed to ensure directory: ${dirPath}`,
										cause: error,
									}),
							),
						);
					}
				},
			);

			const saveFile = Effect.fn("FileUploadService.saveFile")(function* (
				filePath: string,
				content: Buffer,
			) {
				return yield* fs.writeFile(filePath, new Uint8Array(content)).pipe(
					Effect.mapError(
						(error) =>
							new FileError({
								message: `Failed to save file: ${filePath}`,
								cause: error,
							}),
					),
				);
			});

			const uploadChunk = Effect.fn("FileUploadService.uploadChunk")(
				function* (data: {
					folderName: string;
					fileName: string;
					fileBase64: string;
				}) {
					const userFolder = yield* resolveUploadPath(data.folderName);
					yield* ensureDirectory(uploadRoot);
					yield* ensureDirectory(userFolder);

					const filePath = yield* resolveUploadPath(
						data.folderName,
						data.fileName,
					);
					const fileDir = path.dirname(filePath);
					yield* ensureDirectory(fileDir);

					const base64Data = data.fileBase64.includes(",")
						? data.fileBase64.split(",")[1]
						: data.fileBase64;
					const buffer = Buffer.from(base64Data, "base64");

					yield* saveFile(filePath, buffer);

					const publicPath = yield* toPublicUploadPath(filePath);

					return {
						success: true,
						path: publicPath,
					};
				},
			);

			const getUploadRoot = Effect.fn("FileUploadService.getUploadRoot")(() =>
				Effect.succeed(uploadRoot),
			);

			const resolveSessionPath = Effect.fn(
				"FileUploadService.resolveSessionPath",
			)((uploadId: string) =>
				Effect.gen(function* () {
					if (!/^[0-9a-f-]{36}$/i.test(uploadId)) {
						return yield* Effect.fail(
							new FileError({ message: "Invalid upload session" }),
						);
					}
					const resolved = path.resolve(sessionsRoot, uploadId);
					const relative = path.relative(sessionsRoot, resolved);
					if (relative.startsWith("..") || path.isAbsolute(relative)) {
						return yield* Effect.fail(
							new FileError({ message: "Upload session escapes temp root" }),
						);
					}
					return resolved;
				}),
			);

			const initSegmentedUpload = Effect.fn(
				"FileUploadService.initSegmentedUpload",
			)(function* (data: {
				folderName: string;
				fileName: string;
				size: number;
				contentType: string;
			}) {
				if (data.size <= 0) {
					return yield* Effect.fail(
						new FileError({ message: "Upload size must be positive" }),
					);
				}
				yield* resolveUploadPath(data.folderName, data.fileName);
				const uploadId = crypto.randomUUID();
				const sessionPath = yield* resolveSessionPath(uploadId);
				const totalChunks = Math.ceil(data.size / CHUNK_SIZE);
				yield* ensureDirectory(sessionPath);
				yield* fs
					.writeFileString(
						path.join(sessionPath, "meta.json"),
						JSON.stringify({
							folderName: data.folderName,
							fileName: data.fileName,
							size: data.size,
							contentType: data.contentType,
							chunkSize: CHUNK_SIZE,
							totalChunks,
						}),
					)
					.pipe(
						Effect.mapError(
							(error) =>
								new FileError({
									message: "Failed to create upload session",
									cause: error,
								}),
						),
					);
				return { uploadId, chunkSize: CHUNK_SIZE, totalChunks };
			});

			const uploadSegmentedPart = Effect.fn(
				"FileUploadService.uploadSegmentedPart",
			)(function* (data: {
				uploadId: string;
				index: number;
				totalChunks: number;
				chunk: Uint8Array;
			}) {
				const sessionPath = yield* resolveSessionPath(data.uploadId);
				const meta = JSON.parse(
					yield* fs.readFileString(path.join(sessionPath, "meta.json")).pipe(
						Effect.mapError(
							(error) =>
								new FileError({
									message: "Upload session not found",
									cause: error,
								}),
						),
					),
				) as { totalChunks: number };
				if (data.totalChunks !== meta.totalChunks) {
					return yield* Effect.fail(
						new FileError({ message: "Chunk count mismatch" }),
					);
				}
				if (data.index < 0 || data.index >= meta.totalChunks) {
					return yield* Effect.fail(
						new FileError({ message: "Chunk index out of range" }),
					);
				}
				const chunkPath = path.join(sessionPath, `${data.index}.part`);
				const exists = yield* fs.exists(chunkPath);
				if (exists) {
					const info = yield* fs.stat(chunkPath);
					if (Number(info.size) === data.chunk.byteLength)
						return { success: true };
				}
				yield* fs.writeFile(chunkPath, data.chunk).pipe(
					Effect.mapError(
						(error) =>
							new FileError({
								message: "Failed to write upload chunk",
								cause: error,
							}),
					),
				);
				return { success: true };
			});

			const finalizeSegmentedUpload = Effect.fn(
				"FileUploadService.finalizeSegmentedUpload",
			)((uploadId: string) =>
				Effect.gen(function* () {
					const sessionPath = yield* resolveSessionPath(uploadId);
					const meta = JSON.parse(
						yield* fs.readFileString(path.join(sessionPath, "meta.json")).pipe(
							Effect.mapError(
								(error) =>
									new FileError({
										message: "Upload session not found",
										cause: error,
									}),
							),
						),
					) as { folderName: string; fileName: string; totalChunks: number };
					const filePath = yield* resolveUploadPath(
						meta.folderName,
						meta.fileName,
					);
					yield* ensureDirectory(path.dirname(filePath));
					const chunks = yield* Effect.all(
						Array.from({ length: meta.totalChunks }, (_, index) =>
							fs.readFile(path.join(sessionPath, `${index}.part`)).pipe(
								Effect.mapError(
									(error) =>
										new FileError({
											message: `Missing upload chunk: ${index}`,
											cause: error,
										}),
								),
							),
						),
					);
					const totalSize = chunks.reduce(
						(size, chunk) => size + chunk.length,
						0,
					);
					const file = new Uint8Array(totalSize);
					let offset = 0;
					for (const chunk of chunks) {
						file.set(chunk, offset);
						offset += chunk.length;
					}
					yield* fs.writeFile(filePath, file).pipe(
						Effect.mapError(
							(error) =>
								new FileError({
									message: "Failed to finalize upload",
									cause: error,
								}),
						),
					);
					yield* fs
						.remove(sessionPath, { recursive: true })
						.pipe(Effect.catch(() => Effect.void));
					return { success: true, path: yield* toPublicUploadPath(filePath) };
				}),
			);

			const cancelSegmentedUpload = Effect.fn(
				"FileUploadService.cancelSegmentedUpload",
			)((uploadId: string) =>
				resolveSessionPath(uploadId).pipe(
					Effect.flatMap((sessionPath) =>
						fs
							.remove(sessionPath, { recursive: true })
							.pipe(Effect.catch(() => Effect.void)),
					),
					Effect.as({ success: true }),
				),
			);

			const findVideosInUploadPath = Effect.fn(
				"FileUploadService.findVideosInUploadPath",
			)((...segments: Array<string>) =>
				Effect.gen(function* () {
					const rootPath = yield* resolveUploadPath(...segments);
					const exists = yield* fs.exists(rootPath);
					if (!exists) return [];

					const info = yield* fs.stat(rootPath);
					if (info.type === "File") {
						return isSupportedVideo(rootPath)
							? [yield* toPublicUploadPath(rootPath)]
							: [];
					}
					if (info.type !== "Directory") return [];

					const entries = yield* fs.readDirectory(rootPath, {
						recursive: true,
					});
					const videos: Array<string> = [];
					for (const entry of entries) {
						const videoPath = path.join(rootPath, entry);
						if (isSupportedVideo(videoPath)) videos.push(videoPath);
					}
					videos.sort();

					return yield* Effect.all(
						videos.map((video) => toPublicUploadPath(video)),
					);
				}).pipe(Effect.catch(() => Effect.succeed([]))),
			);

			const existsUploadPath = Effect.fn("FileUploadService.existsUploadPath")(
				(...segments: Array<string>) =>
					resolveUploadPath(...segments).pipe(
						Effect.flatMap((filePath) => fs.exists(filePath)),
						Effect.catch(() => Effect.succeed(false)),
					),
			);

			return {
				cancelSegmentedUpload,
				ensureDirectory,
				existsUploadPath,
				finalizeSegmentedUpload,
				findVideosInUploadPath,
				getUploadRoot,
				initSegmentedUpload,
				resolveUploadPath,
				saveFile,
				uploadChunk,
				uploadSegmentedPart,
			};
		}),
	},
) {
	static readonly layer = Layer.effect(this, this.make);
}

function isSupportedVideo(filePath: string) {
	return SUPPORTED_VIDEO_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}
