import { Data } from "effect";

export class UnauthorizedError extends Data.TaggedError("UnauthorizedError")<{
	readonly message: string;
}> {}

export class InvalidCredentialsError extends Data.TaggedError(
	"InvalidCredentialsError",
)<{
	readonly message: string;
}> {}

export class SessionExpiredError extends Data.TaggedError(
	"SessionExpiredError",
)<{
	readonly message: string;
}> {}

export class SignupError extends Data.TaggedError("SignupError")<{
	readonly message: string;
	readonly cause?: unknown;
}> {}

export class TokenError extends Data.TaggedError("TokenError")<{
	readonly message: string;
	readonly cause?: unknown;
}> {}
