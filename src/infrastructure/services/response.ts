import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import type { SQL } from "drizzle-orm";
import { and, desc, eq, gte, ilike, lte } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import type {
	NewResponse,
	NewResponseDetail,
	Profile,
	Questionnaire,
	Response,
} from "../db";
import {
	answers,
	profiles,
	questionnaires,
	questions,
	responseDetails,
	responses,
} from "../db";
import { DatabaseError, ResponseNotFoundError } from "../errors";

export interface ResponseWithProfile extends Response {
	profile: Profile | null;
	questionnaire: Questionnaire | null;
}

export interface ResponseDetail {
	id: string;
	responseId: string;
	questionId: string;
	answerId: string;
	score: number;
	videoSegmentPath: unknown;
	questionText: string | null;
	orderNumber: number | null;
	answerText: string | null;
}

export interface ResponseFull extends ResponseWithProfile {
	details: ResponseDetail[];
}

export interface ResponseFilter {
	questionnaireId?: string;
	className?: string;
	name?: string;
	startDate?: string;
	endDate?: string;
}

export interface IResponseService {
	readonly getAll: Effect.Effect<ResponseWithProfile[], DatabaseError>;
	readonly getById: (
		id: string,
	) => Effect.Effect<ResponseFull, ResponseNotFoundError | DatabaseError>;
	readonly getByQuestionnaireId: (
		questionnaireId: string,
	) => Effect.Effect<ResponseWithProfile[], DatabaseError>;
	readonly getFiltered: (
		filter: ResponseFilter,
	) => Effect.Effect<ResponseWithProfile[], DatabaseError>;
	readonly create: (
		data: Omit<NewResponse, "id" | "createdAt">,
		details: Omit<NewResponseDetail, "id" | "responseId">[],
	) => Effect.Effect<Response, DatabaseError>;
	readonly delete: (ids: string[]) => Effect.Effect<void, DatabaseError>;
	readonly getAllWithDetails: Effect.Effect<
		ResponseFull[],
		ResponseNotFoundError | DatabaseError
	>;
}

export class ResponseService extends Context.Tag("ResponseService")<
	ResponseService,
	IResponseService
>() {}

