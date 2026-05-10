export { DatabaseError } from"./database";

export {
	AnswerNotFoundError,
	ProfileNotFoundError,
	QuestionNotFoundError,
	QuestionnaireNotFoundError,
	ResponseNotFoundError,
} from"./not-found";

import type {
	CsrfError,
	InvalidCredentialsError,
	RateLimitError,
	SessionExpiredError,
	SignupError,
	TokenError,
	UnauthorizedError,
} from"./auth";
import type { DatabaseError } from"./database";
import type { FileError } from"./file";
import type {
	AnswerNotFoundError,
	ProfileNotFoundError,
	QuestionNotFoundError,
	QuestionnaireNotFoundError,
	ResponseNotFoundError,
	UserNotFoundError,
} from"./not-found";
import type { ParseError, ValidationError } from"./validation";

type AppError =
	| DatabaseError
	| FileError
	| UnauthorizedError
	| InvalidCredentialsError
	| SessionExpiredError
	| SignupError
	| TokenError
	| RateLimitError
	| CsrfError
	| ValidationError
	| ParseError
	| QuestionnaireNotFoundError
	| QuestionNotFoundError
	| AnswerNotFoundError
	| ProfileNotFoundError
	| ResponseNotFoundError
	| UserNotFoundError;
