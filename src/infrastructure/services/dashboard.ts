import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { avg, count, countDistinct, eq, sql, sum } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import {
	answers,
	profiles,
	questionnaires,
	questions,
	responseDetails,
	responses,
} from "../db";
import { DatabaseError } from "../errors";

export interface DashboardSummary {
	totalQuestionnaires: number;
	activeQuestionnaires: number;
	totalResponses: number;
	averageScore: number;
	totalClasses: number;
}

export interface QuestionnaireStats {
	id: string;
	title: string;
	totalResponses: number;
	averageScore: number;
}

export interface ClassStats {
	className: string;
	totalResponses: number;
	averageScore: number;
}

export interface QuestionStats {
	id: string;
	text: string;
	order: number | null;
	averageScore: number;
}

export interface AnswerStats {
	id: string;
	text: string;
	questionId: string | null;
	totalResponses: number;
	averageScore: number;
}

export interface TimelineEntry {
	date: string;
	totalResponses: number;
	averageScore: number;
}

export interface DashboardBreakdown {
	questionnaires: QuestionnaireStats[];
	classes: ClassStats[];
}

export interface AnalyticsDetails {
	questions: QuestionStats[];
	answers: AnswerStats[];
	timeline: TimelineEntry[];
	video: {
		withVideo: number;
		total: number;
	};
}

export interface IDashboardService {
	readonly getSummary: Effect.Effect<DashboardSummary, DatabaseError>;
	readonly getBreakdown: Effect.Effect<DashboardBreakdown, DatabaseError>;
	readonly getAnalyticsDetails: Effect.Effect<AnalyticsDetails, DatabaseError>;
}

export class DashboardService extends Context.Tag("DashboardService")<
	DashboardService,
	IDashboardService
>() {}

