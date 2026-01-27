// Database errors

// Auth errors
export {
	InvalidCredentialsError,
	SessionExpiredError,
	SignupError,
	TokenError,
	UnauthorizedError,
} from "./auth";
export {
	ConnectionError,
	DatabaseError,
	QueryError,
	TransactionError,
} from "./database";
// Not found errors
export {
	AnswerNotFoundError,
	ProfileNotFoundError,
	QuestionNotFoundError,
	QuestionnaireNotFoundError,
	ResponseNotFoundError,
	UserNotFoundError,
} from "./not-found";
// Validation errors
export { ParseError, ValidationError } from "./validation";

import type {
	InvalidCredentialsError,
	SessionExpiredError,
	SignupError,
	UnauthorizedError,
} from "./auth";
// Union type for all application errors
import type { ConnectionError, DatabaseError, QueryError } from "./database";
import type {
	AnswerNotFoundError,
	ProfileNotFoundError,
	QuestionNotFoundError,
	QuestionnaireNotFoundError,
	ResponseNotFoundError,
	UserNotFoundError,
} from "./not-found";
import type { ParseError, ValidationError } from "./validation";

export type AppError =
	| DatabaseError
	| ConnectionError
	| QueryError
	| UnauthorizedError
	| InvalidCredentialsError
	| SessionExpiredError
	| SignupError
	| ValidationError
	| ParseError
	| QuestionnaireNotFoundError
	| QuestionNotFoundError
	| AnswerNotFoundError
	| ProfileNotFoundError
	| ResponseNotFoundError
	| UserNotFoundError;
