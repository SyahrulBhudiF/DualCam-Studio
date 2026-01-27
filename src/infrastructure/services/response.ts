import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import type { SQL } from "drizzle-orm";
import { and, desc, eq, gte, lte } from "drizzle-orm";
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

		const fetchProfileAndQuestionnaire = (
			userId: string,
			questionnaireId: string,
		) =>
			Effect.all({
				profile: Effect.tryPromise({
					try: () =>
						db
							.select()
							.from(profiles)
							.where(eq(profiles.id, userId))
							.then((rows) => (rows[0] as Profile | undefined) ?? null),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to fetch profile",
							cause: error,
						}),
				}),
				questionnaire: Effect.tryPromise({
					try: () =>
						db
							.select()
							.from(questionnaires)
							.where(eq(questionnaires.id, questionnaireId))
							.then((rows) => (rows[0] as Questionnaire | undefined) ?? null),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to fetch questionnaire",
							cause: error,
						}),
				}),
			});

		const getAll: IResponseService["getAll"] = Effect.gen(function* () {
			const rows = yield* Effect.tryPromise({
				try: () =>
					db
						.select()
						.from(responses)
						.orderBy(desc(responses.createdAt))
						.then((r) => r as Response[]),
				catch: (error) =>
					new DatabaseError({
						message: "Failed to fetch responses",
						cause: error,
					}),
			});

			const results = yield* Effect.forEach(
				rows,
				(r) =>
					fetchProfileAndQuestionnaire(r.userId, r.questionnaireId).pipe(
						Effect.map(({ profile, questionnaire }) => ({
							...r,
							profile,
							questionnaire,
						})),
					),
				{ concurrency: "unbounded" },
			);

			return results;
		});

		const getById: IResponseService["getById"] = (id) =>
			Effect.gen(function* () {
				const response = yield* Effect.tryPromise({
					try: () =>
						db
							.select()
							.from(responses)
							.where(eq(responses.id, id))
							.then((rows) => rows[0] as Response | undefined),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to fetch response",
							cause: error,
						}),
				});

				if (!response) {
					return yield* Effect.fail(new ResponseNotFoundError({ id }));
				}

				const { profile, questionnaire } = yield* fetchProfileAndQuestionnaire(
					response.userId,
					response.questionnaireId,
				);

				const detailRows = yield* Effect.tryPromise({
					try: () =>
						db
							.select()
							.from(responseDetails)
							.where(eq(responseDetails.responseId, id)),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to fetch response details",
							cause: error,
						}),
				});

				const details = yield* Effect.forEach(
					detailRows,
					(d) =>
						Effect.all({
							question: Effect.tryPromise({
								try: () =>
									db
										.select()
										.from(questions)
										.where(eq(questions.id, d.questionId))
										.then((rows) => rows[0]),
								catch: (error) =>
									new DatabaseError({
										message: "Failed to fetch question",
										cause: error,
									}),
							}),
							answer: Effect.tryPromise({
								try: () =>
									db
										.select()
										.from(answers)
										.where(eq(answers.id, d.answerId))
										.then((rows) => rows[0]),
								catch: (error) =>
									new DatabaseError({
										message: "Failed to fetch answer",
										cause: error,
									}),
							}),
						}).pipe(
							Effect.map(({ question, answer }) => ({
								id: d.id,
								responseId: d.responseId,
								questionId: d.questionId,
								answerId: d.answerId,
								score: d.score,
								videoSegmentPath: d.videoSegmentPath,
								questionText: question?.questionText ?? null,
								orderNumber: question?.orderNumber ?? null,
								answerText: answer?.answerText ?? null,
							})),
						),
					{ concurrency: "unbounded" },
				);

				return {
					...response,
					profile,
					questionnaire,
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
							.select()
							.from(responses)
							.where(eq(responses.questionnaireId, questionnaireId))
							.orderBy(desc(responses.createdAt))
							.then((r) => r as Response[]),
					catch: (error) =>
						new DatabaseError({
							message: "Failed to fetch responses",
							cause: error,
						}),
				});

				const results = yield* Effect.forEach(
					rows,
					(r) =>
						fetchProfileAndQuestionnaire(r.userId, r.questionnaireId).pipe(
							Effect.map(({ profile, questionnaire }) => ({
								...r,
								profile,
								questionnaire,
							})),
						),
					{ concurrency: "unbounded" },
				);

				return results;
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

				const rows = yield* Effect.tryPromise({
					try: () => {
						let query = db.select().from(responses);
						if (conditions.length > 0) {
							query = query.where(and(...conditions)) as typeof query;
						}
						return query
							.orderBy(desc(responses.createdAt))
							.then((r) => r as Response[]);
					},
					catch: (error) =>
						new DatabaseError({
							message: "Failed to fetch filtered responses",
							cause: error,
						}),
				});

				const results = yield* Effect.forEach(
					rows,
					(r) =>
						fetchProfileAndQuestionnaire(r.userId, r.questionnaireId).pipe(
							Effect.map(({ profile, questionnaire }) => ({
								...r,
								profile,
								questionnaire,
							})),
						),
					{ concurrency: "unbounded" },
				);

				// Filter by profile fields in-memory
				return results.filter((r) => {
					if (filter.className && r.profile?.class !== filter.className)
						return false;
					if (filter.name && r.profile?.name !== filter.name) return false;
					return true;
				});
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
				const allResponses = yield* getAll;
				const results = yield* Effect.forEach(
					allResponses,
					(r) => getById(r.id),
					{ concurrency: 5 },
				);
				return results;
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
