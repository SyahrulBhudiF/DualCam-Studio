import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { eq, inArray } from "drizzle-orm";
import { Effect } from "effect";
import type { Answer, NewAnswer } from "../db";
import { answers } from "../db";
import { AnswerNotFoundError, DatabaseError } from "../errors";

export class AnswerService extends Effect.Service<AnswerService>()(
	"AnswerService",
	{
		accessors: true,
		dependencies: [],
		effect: Effect.gen(function* () {
			const db = yield* PgDrizzle;

			const getByQuestionId = Effect.fn("AnswerService.getByQuestionId")(
				function* (questionId: string) {
					const rows = yield* db
						.select()
						.from(answers)
						.where(eq(answers.questionId, questionId))
						.orderBy(answers.score).pipe(
							Effect.mapError(
								(e) =>
									new DatabaseError({
										message: "Failed to fetch answers",
										cause: e,
									}),
							),
						);
					return rows as Answer[];
				},
			);

			const getById = Effect.fn("AnswerService.getById")(function* (id: string) {
				const [result] = yield* db
					.select()
					.from(answers)
					.where(eq(answers.id, id)).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to fetch answer",
									cause: e,
								}),
						),
					);
				if (!result) {
					return yield* Effect.fail(new AnswerNotFoundError({ id }));
				}
				return result as Answer;
			});

			const getByIds = Effect.fn("AnswerService.getByIds")(function* (
				ids: string[],
			) {
				if (ids.length === 0) return [];
				const rows = yield* db
					.select()
					.from(answers)
					.where(inArray(answers.id, ids)).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to fetch answers by ids",
									cause: e,
								}),
						),
					);
				return rows as Answer[];
			});

			const create = Effect.fn("AnswerService.create")(function* (
				data: Omit<NewAnswer, "id">,
			) {
				const [result] = yield* db.insert(answers).values(data).returning().pipe(
					Effect.mapError(
						(e) =>
							new DatabaseError({
								message: "Failed to create answer",
								cause: e,
							}),
					),
				);
				return result as Answer;
			});

			const update = Effect.fn("AnswerService.update")(function* (
				id: string,
				data: Partial<Omit<NewAnswer, "id" | "questionId">>,
			) {
				const [result] = yield* db
					.update(answers)
					.set(data)
					.where(eq(answers.id, id))
					.returning().pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to update answer",
									cause: e,
								}),
						),
					);
				if (!result) {
					return yield* Effect.fail(new AnswerNotFoundError({ id }));
				}
				return result as Answer;
			});

			const deleteAnswers = Effect.fn("AnswerService.delete")(function* (
				ids: string[],
			) {
				if (ids.length > 0) {
					yield* db.delete(answers).where(inArray(answers.id, ids)).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to delete answers",
									cause: e,
								}),
						),
					);
				}
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
	},
) {}
