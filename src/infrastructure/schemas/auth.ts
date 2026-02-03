import { Schema } from "@effect/schema";

const PasswordPattern =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;

const EmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Password = Schema.String.pipe(
	Schema.minLength(8),
	Schema.pattern(PasswordPattern),
);

export const Email = Schema.String.pipe(Schema.pattern(EmailPattern));

export const LoginSchema = Schema.Struct({
	email: Email,
	password: Password,
});

export const SignupSchema = Schema.Struct({
	email: Email,
	password: Password,
	redirectUrl: Schema.optional(Schema.String),
});
