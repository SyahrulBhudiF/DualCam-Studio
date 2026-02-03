import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { eq } from "drizzle-orm";
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

		const getAll: IQuestionnaireService["getAll"] = Effect.tryPromise({
			try: () =>
				db
					.select()
					.from(questionnaires)
					.orderBy(questionnaires.createdAt)
					.then((rows) => rows as Questionnaire[]),
			catch: (error) =>
				new DatabaseError({
					message: "Failed to fetch questionnaires",
					cause: error,
				}),
		});

		const getById: IQuestionnaireService["getById"] = (id) =>
			Effect.tryPromise({
				try: () =>
					db
						.select()
						.from(questionnaires)
						.where(eq(questionnaires.id, id))
						.then((rows) => rows[0] as Questionnaire | undefined),
				catch: (error) =>
					new DatabaseError({
						message: "Failed to fetch questionnaire",
						cause: error,
					}),
			}).pipe(
				Effect.flatMap((result) =>
					result
						? Effect.succeed(result)
						: Effect.fail(new QuestionnaireNotFoundError({ id })),
				),
			);

		const getActive: IQuestionnaireService["getActive"] = Effect.gen(
			function* () {
				const questionnaire = yield* Effect.tryPromise({
					try: () =>
						db
							.select()
							.from(questionnaires)
							.where(eq(questionnaires.isActive, true))
							.limit(1)
							.then((rows) => rows[0] as Questionnaire | undefined),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to fetch active questionnaire",
							cause: error,
						}),
				});

				if (!questionnaire) {
					return yield* Effect.fail(
						new QuestionnaireNotFoundError({ id: "active" }),
					);
				}

				// Fetch questions with their answers in a single JOIN query
				const rows = yield* Effect.tryPromise({
					try: () =>
						db
							.select({
								question: questions,
								answer: answers,
							})
							.from(questions)
							.leftJoin(answers, eq(questions.id, answers.questionId))
							.where(eq(questions.questionnaireId, questionnaire.id))
							.orderBy(questions.orderNumber),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to fetch questions with answers",
							cause: error,
						}),
				});

				// Group answers by question
				const questionMap = new Map<
					string,
					{
						id: string;
						questionText: string;
						orderNumber: number;
						answers: Array<{ id: string; answerText: string; score: number }>;
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
					questionnaire,
					questions: Array.from(questionMap.values()),
				};
			},
		);

		const create: IQuestionnaireService["create"] = (data) =>
			Effect.gen(function* () {
				if (data.isActive) {
					yield* Effect.tryPromise({
						try: () =>
							db
								.update(questionnaires)
								.set({ isActive: false })
								.where(eq(questionnaires.isActive, true)),
						catch: (error) =>
							new DatabaseError({
								message: "Failed to deactivate questionnaires",
								cause: error,
							}),
					});
				}

				const result = yield* Effect.tryPromise({
					try: () =>
						db
							.insert(questionnaires)
							.values(data)
							.returning()
							.then((rows) => rows[0] as Questionnaire),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to create questionnaire",
							cause: error,
						}),
				});

				return result;
			});

		const update: IQuestionnaireService["update"] = (id, data) =>
			Effect.gen(function* () {
				if (data.isActive) {
					yield* Effect.tryPromise({
						try: () =>
							db
								.update(questionnaires)
								.set({ isActive: false })
								.where(eq(questionnaires.isActive, true)),
						catch: (error) =>
							new DatabaseError({
								message: "Failed to deactivate questionnaires",
								cause: error,
							}),
					});
				}

				const result = yield* Effect.tryPromise({
					try: () =>
						db
							.update(questionnaires)
							.set(data)
							.where(eq(questionnaires.id, id))
							.returning()
							.then((rows) => rows[0] as Questionnaire | undefined),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to update questionnaire",
							cause: error,
						}),
				});

				if (!result) {
					return yield* Effect.fail(new QuestionnaireNotFoundError({ id }));
				}

				return result;
			});

		const deleteQuestionnaires: IQuestionnaireService["delete"] = (ids) =>
			Effect.tryPromise({
				try: async () => {
					for (const id of ids) {
						await db.delete(questionnaires).where(eq(questionnaires.id, id));
					}
				},
				catch: (error) =>
					new DatabaseError({
						message: "Failed to delete questionnaires",
						cause: error,
					}),
			});

		const setActive: IQuestionnaireService["setActive"] = (id) =>
			Effect.gen(function* () {
				yield* Effect.tryPromise({
					try: () =>
						db
							.update(questionnaires)
							.set({ isActive: false })
							.where(eq(questionnaires.isActive, true)),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to deactivate questionnaires",
							cause: error,
						}),
				});

				const result = yield* Effect.tryPromise({
					try: () =>
						db
							.update(questionnaires)
							.set({ isActive: true })
							.where(eq(questionnaires.id, id))
							.returning()
							.then((rows) => rows[0]),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to activate questionnaire",
							cause: error,
						}),
				});

				if (!result) {
					return yield* Effect.fail(new QuestionnaireNotFoundError({ id }));
				}
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
);
