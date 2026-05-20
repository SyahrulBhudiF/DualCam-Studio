import { and, avg, count, countDistinct, desc, eq, ne, sql, sum } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";
import type {
	DashboardAnalytics,
	DashboardBreakdown,
	DashboardData,
	DashboardRecentResponse,
	DashboardSummary,
} from "@/features/dashboard/Dashboard.types";
import {
	answers,
	profiles,
	questionnaires,
	questions,
	responseDetails,
	responses,
} from "../db";
import { DatabaseError } from "../errors";
import { DB } from "../layers/database";

const DASHBOARD_QUERY_CONCURRENCY = 4;
const RECENT_RESPONSE_LIMIT = 20;

function toNumber(value: unknown) {
	return Number(value) || 0;
}

function average(total: unknown, count: number) {
	return count > 0 ? toNumber(total) / count : 0;
}

function toDateString(date: Date | string) {
	return date instanceof Date ? date.toISOString().split("T")[0] : String(date);
}

const hasVideoPath = and(
	sql`${responses.videoPath} is not null`,
	ne(responses.videoPath, "null"),
	ne(responses.videoPath, ""),
);

export class DashboardService extends Context.Service<DashboardService>()(
	"DashboardService",
	{
		make: Effect.gen(function* () {
			const db = yield* DB.asEffect();

			const getSummary = Effect.fn("DashboardService.getSummary")(function* () {
				const [
					[{ count: totalQuestionnaires }],
					[{ count: activeQuestionnaires }],
					[{ totalResponses, avgScore }],
					[{ count: totalClasses }],
				] = yield* Effect.all(
					[
						db.select({ count: count() }).from(questionnaires),
						db
							.select({ count: count() })
							.from(questionnaires)
							.where(eq(questionnaires.isActive, true)),
						db
							.select({
								totalResponses: count(),
								avgScore: avg(responses.totalScore),
							})
							.from(responses),
						db.select({ count: countDistinct(profiles.class) }).from(profiles),
					],
					{ concurrency: DASHBOARD_QUERY_CONCURRENCY },
				);

				return {
					totalQuestionnaires,
					activeQuestionnaires,
					totalResponses,
					averageScore: toNumber(avgScore),
					totalClasses,
				} satisfies DashboardSummary;
			});

			const getBreakdown = Effect.fn("DashboardService.getBreakdown")(
				function* () {
					const [questionnaireRows, classRows] = yield* Effect.all(
						[
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
						{ concurrency: DASHBOARD_QUERY_CONCURRENCY },
					);

					return {
						questionnaires: questionnaireRows.map((r) => ({
							id: r.id,
							title: r.title,
							totalResponses: r.totalResponses,
							averageScore: average(r.totalScore, r.totalResponses),
						})),
						classes: classRows.flatMap((r) =>
							r.className === null
								? []
								: [
										{
											className: r.className,
											totalResponses: r.totalResponses,
											averageScore: average(r.totalScore, r.totalResponses),
										},
									],
						),
					} satisfies DashboardBreakdown;
				},
			);

			const getAnalytics = Effect.fn("DashboardService.getAnalytics")(
				function* () {
					const [questionRows, answerRows, timelineRows, [{ total, withVideo }]] =
						yield* Effect.all(
							[
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
									.groupBy(answers.id, answers.answerText, answers.questionId),
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
								db
									.select({
										total: count(),
										withVideo: count(sql`case when ${hasVideoPath} then 1 end`),
									})
									.from(responses),
							],
							{ concurrency: DASHBOARD_QUERY_CONCURRENCY },
						);

					return {
						questions: questionRows.map((r) => ({
							id: r.id,
							text: r.text,
							order: r.order,
							averageScore: average(r.totalScore, r.totalResponses),
						})),
						answers: answerRows.map((r) => ({
							id: r.id,
							text: r.text,
							questionId: r.questionId,
							totalResponses: r.totalResponses,
							averageScore: average(r.totalScore, r.totalResponses),
						})),
						timeline: timelineRows.map((r) => ({
							date: toDateString(r.date),
							totalResponses: r.totalResponses,
							averageScore: average(r.totalScore, r.totalResponses),
						})),
						video: { withVideo, total },
					} satisfies DashboardAnalytics;
				},
			);

			const getRecentResponses = Effect.fn(
				"DashboardService.getRecentResponses",
			)(function* () {
				const rows = yield* db
					.select({
						response: responses,
						profile: profiles,
						questionnaire: questionnaires,
					})
					.from(responses)
					.leftJoin(profiles, eq(responses.userId, profiles.id))
					.leftJoin(questionnaires, eq(responses.questionnaireId, questionnaires.id))
					.orderBy(desc(responses.createdAt))
					.limit(RECENT_RESPONSE_LIMIT);

				return rows.map(
					(row) =>
						({
							id: row.response.id,
							totalScore: row.response.totalScore,
							videoPath: row.response.videoPath,
							createdAt: row.response.createdAt.toISOString(),
							questionnaireId: row.response.questionnaireId,
							questionnaireTitle: row.questionnaire?.title ?? null,
							profile: row.profile
								? {
										id: row.profile.id,
										name: row.profile.name,
										class: row.profile.class,
										email: row.profile.email,
										nim: row.profile.nim,
										semester: row.profile.semester,
										gender: row.profile.gender,
										age: row.profile.age,
									}
								: null,
						}) satisfies DashboardRecentResponse,
				);
			});

			const getDashboardData = Effect.fn("DashboardService.getDashboardData")(
				function* () {
					return yield* Effect.all(
						{
							summary: getSummary(),
							breakdown: getBreakdown(),
							analytics: getAnalytics(),
							recentResponses: getRecentResponses(),
						},
						{ concurrency: DASHBOARD_QUERY_CONCURRENCY },
					).pipe(
						Effect.mapError(
							(e) =>
								new DatabaseError({
									message: "Failed to fetch dashboard data",
									cause: e,
								}),
						),
					) satisfies Effect.Effect<DashboardData, DatabaseError>;
				},
			);

			return {
				getDashboardData,
			};
		}),
	},
) {
	static readonly layer = Layer.effect(this, this.make);
}
