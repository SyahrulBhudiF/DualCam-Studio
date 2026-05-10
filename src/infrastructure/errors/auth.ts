import { Schema } from "effect";

export class UnauthorizedError extends Schema.TaggedErrorClass<UnauthorizedError>()(
	"UnauthorizedError",
	{
		message: Schema.String,
	},
) {}

export class InvalidCredentialsError extends Schema.TaggedErrorClass<InvalidCredentialsError>()(
	"InvalidCredentialsError",
	{
		message: Schema.String,
	},
) {}

export class SessionExpiredError extends Schema.TaggedErrorClass<SessionExpiredError>()(
	"SessionExpiredError",
	{
		message: Schema.String,
	},
) {}

export class SignupError extends Schema.TaggedErrorClass<SignupError>()(
	"SignupError",
	{
		message: Schema.String,
		cause: Schema.optional(Schema.Unknown),
	},
) {}

export class TokenError extends Schema.TaggedErrorClass<TokenError>()(
	"TokenError",
	{
		message: Schema.String,
		cause: Schema.optional(Schema.Unknown),
	},
) {}

export class RateLimitError extends Schema.TaggedErrorClass<RateLimitError>()(
	"RateLimitError",
	{
		message: Schema.String,
		retryAfterMs: Schema.Number,
	},
) {}

export class CsrfError extends Schema.TaggedErrorClass<CsrfError>()(
	"CsrfError",
	{
		message: Schema.String,
	},
) {}
