import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { eq } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import type { NewQuestion, Question } from "../db";
import { questions } from "../db";
import { DatabaseError, QuestionNotFoundError } from "../errors";

export interface IQuestionService {
	readonly getByQuestionnaireId: (
		questionnaireId: string,
	) => Effect.Effect<Question[], DatabaseError>;
	readonly getById: (
		id: string,
	) => Effect.Effect<Question, QuestionNotFoundError | DatabaseError>;
	readonly create: (
		data: Omit<NewQuestion, "id">,
	) => Effect.Effect<Question, DatabaseError>;
	readonly update: (
		id: string,
		data: Partial<Omit<NewQuestion, "id" | "questionnaireId">>,
	) => Effect.Effect<Question, QuestionNotFoundError | DatabaseError>;
	readonly delete: (ids: string[]) => Effect.Effect<void, DatabaseError>;
}

export class QuestionService extends Context.Tag("QuestionService")<
	QuestionService,
	IQuestionService
>() {}

export const QuestionServiceLive = Layer.effect(
	QuestionService,
	Effect.gen(function* () {
		const db = yield* PgDrizzle;

		const getByQuestionnaireId: IQuestionService["getByQuestionnaireId"] = (
			questionnaireId,
		) =>
			Effect.tryPromise({
				try: () =>
					db
						.select()
						.from(questions)
						.where(eq(questions.questionnaireId, questionnaireId))
						.orderBy(questions.orderNumber)
						.then((rows) => rows as Question[]),
				catch: (error) =>
					new DatabaseError({
						message: "Failed to fetch questions",
						cause: error,
					}),
			});

		const getById: IQuestionService["getById"] = (id) =>
			Effect.tryPromise({
				try: () =>
					db
						.select()
						.from(questions)
						.where(eq(questions.id, id))
						.then((rows) => rows[0] as Question | undefined),
				catch: (error) =>
					new DatabaseError({
						message: "Failed to fetch question",
						cause: error,
					}),
			}).pipe(
				Effect.flatMap((result) =>
					result
						? Effect.succeed(result)
						: Effect.fail(new QuestionNotFoundError({ id })),
				),
			);

		const create: IQuestionService["create"] = (data) =>
			Effect.tryPromise({
				try: () =>
					db
						.insert(questions)
						.values(data)
						.returning()
						.then((rows) => rows[0] as Question),
				catch: (error) =>
					new DatabaseError({
						message: "Failed to create question",
						cause: error,
					}),
			});

		const update: IQuestionService["update"] = (id, data) =>
			Effect.tryPromise({
				try: () =>
					db
						.update(questions)
						.set(data)
						.where(eq(questions.id, id))
						.returning()
						.then((rows) => rows[0] as Question | undefined),
				catch: (error) =>
					new DatabaseError({
						message: "Failed to update question",
						cause: error,
					}),
			}).pipe(
				Effect.flatMap((result) =>
					result
						? Effect.succeed(result)
						: Effect.fail(new QuestionNotFoundError({ id })),
				),
			);

		const deleteQuestions: IQuestionService["delete"] = (ids) =>
			Effect.tryPromise({
				try: async () => {
					for (const id of ids) {
						await db.delete(questions).where(eq(questions.id, id));
					}
				},
				catch: (error) =>
					new DatabaseError({
						message: "Failed to delete questions",
						cause: error,
					}),
			});

		return {
			getByQuestionnaireId,
			getById,
			create,
			update,
			delete: deleteQuestions,
		};
	}),
);
