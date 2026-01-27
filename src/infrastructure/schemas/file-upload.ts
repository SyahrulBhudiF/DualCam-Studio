import { Schema } from "@effect/schema";

// File upload schema
export const FileUploadSchema = Schema.Struct({
	folderName: Schema.String,
	fileName: Schema.String,
	fileBase64: Schema.String,
});

export const EnsureDirectorySchema = Schema.Struct({
	path: Schema.String,
});

// Inferred types
export type FileUpload = Schema.Schema.Type<typeof FileUploadSchema>;
export type EnsureDirectory = Schema.Schema.Type<typeof EnsureDirectorySchema>;

// Decode functions
export const decodeFileUpload = Schema.decodeUnknownSync(FileUploadSchema);
export const decodeEnsureDirectory = Schema.decodeUnknownSync(
	EnsureDirectorySchema,
);
