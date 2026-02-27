import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { avg, count, countDistinct, eq, sql, sum } from "drizzle-orm";
import { Effect } from "effect";
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

export class DashboardService extends Effect.Service<DashboardService>()(
	"DashboardService",
	{
		accessors: true,
		dependencies: [],
		effect: Effect.gen(function* () {
			const db = yield* PgDrizzle;

			const getSummary = Effect.fn("DashboardService.getSummary")(function* () {
				const [
					[{ count: totalQuestionnaires }],
					[{ count: activeQuestionnaires }],
					[{ totalResponses, avgScore }],
					[{ count: totalClasses }],
				] = yield* Effect.all(
					[
						// Count total questionnaires
						db.select({ count: count() }).from(questionnaires),
						// Count active questionnaires
						db
							.select({ count: count() })
							.from(questionnaires)
							.where(eq(questionnaires.isActive, true)),
						// Get response count and average score using SQL aggregation
						db
							.select({
								totalResponses: count(),
								avgScore: avg(responses.totalScore),
							})
							.from(responses),
						// Count unique classes using SQL
						db
							.select({ count: countDistinct(profiles.class) })
							.from(profiles),
					],
					{ concurrency: "unbounded" },
				).pipe(
					Effect.mapError(
						(e) =>
							new DatabaseError({
								message: "Failed to fetch dashboard summary",
								cause: e,
							}),
					),
				);

				return {
					totalQuestionnaires,
					activeQuestionnaires,
					totalResponses,
					averageScore: Number(avgScore) || 0,
					totalClasses,
				};
			});

			const getBreakdown = Effect.fn("DashboardService.getBreakdown")(
				function* () {
					const [questionnaireRows, classRows] = yield* Effect.all(
						[
							// Questionnaire stats using SQL GROUP BY
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
								.groupBy(questionnaires.id, questionnaires.title),
							// Class stats using SQL GROUP BY with JOIN
							db
								.select({
									className: profiles.class,
									totalResponses: count(responses.id),
									totalScore: sum(responses.totalScore),
								})
								.from(responses)
								.innerJoin(profiles, eq(responses.userId, profiles.id))
								.groupBy(profiles.class),
						],
						{ concurrency: "unbounded" },
					).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to fetch dashboard breakdown",
									cause: e,
								}),
						),
					);

					const questionnaireStats = questionnaireRows.map((r) => ({
						id: r.id,
						title: r.title,
						totalResponses: r.totalResponses,
						averageScore:
							r.totalResponses > 0
								? Number(r.totalScore) / r.totalResponses
								: 0,
					}));

					const classStats = classRows
						.filter((r) => r.className !== null)
						.map((r) => ({
							className: r.className as string,
							totalResponses: r.totalResponses,
							averageScore:
								r.totalResponses > 0
									? Number(r.totalScore) / r.totalResponses
									: 0,
						}));

					return {
						questionnaires: questionnaireStats,
						classes: classStats,
					};
				},
			);

			const getAnalyticsDetails = Effect.fn(
				"DashboardService.getAnalyticsDetails",
			)(function* () {
				const [questionRows, answerRows, timelineRows, [{ total, withVideo }]] =
					yield* Effect.all(
						[
							// Question stats using SQL GROUP BY
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
								),
							// Answer stats using SQL GROUP BY
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
								.groupBy(
									answers.id,
									answers.answerText,
									answers.questionId,
								),
							// Timeline using SQL GROUP BY with date truncation
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
								.orderBy(sql`DATE(${responses.createdAt})`),
							// Video stats using SQL
							db
								.select({
									total: count(),
									withVideo: count(responses.videoPath),
								})
								.from(responses),
						],
						{ concurrency: "unbounded" },
					).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to fetch analytics details",
									cause: e,
								}),
						),
					);

				const questionStats = questionRows.map((r) => ({
					id: r.id,
					text: r.text,
					order: r.order,
					averageScore:
						r.totalResponses > 0 ? Number(r.totalScore) / r.totalResponses : 0,
				}));

				const answerStats = answerRows.map((r) => ({
					id: r.id,
					text: r.text,
					questionId: r.questionId,
					totalResponses: r.totalResponses,
					averageScore:
						r.totalResponses > 0 ? Number(r.totalScore) / r.totalResponses : 0,
				}));

				const timeline = timelineRows.map((r) => ({
					date:
						r.date instanceof Date
							? r.date.toISOString().split("T")[0]
							: String(r.date),
					totalResponses: r.totalResponses,
					averageScore:
						r.totalResponses > 0 ? Number(r.totalScore) / r.totalResponses : 0,
				}));

				return {
					questions: questionStats,
					answers: answerStats,
					timeline,
					video: { withVideo, total },
				};
			});

			return {
				getSummary,
				getBreakdown,
				getAnalyticsDetails,
			};
		}),
	},
) {}
