import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import type { SQL } from "drizzle-orm";
import { and, desc, eq, gte, ilike, inArray, lte } from "drizzle-orm";
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

export type VideoSegmentPath = {
	main: string | null;
	secondary: string | null;
} | null;

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
	videoSegmentPath: VideoSegmentPath;
	questionText: string | null;
	orderNumber: number | null;
	answerText: string | null;
	maxScore: number;
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

/** Escape LIKE wildcard characters to prevent wildcard injection */
function escapeLikePattern(str: string): string {
	return str.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
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
			const rows = yield* db
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
				.orderBy(desc(responses.createdAt));

			return rows.map((row) => ({
				...(row.response as Response),
				profile: (row.profile as Profile) ?? null,
				questionnaire: (row.questionnaire as Questionnaire) ?? null,
			}));
		}).pipe(
			Effect.mapError(
				(e) =>
					new DatabaseError({
						message: "Failed to fetch responses",
						cause: e,
					}),
			),
		);

		const getById: IResponseService["getById"] = (id) =>
			Effect.gen(function* () {
				const [responseRow] = yield* db
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
					.where(eq(responses.id, id));

				if (!responseRow) {
					return yield* Effect.fail(new ResponseNotFoundError({ id }));
				}

				const detailRows = yield* db
					.select({
						detail: responseDetails,
						question: questions,
						answer: answers,
					})
					.from(responseDetails)
					.leftJoin(questions, eq(responseDetails.questionId, questions.id))
					.leftJoin(answers, eq(responseDetails.answerId, answers.id))
					.where(eq(responseDetails.responseId, id))
					.orderBy(questions.orderNumber);

				// Get max scores per question for all questions in these details
				const questionIds = [
					...new Set(detailRows.map((r) => r.detail.questionId)),
				];
				const maxScoreMap = new Map<string, number>();

				if (questionIds.length > 0) {
					const allAnswers = yield* db
						.select()
						.from(answers)
						.where(inArray(answers.questionId, questionIds));

					for (const ans of allAnswers) {
						const current = maxScoreMap.get(ans.questionId) ?? 0;
						if (ans.score > current) {
							maxScoreMap.set(ans.questionId, ans.score);
						}
					}
				}

				const details: ResponseDetail[] = detailRows.map((row) => {
					let videoSegmentPath: VideoSegmentPath = null;
					if (row.detail.videoSegmentPath != null) {
						if (typeof row.detail.videoSegmentPath === "string") {
							try {
								videoSegmentPath = JSON.parse(row.detail.videoSegmentPath);
							} catch {
								videoSegmentPath = {
									main: row.detail.videoSegmentPath,
									secondary: null,
								};
							}
						} else if (typeof row.detail.videoSegmentPath === "object") {
							videoSegmentPath =
								row.detail.videoSegmentPath as VideoSegmentPath;
						}
					}

					return {
						id: row.detail.id,
						responseId: row.detail.responseId,
						questionId: row.detail.questionId,
						answerId: row.detail.answerId,
						score: row.detail.score,
						videoSegmentPath,
						questionText: row.question?.questionText ?? null,
						orderNumber: row.question?.orderNumber ?? null,
						answerText: row.answer?.answerText ?? null,
						maxScore: maxScoreMap.get(row.detail.questionId) ?? row.detail.score,
					};
				});

				return {
					...(responseRow.response as Response),
					profile: (responseRow.profile as Profile) ?? null,
					questionnaire:
						(responseRow.questionnaire as Questionnaire) ?? null,
					details,
				};
			}).pipe(
				Effect.mapError((e): ResponseNotFoundError | DatabaseError =>
					e instanceof ResponseNotFoundError
						? e
						: new DatabaseError({
								message: "Failed to fetch response",
								cause: e,
							}),
				),
			);

		const getByQuestionnaireId: IResponseService["getByQuestionnaireId"] = (
			questionnaireId,
		) =>
			Effect.gen(function* () {
				const rows = yield* db
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
					.orderBy(desc(responses.createdAt));

				return rows.map((row) => ({
					...(row.response as Response),
					profile: (row.profile as Profile) ?? null,
					questionnaire: (row.questionnaire as Questionnaire) ?? null,
				}));
			}).pipe(
				Effect.mapError(
					(e) =>
						new DatabaseError({
							message: "Failed to fetch responses",
							cause: e,
						}),
				),
			);

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
					const escaped = escapeLikePattern(filter.name);
					conditions.push(ilike(profiles.name, `%${escaped}%`));
				}

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

				const rows = yield* query.orderBy(desc(responses.createdAt));

				return rows.map((row) => ({
					...(row.response as Response),
					profile: (row.profile as Profile) ?? null,
					questionnaire: (row.questionnaire as Questionnaire) ?? null,
				}));
			}).pipe(
				Effect.mapError(
					(e) =>
						new DatabaseError({
							message: "Failed to fetch filtered responses",
							cause: e,
						}),
				),
			);

		const create: IResponseService["create"] = (data, details) =>
			Effect.gen(function* () {
				const [response] = yield* db.insert(responses).values(data).returning();

				if (details.length > 0) {
					yield* db.insert(responseDetails).values(
						details.map((d) => ({
							...d,
							responseId: (response as Response).id,
						})),
					);
				}

				return response as Response;
			}).pipe(
				Effect.mapError(
					(e) =>
						new DatabaseError({
							message: "Failed to create response",
							cause: e,
						}),
				),
			);

		// CASCADE handles responseDetails deletion automatically
		const deleteResponses: IResponseService["delete"] = (ids) =>
			Effect.gen(function* () {
				if (ids.length > 0) {
					yield* db.delete(responses).where(inArray(responses.id, ids));
				}
			}).pipe(
				Effect.mapError(
					(e) =>
						new DatabaseError({
							message: "Failed to delete responses",
							cause: e,
						}),
				),
			);

		const getAllWithDetails: IResponseService["getAllWithDetails"] = Effect.gen(
			function* () {
				// Fetch all responses with profile and questionnaire, and all details in parallel
				const [responseRows, allDetails] = yield* Effect.all(
					[
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
						db
							.select({
								detail: responseDetails,
								question: questions,
								answer: answers,
							})
							.from(responseDetails)
							.leftJoin(questions, eq(responseDetails.questionId, questions.id))
							.leftJoin(answers, eq(responseDetails.answerId, answers.id)),
					],
					{ concurrency: "unbounded" },
				);

				// Group details by response ID
				const detailsByResponseId = new Map<string, ResponseDetail[]>();
				for (const row of allDetails) {
					const responseId = row.detail.responseId;
					if (!detailsByResponseId.has(responseId)) {
						detailsByResponseId.set(responseId, []);
					}

					let videoSegmentPath: VideoSegmentPath = null;
					if (row.detail.videoSegmentPath != null) {
						if (typeof row.detail.videoSegmentPath === "string") {
							try {
								videoSegmentPath = JSON.parse(row.detail.videoSegmentPath);
							} catch {
								videoSegmentPath = {
									main: row.detail.videoSegmentPath,
									secondary: null,
								};
							}
						} else if (typeof row.detail.videoSegmentPath === "object") {
							videoSegmentPath =
								row.detail.videoSegmentPath as VideoSegmentPath;
						}
					}

					detailsByResponseId.get(responseId)?.push({
						id: row.detail.id,
						responseId: row.detail.responseId,
						questionId: row.detail.questionId,
						answerId: row.detail.answerId,
						score: row.detail.score,
						videoSegmentPath,
						questionText: row.question?.questionText ?? null,
						orderNumber: row.question?.orderNumber ?? null,
						answerText: row.answer?.answerText ?? null,
						maxScore: row.detail.score, // approximate for bulk — exact would need extra query
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
		).pipe(
			Effect.mapError(
				(e) =>
					new DatabaseError({
						message: "Failed to fetch responses with details",
						cause: e,
					}),
			),
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
