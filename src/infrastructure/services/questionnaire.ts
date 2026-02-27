import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { PgClient } from "@effect/sql-pg";
import { eq, inArray } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import type { NewQuestionnaire, Questionnaire } from "../db";
import { answers, questionnaires, questions } from "../db";
import { DatabaseError, QuestionnaireNotFoundError } from "../errors";

export interface IQuestionnaireService {
	readonly getAll: Effect.Effect<Questionnaire[], DatabaseError>;
	readonly getById: (
		id: string,
	) => Effect.Effect<Questionnaire, QuestionnaireNotFoundError | DatabaseError>;
	readonly getActive: Effect.Effect<
		{
			questionnaire: Questionnaire;
			questions: Array<{
				id: string;
				questionText: string;
				orderNumber: number;
				answers: Array<{ id: string; answerText: string; score: number }>;
			}>;
		},
		QuestionnaireNotFoundError | DatabaseError
	>;
	readonly create: (
		data: Omit<NewQuestionnaire, "id" | "createdAt">,
	) => Effect.Effect<Questionnaire, DatabaseError>;
	readonly update: (
		id: string,
		data: Partial<Omit<NewQuestionnaire, "id" | "createdAt">>,
	) => Effect.Effect<Questionnaire, QuestionnaireNotFoundError | DatabaseError>;
	readonly delete: (ids: string[]) => Effect.Effect<void, DatabaseError>;
	readonly setActive: (
		id: string,
	) => Effect.Effect<void, QuestionnaireNotFoundError | DatabaseError>;
}

export class QuestionnaireService extends Context.Tag("QuestionnaireService")<
	QuestionnaireService,
	IQuestionnaireService
>() {}

export const QuestionnaireServiceLive = Layer.effect(
	QuestionnaireService,
	Effect.gen(function* () {
		const db = yield* PgDrizzle;
		const sql = yield* PgClient.PgClient;

		const getAll: IQuestionnaireService["getAll"] = Effect.gen(function* () {
			const rows = yield* db
				.select()
				.from(questionnaires)
				.orderBy(questionnaires.createdAt);
			return rows as Questionnaire[];
		}).pipe(
			Effect.mapError(
				(e) =>
					new DatabaseError({
						message: "Failed to fetch questionnaires",
						cause: e,
					}),
			),
		);

		const getById: IQuestionnaireService["getById"] = (id) =>
			Effect.gen(function* () {
				const [result] = yield* db
					.select()
					.from(questionnaires)
					.where(eq(questionnaires.id, id));
				if (!result) {
					return yield* Effect.fail(new QuestionnaireNotFoundError({ id }));
				}
				return result as Questionnaire;
			}).pipe(
				Effect.mapError((e): QuestionnaireNotFoundError | DatabaseError =>
					e instanceof QuestionnaireNotFoundError
						? e
						: new DatabaseError({
								message: "Failed to fetch questionnaire",
								cause: e,
							}),
				),
			);

		const getActive: IQuestionnaireService["getActive"] = Effect.gen(
			function* () {
				const [questionnaire] = yield* db
					.select()
					.from(questionnaires)
					.where(eq(questionnaires.isActive, true))
					.limit(1);

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
					.orderBy(questions.orderNumber);

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
			},
		).pipe(
			Effect.mapError((e): QuestionnaireNotFoundError | DatabaseError =>
				e instanceof QuestionnaireNotFoundError
					? e
					: new DatabaseError({
							message: "Failed to fetch active questionnaire",
							cause: e,
						}),
			),
		);

		const create: IQuestionnaireService["create"] = (data) =>
			Effect.gen(function* () {
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
					);
				}

				const [result] = yield* db
					.insert(questionnaires)
					.values(data)
					.returning();
				return result as Questionnaire;
			}).pipe(
				Effect.mapError(
					(e) =>
						new DatabaseError({
							message: "Failed to create questionnaire",
							cause: e,
						}),
				),
			);

		const update: IQuestionnaireService["update"] = (id, data) =>
			Effect.gen(function* () {
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
					);
				}

				const [result] = yield* db
					.update(questionnaires)
					.set(data)
					.where(eq(questionnaires.id, id))
					.returning();

				if (!result) {
					return yield* Effect.fail(new QuestionnaireNotFoundError({ id }));
				}

				return result as Questionnaire;
			}).pipe(
				Effect.mapError((e): QuestionnaireNotFoundError | DatabaseError =>
					e instanceof QuestionnaireNotFoundError
						? e
						: new DatabaseError({
								message: "Failed to update questionnaire",
								cause: e,
							}),
				),
			);

		const deleteQuestionnaires: IQuestionnaireService["delete"] = (ids) =>
			Effect.gen(function* () {
				if (ids.length > 0) {
					yield* db
						.delete(questionnaires)
						.where(inArray(questionnaires.id, ids));
				}
			}).pipe(
				Effect.mapError(
					(e) =>
						new DatabaseError({
							message: "Failed to delete questionnaires",
							cause: e,
						}),
				),
			);

		const setActive: IQuestionnaireService["setActive"] = (id) =>
			Effect.gen(function* () {
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
				);
			}).pipe(
				Effect.mapError((e): QuestionnaireNotFoundError | DatabaseError =>
					e instanceof QuestionnaireNotFoundError
						? e
						: new DatabaseError({
								message: "Failed to activate questionnaire",
								cause: e,
							}),
				),
			);

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
);
