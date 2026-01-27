import { Schema } from "@effect/schema";

// Profile create/update schema
export const CreateProfileSchema = Schema.Struct({
	name: Schema.optional(Schema.String),
	email: Schema.optional(Schema.String),
	nim: Schema.optional(Schema.String),
	class: Schema.optional(Schema.String),
	semester: Schema.optional(Schema.String),
	gender: Schema.optional(Schema.String),
	age: Schema.optional(Schema.Number),
});

export const UpdateProfileSchema = Schema.Struct({
	id: Schema.String.pipe(
		Schema.pattern(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
		),
	),
	name: Schema.optional(Schema.String),
	email: Schema.optional(Schema.String),
	nim: Schema.optional(Schema.String),
	class: Schema.optional(Schema.String),
	semester: Schema.optional(Schema.String),
	gender: Schema.optional(Schema.String),
	age: Schema.optional(Schema.Number),
});

// Inferred types
export type CreateProfile = Schema.Schema.Type<typeof CreateProfileSchema>;
export type UpdateProfile = Schema.Schema.Type<typeof UpdateProfileSchema>;

// Decode functions
export const decodeCreateProfile =
	Schema.decodeUnknownSync(CreateProfileSchema);
export const decodeUpdateProfile =
	Schema.decodeUnknownSync(UpdateProfileSchema);
