import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { eq } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import type { Answer, NewAnswer } from "../db";
import { answers } from "../db";
import { AnswerNotFoundError, DatabaseError } from "../errors";

export interface IAnswerService {
	readonly getByQuestionId: (
		questionId: string,
	) => Effect.Effect<Answer[], DatabaseError>;
	readonly getById: (
		id: string,
	) => Effect.Effect<Answer, AnswerNotFoundError | DatabaseError>;
	readonly getByIds: (ids: string[]) => Effect.Effect<Answer[], DatabaseError>;
	readonly create: (
		data: Omit<NewAnswer, "id">,
	) => Effect.Effect<Answer, DatabaseError>;
	readonly update: (
		id: string,
		data: Partial<Omit<NewAnswer, "id" | "questionId">>,
	) => Effect.Effect<Answer, AnswerNotFoundError | DatabaseError>;
	readonly delete: (ids: string[]) => Effect.Effect<void, DatabaseError>;
}

export class AnswerService extends Context.Tag("AnswerService")<
	AnswerService,
	IAnswerService
>() {}

export const AnswerServiceLive = Layer.effect(
	AnswerService,
	Effect.gen(function* () {
		const db = yield* PgDrizzle;

		const getByQuestionId: IAnswerService["getByQuestionId"] = (questionId) =>
			Effect.tryPromise({
				try: () =>
					db
						.select()
						.from(answers)
						.where(eq(answers.questionId, questionId))
						.orderBy(answers.score)
						.then((rows) => rows as Answer[]),
				catch: (error) =>
					new DatabaseError({
						message: "Failed to fetch answers",
						cause: error,
					}),
			});

		const getById: IAnswerService["getById"] = (id) =>
			Effect.tryPromise({
				try: () =>
					db
						.select()
						.from(answers)
						.where(eq(answers.id, id))
						.then((rows) => rows[0] as Answer | undefined),
				catch: (error) =>
					new DatabaseError({
						message: "Failed to fetch answer",
						cause: error,
					}),
			}).pipe(
				Effect.flatMap((result) =>
					result
						? Effect.succeed(result)
						: Effect.fail(new AnswerNotFoundError({ id })),
				),
			);

		const getByIds: IAnswerService["getByIds"] = (ids) =>
			Effect.tryPromise({
				try: async () => {
					const results: Answer[] = [];
					for (const id of ids) {
						const rows = await db
							.select()
							.from(answers)
							.where(eq(answers.id, id));
						if (rows[0]) results.push(rows[0] as Answer);
					}
					return results;
				},
				catch: (error) =>
					new DatabaseError({
						message: "Failed to fetch answers by ids",
						cause: error,
					}),
			});

		const create: IAnswerService["create"] = (data) =>
			Effect.tryPromise({
				try: () =>
					db
						.insert(answers)
						.values(data)
						.returning()
						.then((rows) => rows[0] as Answer),
				catch: (error) =>
					new DatabaseError({
						message: "Failed to create answer",
						cause: error,
					}),
			});

		const update: IAnswerService["update"] = (id, data) =>
			Effect.tryPromise({
				try: () =>
					db
						.update(answers)
						.set(data)
						.where(eq(answers.id, id))
						.returning()
						.then((rows) => rows[0] as Answer | undefined),
				catch: (error) =>
					new DatabaseError({
						message: "Failed to update answer",
						cause: error,
					}),
			}).pipe(
				Effect.flatMap((result) =>
					result
						? Effect.succeed(result)
						: Effect.fail(new AnswerNotFoundError({ id })),
				),
			);

		const deleteAnswers: IAnswerService["delete"] = (ids) =>
			Effect.tryPromise({
				try: async () => {
					for (const id of ids) {
						await db.delete(answers).where(eq(answers.id, id));
					}
				},
				catch: (error) =>
					new DatabaseError({
						message: "Failed to delete answers",
						cause: error,
					}),
			});

		return {
			getByQuestionId,
			getById,
			getByIds,
			create,
			update,
			delete: deleteAnswers,
		};
	}),
);
