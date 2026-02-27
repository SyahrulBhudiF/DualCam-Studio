import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { PgClient } from "@effect/sql-pg";
import { eq, inArray } from "drizzle-orm";
import { Effect } from "effect";
import type { NewQuestionnaire, Questionnaire } from "../db";
import { answers, questionnaires, questions } from "../db";
import { DatabaseError, QuestionnaireNotFoundError } from "../errors";

export class QuestionnaireService extends Effect.Service<QuestionnaireService>()(
	"QuestionnaireService",
	{
		accessors: true,
		dependencies: [],
		effect: Effect.gen(function* () {
			const db = yield* PgDrizzle;
			const sql = yield* PgClient.PgClient;

			const getAll = Effect.fn("QuestionnaireService.getAll")(function* () {
				const rows = yield* db
					.select()
					.from(questionnaires)
					.orderBy(questionnaires.createdAt).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to fetch questionnaires",
									cause: e,
								}),
						),
					);
				return rows as Questionnaire[];
			});

			const getById = Effect.fn("QuestionnaireService.getById")(function* (
				id: string,
			) {
				const [result] = yield* db
					.select()
					.from(questionnaires)
					.where(eq(questionnaires.id, id)).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to fetch questionnaire",
									cause: e,
								}),
						),
					);
				if (!result) {
					return yield* Effect.fail(new QuestionnaireNotFoundError({ id }));
				}
				return result as Questionnaire;
			});

			const getActive = Effect.fn("QuestionnaireService.getActive")(function* () {
				const [questionnaire] = yield* db
					.select()
					.from(questionnaires)
					.where(eq(questionnaires.isActive, true))
					.limit(1).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to fetch active questionnaire",
									cause: e,
								}),
						),
					);

				if (!questionnaire) {
					return yield* Effect.fail(
						new QuestionnaireNotFoundError({ id: "active" }),
					);
				}

				// Fetch questions with their answers in a single JOIN query
				const rows = yield* db
					.select({
						question: questions,
						answer: answers,
					})
					.from(questions)
					.leftJoin(answers, eq(questions.id, answers.questionId))
					.where(
						eq(questions.questionnaireId, (questionnaire as Questionnaire).id),
					)
					.orderBy(questions.orderNumber).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to fetch active questionnaire questions",
									cause: e,
								}),
						),
					);

				// Group answers by question
				const questionMap = new Map<
					string,
					{
						id: string;
						questionText: string;
						orderNumber: number;
						answers: Array<{
							id: string;
							answerText: string;
							score: number;
						}>;
					}
				>();

				for (const row of rows) {
					const q = row.question;
					if (!questionMap.has(q.id)) {
						questionMap.set(q.id, {
							id: q.id,
							questionText: q.questionText,
							orderNumber: q.orderNumber,
							answers: [],
						});
					}
					if (row.answer) {
						questionMap.get(q.id)?.answers.push({
							id: row.answer.id,
							answerText: row.answer.answerText,
							score: row.answer.score,
						});
					}
				}

				return {
					questionnaire: questionnaire as Questionnaire,
					questions: Array.from(questionMap.values()),
				};
			});

			const create = Effect.fn("QuestionnaireService.create")(function* (
				data: Omit<NewQuestionnaire, "id" | "createdAt">,
			) {
				if (data.isActive) {
					// Use transaction for atomic deactivate-all + create
					return yield* sql.withTransaction(
						Effect.gen(function* () {
							yield* db
								.update(questionnaires)
								.set({ isActive: false })
								.where(eq(questionnaires.isActive, true));

							const [result] = yield* db
								.insert(questionnaires)
								.values(data)
								.returning();
							return result as Questionnaire;
						}),
					).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to create questionnaire",
									cause: e,
								}),
						),
					);
				}

				const [result] = yield* db
					.insert(questionnaires)
					.values(data)
					.returning().pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to create questionnaire",
									cause: e,
								}),
						),
					);
				return result as Questionnaire;
			});

			const update = Effect.fn("QuestionnaireService.update")(function* (
				id: string,
				data: Partial<Omit<NewQuestionnaire, "id" | "createdAt">>,
			) {
				if (data.isActive) {
					// Use transaction for atomic deactivate-all + update
					return yield* sql.withTransaction(
						Effect.gen(function* () {
							yield* db
								.update(questionnaires)
								.set({ isActive: false })
								.where(eq(questionnaires.isActive, true));

							const [result] = yield* db
								.update(questionnaires)
								.set(data)
								.where(eq(questionnaires.id, id))
								.returning();

							if (!result) {
								return yield* Effect.fail(
									new QuestionnaireNotFoundError({ id }),
								);
							}

							return result as Questionnaire;
						}),
					).pipe(
						Effect.catchTag("DatabaseError", (e) => Effect.fail(e)),
						Effect.catchAll((e) =>
							e instanceof QuestionnaireNotFoundError ? Effect.fail(e) : Effect.fail(
								new DatabaseError({
									message: "Failed to update questionnaire",
									cause: e,
								})
							)
						),
					);
				}

				const [result] = yield* db
					.update(questionnaires)
					.set(data)
					.where(eq(questionnaires.id, id))
					.returning().pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to update questionnaire",
									cause: e,
								}),
						),
					);

				if (!result) {
					return yield* Effect.fail(new QuestionnaireNotFoundError({ id }));
				}

				return result as Questionnaire;
			});

			const deleteQuestionnaires = Effect.fn("QuestionnaireService.delete")(function* (
				ids: string[],
			) {
				if (ids.length > 0) {
					yield* db
						.delete(questionnaires)
						.where(inArray(questionnaires.id, ids)).pipe(
							Effect.mapError(
								(e) =>
									new DatabaseError({
										message: "Failed to delete questionnaires",
										cause: e,
									}),
							),
						);
				}
			});

			const setActive = Effect.fn("QuestionnaireService.setActive")(function* (
				id: string,
			) {
				// Use transaction for atomic deactivate-all + activate-one
				yield* sql.withTransaction(
					Effect.gen(function* () {
						yield* db
							.update(questionnaires)
							.set({ isActive: false })
							.where(eq(questionnaires.isActive, true));

						const [result] = yield* db
							.update(questionnaires)
							.set({ isActive: true })
							.where(eq(questionnaires.id, id))
							.returning();

						if (!result) {
							return yield* Effect.fail(
								new QuestionnaireNotFoundError({ id }),
							);
						}
					}),
				).pipe(
					Effect.catchTag("DatabaseError", (e) => Effect.fail(e)),
					Effect.catchAll((e) =>
						e instanceof QuestionnaireNotFoundError ? Effect.fail(e) : Effect.fail(
							new DatabaseError({
								message: "Failed to activate questionnaire",
								cause: e,
							})
						)
					),
				);
			});

			return {
				getAll,
				getById,
				getActive,
				create,
				update,
				delete: deleteQuestionnaires,
				setActive,
			};
		}),
	},
) {}
