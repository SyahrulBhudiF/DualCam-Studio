import * as path from "node:path";
import { FileSystem } from "@effect/platform";
import { NodeFileSystem } from "@effect/platform-node";
import { Context, Effect, Layer } from "effect";
import { DatabaseError } from "../errors";

export interface IFileUploadService {
	readonly ensureDirectory: (
		dirPath: string,
	) => Effect.Effect<void, DatabaseError>;
	readonly saveFile: (
		filePath: string,
		content: Buffer,
	) => Effect.Effect<void, DatabaseError>;
	readonly uploadChunk: (data: {
		folderName: string;
		fileName: string;
		fileBase64: string;
	}) => Effect.Effect<{ success: boolean; path: string }, DatabaseError>;
	readonly getUploadRoot: Effect.Effect<string, never>;
}

export class FileUploadService extends Context.Tag("FileUploadService")<
	FileUploadService,
	IFileUploadService
>() {}

export const FileUploadServiceLive = Layer.effect(
	FileUploadService,
	Effect.gen(function* () {
		const fs = yield* FileSystem.FileSystem;
		const uploadRoot = path.join(process.cwd(), "video_uploads");

		const ensureDirectory: IFileUploadService["ensureDirectory"] = (dirPath) =>
			Effect.gen(function* () {
				const exists = yield* fs.exists(dirPath);
				if (!exists) {
					yield* fs.makeDirectory(dirPath, { recursive: true });
				}
			}).pipe(
				Effect.mapError(
					(error) =>
						new DatabaseError({
							message: `Failed to ensure directory: ${dirPath}`,
							cause: error,
						}),
				),
			);

		const saveFile: IFileUploadService["saveFile"] = (filePath, content) =>
			fs.writeFile(filePath, new Uint8Array(content)).pipe(
				Effect.mapError(
					(error) =>
						new DatabaseError({
							message: `Failed to save file: ${filePath}`,
							cause: error,
						}),
				),
			);

		const uploadChunk: IFileUploadService["uploadChunk"] = (data) =>
			Effect.gen(function* () {
				const userFolder = path.join(uploadRoot, data.folderName);
				yield* ensureDirectory(uploadRoot);
				yield* ensureDirectory(userFolder);

				const filePath = path.join(userFolder, data.fileName);
				const fileDir = path.dirname(filePath);
				yield* ensureDirectory(fileDir);

				const base64Data = data.fileBase64.includes(",")
					? data.fileBase64.split(",")[1]
					: data.fileBase64;
				const buffer = Buffer.from(base64Data, "base64");

				yield* saveFile(filePath, buffer);

				return {
					success: true,
					path: `/video_uploads/${data.folderName}/${data.fileName}`,
				};
			});

		const getUploadRoot: IFileUploadService["getUploadRoot"] =
			Effect.succeed(uploadRoot);

		return {
			ensureDirectory,
			saveFile,
			uploadChunk,
			getUploadRoot,
		};
	}),
).pipe(Layer.provide(NodeFileSystem.layer));
