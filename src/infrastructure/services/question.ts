import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { eq, inArray } from "drizzle-orm";
import { Effect } from "effect";
import type { NewQuestion, Question } from "../db";
import { questions } from "../db";
import { DatabaseError, QuestionNotFoundError } from "../errors";

export class QuestionService extends Effect.Service<QuestionService>()(
	"QuestionService",
	{
		accessors: true,
		dependencies: [],
		effect: Effect.gen(function* () {
			const db = yield* PgDrizzle;

			const getByQuestionnaireId = Effect.fn(
				"QuestionService.getByQuestionnaireId",
			)(function* (questionnaireId: string) {
				const rows = yield* db
					.select()
					.from(questions)
					.where(eq(questions.questionnaireId, questionnaireId))
					.orderBy(questions.orderNumber).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to fetch questions",
									cause: e,
								}),
						),
					);
				return rows as Question[];
			});

			const getById = Effect.fn("QuestionService.getById")(function* (
				id: string,
			) {
				const [result] = yield* db
					.select()
					.from(questions)
					.where(eq(questions.id, id)).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to fetch question",
									cause: e,
								}),
						),
					);
				if (!result) {
					return yield* Effect.fail(new QuestionNotFoundError({ id }));
				}
				return result as Question;
			});

			const create = Effect.fn("QuestionService.create")(function* (
				data: Omit<NewQuestion, "id">,
			) {
				const [result] = yield* db.insert(questions).values(data).returning().pipe(
					Effect.mapError(
						(e) =>
							new DatabaseError({
								message: "Failed to create question",
								cause: e,
							}),
					),
				);
				return result as Question;
			});

			const update = Effect.fn("QuestionService.update")(function* (
				id: string,
				data: Partial<Omit<NewQuestion, "id" | "questionnaireId">>,
			) {
				const [result] = yield* db
					.update(questions)
					.set(data)
					.where(eq(questions.id, id))
					.returning().pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to update question",
									cause: e,
								}),
						),
					);
				if (!result) {
					return yield* Effect.fail(new QuestionNotFoundError({ id }));
				}
				return result as Question;
			});

			const deleteQuestions = Effect.fn("QuestionService.delete")(function* (
				ids: string[],
			) {
				if (ids.length > 0) {
					yield* db.delete(questions).where(inArray(questions.id, ids)).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to delete questions",
									cause: e,
								}),
						),
					);
				}
			});

			return {
				getByQuestionnaireId,
				getById,
				create,
				update,
				delete: deleteQuestions,
			};
		}),
	},
) {}
