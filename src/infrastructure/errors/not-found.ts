import { Data } from "effect";

export class QuestionnaireNotFoundError extends Data.TaggedError(
	"QuestionnaireNotFoundError",
)<{
	readonly id: string;
	readonly message?: string;
}> {}

export class QuestionNotFoundError extends Data.TaggedError(
	"QuestionNotFoundError",
)<{
	readonly id: string;
	readonly message?: string;
}> {}

export class AnswerNotFoundError extends Data.TaggedError(
	"AnswerNotFoundError",
)<{
	readonly id: string;
	readonly message?: string;
}> {}

export class ProfileNotFoundError extends Data.TaggedError(
	"ProfileNotFoundError",
)<{
	readonly id?: string;
	readonly email?: string;
	readonly message?: string;
}> {}

export class ResponseNotFoundError extends Data.TaggedError(
	"ResponseNotFoundError",
)<{
	readonly id: string;
	readonly message?: string;
}> {}

export class UserNotFoundError extends Data.TaggedError("UserNotFoundError")<{
	readonly id?: string;
	readonly email?: string;
	readonly message?: string;
}> {}
