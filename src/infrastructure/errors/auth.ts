import { Schema } from "effect";

export class UnauthorizedError extends Schema.TaggedError<UnauthorizedError>()(
	"UnauthorizedError",
	{
		message: Schema.String,
	}
) {}

export class InvalidCredentialsError extends Schema.TaggedError<InvalidCredentialsError>()(
	"InvalidCredentialsError",
	{
		message: Schema.String,
	}
) {}

export class SessionExpiredError extends Schema.TaggedError<SessionExpiredError>()(
	"SessionExpiredError",
	{
		message: Schema.String,
	}
) {}

export class SignupError extends Schema.TaggedError<SignupError>()(
	"SignupError",
	{
		message: Schema.String,
		cause: Schema.optional(Schema.Unknown),
	}
) {}

export class TokenError extends Schema.TaggedError<TokenError>()(
	"TokenError",
	{
		message: Schema.String,
		cause: Schema.optional(Schema.Unknown),
	}
) {}

export class RateLimitError extends Schema.TaggedError<RateLimitError>()(
	"RateLimitError",
	{
		message: Schema.String,
		retryAfterMs: Schema.Number,
	}
) {}

export class CsrfError extends Schema.TaggedError<CsrfError>()(
	"CsrfError",
	{
		message: Schema.String,
	}
) {}
