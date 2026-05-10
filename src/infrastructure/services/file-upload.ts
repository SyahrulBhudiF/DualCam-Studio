import * as path from"node:path";
import { Context, Effect, FileSystem, Layer } from"effect";
import { FileError } from"../errors/file";

export class FileUploadService extends Context.Service<FileUploadService>()("FileUploadService",
	{
		make: Effect.gen(function* () {
			const fs = yield* FileSystem.FileSystem;
			const uploadRoot = path.join(process.cwd(),"video_uploads");

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
					const userFolder = path.join(uploadRoot, data.folderName);
					yield* ensureDirectory(uploadRoot);
					yield* ensureDirectory(userFolder);

					const filePath = path.join(userFolder, data.fileName);
					const fileDir = path.dirname(filePath);
					yield* ensureDirectory(fileDir);

					const base64Data = data.fileBase64.includes(",")
						? data.fileBase64.split(",")[1]
						: data.fileBase64;
					const buffer = Buffer.from(base64Data,"base64");

					yield* saveFile(filePath, buffer);

					return {
						success: true,
						path: `/video_uploads/${data.folderName}/${data.fileName}`,
					};
				},
			);

			const getUploadRoot = Effect.fn("FileUploadService.getUploadRoot")(() =>
				Effect.succeed(uploadRoot),
			);

			return {
				ensureDirectory,
				saveFile,
				uploadChunk,
				getUploadRoot,
			};
		}),
	},
) {
	static readonly layer = Layer.effect(this, this.make);
}
