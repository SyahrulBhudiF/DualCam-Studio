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
			Effect.gen(function* () {
				const rows = yield* db
					.select()
					.from(answers)
					.where(eq(answers.questionId, questionId))
					.orderBy(answers.score);
				return rows as Answer[];
			}).pipe(
				Effect.mapError(
					(e) =>
						new DatabaseError({
							message: "Failed to fetch answers",
							cause: e,
						}),
				),
			);

		const getById: IAnswerService["getById"] = (id) =>
			Effect.gen(function* () {
				const [result] = yield* db
					.select()
					.from(answers)
					.where(eq(answers.id, id));
				if (!result) {
					return yield* Effect.fail(new AnswerNotFoundError({ id }));
				}
				return result as Answer;
			}).pipe(
				Effect.mapError((e): AnswerNotFoundError | DatabaseError =>
					e instanceof AnswerNotFoundError
						? e
						: new DatabaseError({
								message: "Failed to fetch answer",
								cause: e,
							}),
				),
			);

		const getByIds: IAnswerService["getByIds"] = (ids) =>
			Effect.gen(function* () {
				const results: Answer[] = [];
				for (const id of ids) {
					const [row] = yield* db
						.select()
						.from(answers)
						.where(eq(answers.id, id));
					if (row) results.push(row as Answer);
				}
				return results;
			}).pipe(
				Effect.mapError(
					(e) =>
						new DatabaseError({
							message: "Failed to fetch answers by ids",
							cause: e,
						}),
				),
			);

		const create: IAnswerService["create"] = (data) =>
			Effect.gen(function* () {
				const [result] = yield* db.insert(answers).values(data).returning();
				return result as Answer;
			}).pipe(
				Effect.mapError(
					(e) =>
						new DatabaseError({
							message: "Failed to create answer",
							cause: e,
						}),
				),
			);

		const update: IAnswerService["update"] = (id, data) =>
			Effect.gen(function* () {
				const [result] = yield* db
					.update(answers)
					.set(data)
					.where(eq(answers.id, id))
					.returning();
				if (!result) {
					return yield* Effect.fail(new AnswerNotFoundError({ id }));
				}
				return result as Answer;
			}).pipe(
				Effect.mapError((e): AnswerNotFoundError | DatabaseError =>
					e instanceof AnswerNotFoundError
						? e
						: new DatabaseError({
								message: "Failed to update answer",
								cause: e,
							}),
				),
			);

		const deleteAnswers: IAnswerService["delete"] = (ids) =>
			Effect.gen(function* () {
				for (const id of ids) {
					yield* db.delete(answers).where(eq(answers.id, id));
				}
			}).pipe(
				Effect.mapError(
					(e) =>
						new DatabaseError({
							message: "Failed to delete answers",
							cause: e,
						}),
				),
			);

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
