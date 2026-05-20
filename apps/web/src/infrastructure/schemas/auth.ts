import { Schema } from "effect";

const EmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Password = Schema.String.check(Schema.isMinLength(8));

const Email = Schema.String.check(Schema.isPattern(EmailPattern));

export const LoginSchema = Schema.Struct({
	email: Email,
	password: Password,
});

export const SignupSchema = Schema.Struct({
	email: Email,
	password: Password,
	redirectUrl: Schema.optional(Schema.String),
});
