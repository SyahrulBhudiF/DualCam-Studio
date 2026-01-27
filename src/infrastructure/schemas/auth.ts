import { Schema } from "@effect/schema";

// Password validation with regex
const PasswordPattern =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;

export const Password = Schema.String.pipe(
	Schema.minLength(8),
	Schema.pattern(PasswordPattern),
);

export const Email = Schema.String.pipe(
	Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
);

export const LoginSchema = Schema.Struct({
	email: Email,
	password: Password,
});

export const SignupSchema = Schema.Struct({
	email: Email,
	password: Password,
	redirectUrl: Schema.optional(Schema.String),
});

export const ProfileSchema = Schema.Struct({
	email: Email,
	name: Schema.String.pipe(Schema.minLength(1)),
	nim: Schema.String.pipe(Schema.minLength(1)),
	class: Schema.String.pipe(Schema.minLength(1)),
	semester: Schema.String.pipe(Schema.minLength(1)),
	age: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0)),
	gender: Schema.Literal("L", "P"),
});

// Inferred types
export type Login = Schema.Schema.Type<typeof LoginSchema>;
export type Signup = Schema.Schema.Type<typeof SignupSchema>;
export type Profile = Schema.Schema.Type<typeof ProfileSchema>;

// Decode functions
export const decodeLogin = Schema.decodeUnknownSync(LoginSchema);
export const decodeSignup = Schema.decodeUnknownSync(SignupSchema);
export const decodeProfile = Schema.decodeUnknownSync(ProfileSchema);
