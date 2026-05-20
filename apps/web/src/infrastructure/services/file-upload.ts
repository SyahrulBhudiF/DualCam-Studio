import * as path from "node:path";
import { Context, Effect, FileSystem, Layer } from "effect";
import { StorageConfig } from "../config";
import { FileError } from "../errors/file";

export class FileUploadService extends Context.Service<FileUploadService>()(
	"FileUploadService",
	{
		make: Effect.gen(function* () {
			const fs = yield* FileSystem.FileSystem;
			const config = yield* StorageConfig;
			const uploadRoot = path.resolve(config.uploadRoot);

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

			const existsUploadPath = Effect.fn("FileUploadService.existsUploadPath")(
				(...segments: Array<string>) =>
					resolveUploadPath(...segments).pipe(
						Effect.flatMap((filePath) => fs.exists(filePath)),
						Effect.catch(() => Effect.succeed(false)),
					),
			);

			return {
				ensureDirectory,
				existsUploadPath,
				getUploadRoot,
				resolveUploadPath,
				saveFile,
				uploadChunk,
			};
		}),
	},
) {
	static readonly layer = Layer.effect(this, this.make);
}