export const ResponseServiceLive = Layer.effect(
	ResponseService,
	Effect.gen(function* () {
		const db = yield* PgDrizzle;

		const getAll: IResponseService["getAll"] = Effect.gen(function* () {
			const rows = yield* Effect.tryPromise({
				try: () =>
					db
						.select({
							response: responses,
							profile: profiles,
							questionnaire: questionnaires,
						})
						.from(responses)
						.leftJoin(profiles, eq(responses.userId, profiles.id))
						.leftJoin(
							questionnaires,
							eq(responses.questionnaireId, questionnaires.id),
						)
						.orderBy(desc(responses.createdAt)),
				catch: (error) =>
					new DatabaseError({
						message: "Failed to fetch responses",
						cause: error,
					}),
			});

			return rows.map((row) => ({
				...(row.response as Response),
				profile: (row.profile as Profile) ?? null,
				questionnaire: (row.questionnaire as Questionnaire) ?? null,
			}));
		});

		const getById: IResponseService["getById"] = (id) =>
			Effect.gen(function* () {
				const responseRow = yield* Effect.tryPromise({
					try: () =>
						db
							.select({
								response: responses,
								profile: profiles,
								questionnaire: questionnaires,
							})
							.from(responses)
							.leftJoin(profiles, eq(responses.userId, profiles.id))
							.leftJoin(
								questionnaires,
								eq(responses.questionnaireId, questionnaires.id),
							)
							.where(eq(responses.id, id))
							.then((rows) => rows[0]),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to fetch response",
							cause: error,
						}),
				});

				if (!responseRow) {
					return yield* Effect.fail(new ResponseNotFoundError({ id }));
				}

				const detailRows = yield* Effect.tryPromise({
					try: () =>
						db
							.select({
								detail: responseDetails,
								question: questions,
								answer: answers,
							})
							.from(responseDetails)
							.leftJoin(questions, eq(responseDetails.questionId, questions.id))
							.leftJoin(answers, eq(responseDetails.answerId, answers.id))
							.where(eq(responseDetails.responseId, id))
							.orderBy(questions.orderNumber),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to fetch response details",
							cause: error,
						}),
				});

				const details: ResponseDetail[] = detailRows.map((row) => ({
					id: row.detail.id,
					responseId: row.detail.responseId,
					questionId: row.detail.questionId,
					answerId: row.detail.answerId,
					score: row.detail.score,
					videoSegmentPath: row.detail.videoSegmentPath,
					questionText: row.question?.questionText ?? null,
					orderNumber: row.question?.orderNumber ?? null,
					answerText: row.answer?.answerText ?? null,
				}));

				return {
					...(responseRow.response as Response),
					profile: (responseRow.profile as Profile) ?? null,
					questionnaire: (responseRow.questionnaire as Questionnaire) ?? null,
					details,
				};
			});

		const getByQuestionnaireId: IResponseService["getByQuestionnaireId"] = (
			questionnaireId,
		) =>
			Effect.gen(function* () {
				const rows = yield* Effect.tryPromise({
					try: () =>
						db
							.select({
								response: responses,
								profile: profiles,
								questionnaire: questionnaires,
							})
							.from(responses)
							.leftJoin(profiles, eq(responses.userId, profiles.id))
							.leftJoin(
								questionnaires,
								eq(responses.questionnaireId, questionnaires.id),
							)
							.where(eq(responses.questionnaireId, questionnaireId))
							.orderBy(desc(responses.createdAt)),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to fetch responses",
							cause: error,
						}),
				});

				return rows.map((row) => ({
					...(row.response as Response),
					profile: (row.profile as Profile) ?? null,
					questionnaire: (row.questionnaire as Questionnaire) ?? null,
				}));
			});

		const getFiltered: IResponseService["getFiltered"] = (filter) =>
			Effect.gen(function* () {
				const conditions: SQL[] = [];

				if (filter.questionnaireId) {
					conditions.push(
						eq(responses.questionnaireId, filter.questionnaireId),
					);
				}
				if (filter.startDate) {
					conditions.push(gte(responses.createdAt, new Date(filter.startDate)));
				}
				if (filter.endDate) {
					conditions.push(lte(responses.createdAt, new Date(filter.endDate)));
				}
				if (filter.className) {
					conditions.push(eq(profiles.class, filter.className));
				}
				if (filter.name) {
					conditions.push(ilike(profiles.name, `%${filter.name}%`));
				}

				const rows = yield* Effect.tryPromise({
					try: () => {
						let query = db
							.select({
								response: responses,
								profile: profiles,
								questionnaire: questionnaires,
							})
							.from(responses)
							.leftJoin(profiles, eq(responses.userId, profiles.id))
							.leftJoin(
								questionnaires,
								eq(responses.questionnaireId, questionnaires.id),
							);

						if (conditions.length > 0) {
							query = query.where(and(...conditions)) as typeof query;
						}
						return query.orderBy(desc(responses.createdAt));
					},
					catch: (error) =>
						new DatabaseError({
							message: "Failed to fetch filtered responses",
							cause: error,
						}),
				});

				return rows.map((row) => ({
					...(row.response as Response),
					profile: (row.profile as Profile) ?? null,
					questionnaire: (row.questionnaire as Questionnaire) ?? null,
				}));
			});

		const create: IResponseService["create"] = (data, details) =>
			Effect.gen(function* () {
				const response = yield* Effect.tryPromise({
					try: () =>
						db
							.insert(responses)
							.values(data)
							.returning()
							.then((rows) => rows[0] as Response),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to create response",
							cause: error,
						}),
				});

				if (details.length > 0) {
					yield* Effect.tryPromise({
						try: () =>
							db.insert(responseDetails).values(
								details.map((d) => ({
									...d,
									responseId: response.id,
								})),
							),
						catch: (error) =>
							new DatabaseError({
								message: "Failed to create response details",
								cause: error,
							}),
					});
				}

				return response;
			});

		const deleteResponses: IResponseService["delete"] = (ids) =>
			Effect.gen(function* () {
				for (const id of ids) {
					yield* Effect.tryPromise({
						try: () =>
							db
								.delete(responseDetails)
								.where(eq(responseDetails.responseId, id)),
						catch: (error) =>
							new DatabaseError({
								message: "Failed to delete response details",
								cause: error,
							}),
					});
					yield* Effect.tryPromise({
						try: () => db.delete(responses).where(eq(responses.id, id)),
						catch: (error) =>
							new DatabaseError({
								message: "Failed to delete response",
								cause: error,
							}),
					});
				}
			});

		const getAllWithDetails: IResponseService["getAllWithDetails"] = Effect.gen(
			function* () {
				// Fetch all responses with profile and questionnaire in a single JOIN
				const responseRows = yield* Effect.tryPromise({
					try: () =>
						db
							.select({
								response: responses,
								profile: profiles,
								questionnaire: questionnaires,
							})
							.from(responses)
							.leftJoin(profiles, eq(responses.userId, profiles.id))
							.leftJoin(
								questionnaires,
								eq(responses.questionnaireId, questionnaires.id),
							)
							.orderBy(desc(responses.createdAt)),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to fetch responses",
							cause: error,
						}),
				});

				// Fetch all response details with questions and answers in a single JOIN
				const allDetails = yield* Effect.tryPromise({
					try: () =>
						db
							.select({
								detail: responseDetails,
								question: questions,
								answer: answers,
							})
							.from(responseDetails)
							.leftJoin(questions, eq(responseDetails.questionId, questions.id))
							.leftJoin(answers, eq(responseDetails.answerId, answers.id)),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to fetch response details",
							cause: error,
						}),
				});

				// Group details by response ID
				const detailsByResponseId = new Map<string, ResponseDetail[]>();
				for (const row of allDetails) {
					const responseId = row.detail.responseId;
					if (!detailsByResponseId.has(responseId)) {
						detailsByResponseId.set(responseId, []);
					}
					detailsByResponseId.get(responseId)?.push({
						id: row.detail.id,
						responseId: row.detail.responseId,
						questionId: row.detail.questionId,
						answerId: row.detail.answerId,
						score: row.detail.score,
						videoSegmentPath: row.detail.videoSegmentPath,
						questionText: row.question?.questionText ?? null,
						orderNumber: row.question?.orderNumber ?? null,
						answerText: row.answer?.answerText ?? null,
					});
				}

				// Combine responses with their details
				return responseRows.map((row) => ({
					...(row.response as Response),
					profile: (row.profile as Profile) ?? null,
					questionnaire: (row.questionnaire as Questionnaire) ?? null,
					details: detailsByResponseId.get(row.response.id) ?? [],
				}));
			},
		);

		return {
			getAll,
			getById,
			getByQuestionnaireId,
			getFiltered,
			create,
			delete: deleteResponses,
			getAllWithDetails,
		};
	}),
);
