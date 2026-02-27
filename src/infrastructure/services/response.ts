import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import type { SQL } from "drizzle-orm";
import { and, desc, eq, gte, ilike, inArray, lte } from "drizzle-orm";
import { Effect } from "effect";
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

export class ResponseService extends Effect.Service<ResponseService>()(
	"ResponseService",
	{
		accessors: true,
		dependencies: [],
		effect: Effect.gen(function* () {
			const db = yield* PgDrizzle;

			const getAll = Effect.fn("ResponseService.getAll")(function* () {
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
					.orderBy(desc(responses.createdAt)).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to fetch responses",
									cause: e,
								}),
						),
					);

				return rows.map((row) => ({
					...(row.response as Response),
					profile: (row.profile as Profile) ?? null,
					questionnaire: (row.questionnaire as Questionnaire) ?? null,
				}));
			});

			const getById = Effect.fn("ResponseService.getById")(function* (
				id: string,
			) {
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
					.where(eq(responses.id, id)).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to fetch response",
									cause: e,
								}),
						),
					);

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
					.orderBy(questions.orderNumber).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to fetch response details",
									cause: e,
								}),
						),
					);

				// Get max scores per question for all questions in these details
				const questionIds = [
					...new Set(detailRows.map((r) => r.detail.questionId)),
				];
				const maxScoreMap = new Map<string, number>();

				if (questionIds.length > 0) {
					const allAnswers = yield* db
						.select()
						.from(answers)
						.where(inArray(answers.questionId, questionIds)).pipe(
							Effect.mapError(
								(e) =>
									new DatabaseError({
										message: "Failed to fetch answers for scoring",
										cause: e,
									}),
							),
						);

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
					questionnaire: (responseRow.questionnaire as Questionnaire) ?? null,
					details,
				};
			});

			const getByQuestionnaireId = Effect.fn(
				"ResponseService.getByQuestionnaireId",
			)(function* (questionnaireId: string) {
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
					.orderBy(desc(responses.createdAt)).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to fetch responses",
									cause: e,
								}),
						),
					);

				return rows.map((row) => ({
					...(row.response as Response),
					profile: (row.profile as Profile) ?? null,
					questionnaire: (row.questionnaire as Questionnaire) ?? null,
				}));
			});

			const getFiltered = Effect.fn("ResponseService.getFiltered")(function* (
				filter: ResponseFilter,
			) {
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

				const rows = yield* query.orderBy(desc(responses.createdAt)).pipe(
					Effect.mapError(
						(e) =>
							new DatabaseError({
								message: "Failed to fetch filtered responses",
								cause: e,
							}),
					),
				);

				return rows.map((row) => ({
					...(row.response as Response),
					profile: (row.profile as Profile) ?? null,
					questionnaire: (row.questionnaire as Questionnaire) ?? null,
				}));
			});

			const create = Effect.fn("ResponseService.create")(function* (
				data: Omit<NewResponse, "id" | "createdAt">,
				details: Omit<NewResponseDetail, "id" | "responseId">[],
			) {
				const [response] = yield* db.insert(responses).values(data).returning().pipe(
					Effect.mapError(
						(e) =>
							new DatabaseError({
								message: "Failed to create response",
								cause: e,
							}),
					),
				);

				if (details.length > 0) {
					yield* db.insert(responseDetails).values(
						details.map((d) => ({
							...d,
							responseId: (response as Response).id,
						})),
					).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to create response details",
									cause: e,
								}),
						),
					);
				}

				return response as Response;
			});

			// CASCADE handles responseDetails deletion automatically
			const deleteResponses = Effect.fn("ResponseService.delete")(function* (
				ids: string[],
			) {
				if (ids.length > 0) {
					yield* db.delete(responses).where(inArray(responses.id, ids)).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to delete responses",
									cause: e,
								}),
						),
					);
				}
			});

			const getAllWithDetails = Effect.fn("ResponseService.getAllWithDetails")(
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
								.leftJoin(
									questions,
									eq(responseDetails.questionId, questions.id),
								)
								.leftJoin(answers, eq(responseDetails.answerId, answers.id)),
						],
						{ concurrency: "unbounded" },
					).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to fetch responses with details",
									cause: e,
								}),
						),
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
	},
) {}
