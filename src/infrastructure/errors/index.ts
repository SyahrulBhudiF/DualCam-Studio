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

export {
	AnswerNotFoundError,
	ProfileNotFoundError,
	QuestionNotFoundError,
	QuestionnaireNotFoundError,
	ResponseNotFoundError,
	UserNotFoundError,
} from "./not-found";

export { ParseError, ValidationError } from "./validation";

import type {
	InvalidCredentialsError,
	SessionExpiredError,
	SignupError,
	TokenError,
	UnauthorizedError,
} from "./auth";
import type {
	ConnectionError,
	DatabaseError,
	QueryError,
	TransactionError,
} from "./database";
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
	| TransactionError
	| UnauthorizedError
	| InvalidCredentialsError
	| SessionExpiredError
	| SignupError
	| TokenError
	| ValidationError
	| ParseError
	| QuestionnaireNotFoundError
	| QuestionNotFoundError
	| AnswerNotFoundError
	| ProfileNotFoundError
	| ResponseNotFoundError
	| UserNotFoundError;
