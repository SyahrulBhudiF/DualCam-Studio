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
			Effect.gen(function* () {
				const rows = yield* db
					.select()
					.from(questions)
					.where(eq(questions.questionnaireId, questionnaireId))
					.orderBy(questions.orderNumber);
				return rows as Question[];
			}).pipe(
				Effect.mapError(
					(e) =>
						new DatabaseError({
							message: "Failed to fetch questions",
							cause: e,
						}),
				),
			);

		const getById: IQuestionService["getById"] = (id) =>
			Effect.gen(function* () {
				const [result] = yield* db
					.select()
					.from(questions)
					.where(eq(questions.id, id));
				if (!result) {
					return yield* Effect.fail(new QuestionNotFoundError({ id }));
				}
				return result as Question;
			}).pipe(
				Effect.mapError((e): QuestionNotFoundError | DatabaseError =>
					e instanceof QuestionNotFoundError
						? e
						: new DatabaseError({
								message: "Failed to fetch question",
								cause: e,
							}),
				),
			);

		const create: IQuestionService["create"] = (data) =>
			Effect.gen(function* () {
				const [result] = yield* db.insert(questions).values(data).returning();
				return result as Question;
			}).pipe(
				Effect.mapError(
					(e) =>
						new DatabaseError({
							message: "Failed to create question",
							cause: e,
						}),
				),
			);

		const update: IQuestionService["update"] = (id, data) =>
			Effect.gen(function* () {
				const [result] = yield* db
					.update(questions)
					.set(data)
					.where(eq(questions.id, id))
					.returning();
				if (!result) {
					return yield* Effect.fail(new QuestionNotFoundError({ id }));
				}
				return result as Question;
			}).pipe(
				Effect.mapError((e): QuestionNotFoundError | DatabaseError =>
					e instanceof QuestionNotFoundError
						? e
						: new DatabaseError({
								message: "Failed to update question",
								cause: e,
							}),
				),
			);

		const deleteQuestions: IQuestionService["delete"] = (ids) =>
			Effect.gen(function* () {
				for (const id of ids) {
					yield* db.delete(questions).where(eq(questions.id, id));
				}
			}).pipe(
				Effect.mapError(
					(e) =>
						new DatabaseError({
							message: "Failed to delete questions",
							cause: e,
						}),
				),
			);

		return {
			getByQuestionnaireId,
			getById,
			create,
			update,
			delete: deleteQuestions,
		};
	}),
);
