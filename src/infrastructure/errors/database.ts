import { Data } from "effect";

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
	readonly message: string;
	readonly cause?: unknown;
}> {}

export class ConnectionError extends Data.TaggedError("ConnectionError")<{
	readonly message: string;
	readonly cause?: unknown;
}> {}

export class QueryError extends Data.TaggedError("QueryError")<{
	readonly message: string;
	readonly query?: string;
	readonly cause?: unknown;
}> {}

export class TransactionError extends Data.TaggedError("TransactionError")<{
	readonly message: string;
	readonly cause?: unknown;
}> {}