export const DashboardServiceLive = Layer.effect(
	DashboardService,
	Effect.gen(function* () {
		const db = yield* PgDrizzle;

		const getSummary: IDashboardService["getSummary"] = Effect.gen(
			function* () {
				const [totalQ, activeQ, responseStats, classCount] = yield* Effect.all([
					// Count total questionnaires
					Effect.tryPromise({
						try: () =>
							db
								.select({ count: count() })
								.from(questionnaires)
								.then((r) => r[0]?.count ?? 0),
						catch: (e) =>
							new DatabaseError({
								message: "Failed to count questionnaires",
								cause: e,
							}),
					}),
					// Count active questionnaires
					Effect.tryPromise({
						try: () =>
							db
								.select({ count: count() })
								.from(questionnaires)
								.where(eq(questionnaires.isActive, true))
								.then((r) => r[0]?.count ?? 0),
						catch: (e) =>
							new DatabaseError({
								message: "Failed to count active questionnaires",
								cause: e,
							}),
					}),
					// Get response count and average score using SQL aggregation
					Effect.tryPromise({
						try: () =>
							db
								.select({
									totalResponses: count(),
									avgScore: avg(responses.totalScore),
								})
								.from(responses)
								.then((r) => ({
									totalResponses: r[0]?.totalResponses ?? 0,
									avgScore: Number(r[0]?.avgScore) || 0,
								})),
						catch: (e) =>
							new DatabaseError({
								message: "Failed to fetch response stats",
								cause: e,
							}),
					}),
					// Count unique classes using SQL
					Effect.tryPromise({
						try: () =>
							db
								.select({ count: countDistinct(profiles.class) })
								.from(profiles)
								.then((r) => r[0]?.count ?? 0),
						catch: (e) =>
							new DatabaseError({
								message: "Failed to count classes",
								cause: e,
							}),
					}),
				]);

				return {
					totalQuestionnaires: totalQ,
					activeQuestionnaires: activeQ,
					totalResponses: responseStats.totalResponses,
					averageScore: responseStats.avgScore,
					totalClasses: classCount,
				};
			},
		);

		const getBreakdown: IDashboardService["getBreakdown"] = Effect.gen(
			function* () {
				const [questionnaireStats, classStats] = yield* Effect.all([
					// Questionnaire stats using SQL GROUP BY
					Effect.tryPromise({
						try: () =>
							db
								.select({
									id: questionnaires.id,
									title: questionnaires.title,
									totalResponses: count(responses.id),
									totalScore: sum(responses.totalScore),
								})
								.from(questionnaires)
								.leftJoin(
									responses,
									eq(questionnaires.id, responses.questionnaireId),
								)
								.groupBy(questionnaires.id, questionnaires.title)
								.then((rows) =>
									rows.map((r) => ({
										id: r.id,
										title: r.title,
										totalResponses: r.totalResponses,
										averageScore:
											r.totalResponses > 0
												? Number(r.totalScore) / r.totalResponses
												: 0,
									})),
								),
						catch: (e) =>
							new DatabaseError({
								message: "Failed to fetch questionnaire stats",
								cause: e,
							}),
					}),
					// Class stats using SQL GROUP BY with JOIN
					Effect.tryPromise({
						try: () =>
							db
								.select({
									className: profiles.class,
									totalResponses: count(responses.id),
									totalScore: sum(responses.totalScore),
								})
								.from(responses)
								.innerJoin(profiles, eq(responses.userId, profiles.id))
								.groupBy(profiles.class)
								.then((rows) =>
									rows
										.filter((r) => r.className !== null)
										.map((r) => ({
											className: r.className as string,
											totalResponses: r.totalResponses,
											averageScore:
												r.totalResponses > 0
													? Number(r.totalScore) / r.totalResponses
													: 0,
										})),
								),
						catch: (e) =>
							new DatabaseError({
								message: "Failed to fetch class stats",
								cause: e,
							}),
					}),
				]);

				return {
					questionnaires: questionnaireStats,
					classes: classStats,
				};
			},
		);

		const getAnalyticsDetails: IDashboardService["getAnalyticsDetails"] =
			Effect.gen(function* () {
				const [questionStats, answerStats, timeline, videoStats] =
					yield* Effect.all([
						// Question stats using SQL GROUP BY
						Effect.tryPromise({
							try: () =>
								db
									.select({
										id: questions.id,
										text: questions.questionText,
										order: questions.orderNumber,
										totalResponses: count(responseDetails.id),
										totalScore: sum(responseDetails.score),
									})
									.from(questions)
									.leftJoin(
										responseDetails,
										eq(questions.id, responseDetails.questionId),
									)
									.groupBy(
										questions.id,
										questions.questionText,
										questions.orderNumber,
									)
									.then((rows) =>
										rows.map((r) => ({
											id: r.id,
											text: r.text,
											order: r.order,
											averageScore:
												r.totalResponses > 0
													? Number(r.totalScore) / r.totalResponses
													: 0,
										})),
									),
							catch: (e) =>
								new DatabaseError({
									message: "Failed to fetch question stats",
									cause: e,
								}),
						}),
						// Answer stats using SQL GROUP BY
						Effect.tryPromise({
							try: () =>
								db
									.select({
										id: answers.id,
										text: answers.answerText,
										questionId: answers.questionId,
										totalResponses: count(responseDetails.id),
										totalScore: sum(responseDetails.score),
									})
									.from(answers)
									.leftJoin(
										responseDetails,
										eq(answers.id, responseDetails.answerId),
									)
									.groupBy(answers.id, answers.answerText, answers.questionId)
									.then((rows) =>
										rows.map((r) => ({
											id: r.id,
											text: r.text,
											questionId: r.questionId,
											totalResponses: r.totalResponses,
											averageScore:
												r.totalResponses > 0
													? Number(r.totalScore) / r.totalResponses
													: 0,
										})),
									),
							catch: (e) =>
								new DatabaseError({
									message: "Failed to fetch answer stats",
									cause: e,
								}),
						}),
						// Timeline using SQL GROUP BY with date truncation
						Effect.tryPromise({
							try: () =>
								db
									.select({
										date: sql<Date | string>`DATE(${responses.createdAt})`.as(
											"date",
										),
										totalResponses: count(),
										totalScore: sum(responses.totalScore),
									})
									.from(responses)
									.groupBy(sql`DATE(${responses.createdAt})`)
									.orderBy(sql`DATE(${responses.createdAt})`)
									.then((rows) =>
										rows.map((r) => ({
											date:
												r.date instanceof Date
													? r.date.toISOString().split("T")[0]
													: String(r.date),
											totalResponses: r.totalResponses,
											averageScore:
												r.totalResponses > 0
													? Number(r.totalScore) / r.totalResponses
													: 0,
										})),
									),
							catch: (e) =>
								new DatabaseError({
									message: "Failed to fetch timeline",
									cause: e,
								}),
						}),
						// Video stats using SQL
						Effect.tryPromise({
							try: () =>
								db
									.select({
										total: count(),
										withVideo: count(responses.videoPath),
									})
									.from(responses)
									.then((r) => ({
										total: r[0]?.total ?? 0,
										withVideo: r[0]?.withVideo ?? 0,
									})),
							catch: (e) =>
								new DatabaseError({
									message: "Failed to fetch video stats",
									cause: e,
								}),
						}),
					]);

				return {
					questions: questionStats,
					answers: answerStats,
					timeline,
					video: videoStats,
				};
			});

		return {
			getSummary,
			getBreakdown,
			getAnalyticsDetails,
		};
	}),
);
