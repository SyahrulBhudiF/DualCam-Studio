import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { count, eq } from "drizzle-orm";
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

		const getSummary: IDashboardService["getSummary"] = Effect.gen(function* () {
			const [totalQ, activeQ, allResponses, allProfiles] = yield* Effect.all([
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
				Effect.tryPromise({
					try: () => db.select().from(responses),
					catch: (e) =>
						new DatabaseError({
							message: "Failed to fetch responses",
							cause: e,
						}),
				}),
				Effect.tryPromise({
					try: () => db.select().from(profiles),
					catch: (e) =>
						new DatabaseError({
							message: "Failed to fetch profiles",
							cause: e,
						}),
				}),
			]);

			const totalScore = allResponses.reduce(
				(acc, r) => acc + (r.totalScore ?? 0),
				0,
			);
			const avgScore =
				allResponses.length > 0 ? totalScore / allResponses.length : 0;

			const uniqueClasses = new Set(
				allProfiles.map((p) => p.class).filter((c): c is string => !!c),
			);

			return {
				totalQuestionnaires: totalQ,
				activeQuestionnaires: activeQ,
				totalResponses: allResponses.length,
				averageScore: avgScore,
				totalClasses: uniqueClasses.size,
			};
		});

		const getBreakdown: IDashboardService["getBreakdown"] = Effect.gen(
			function* () {
				const [allResponses, allQuestionnaires, allProfiles] =
					yield* Effect.all([
						Effect.tryPromise({
							try: () => db.select().from(responses),
							catch: (e) =>
								new DatabaseError({
									message: "Failed to fetch responses",
									cause: e,
								}),
						}),
						Effect.tryPromise({
							try: () => db.select().from(questionnaires),
							catch: (e) =>
								new DatabaseError({
									message: "Failed to fetch questionnaires",
									cause: e,
								}),
						}),
						Effect.tryPromise({
							try: () => db.select().from(profiles),
							catch: (e) =>
								new DatabaseError({
									message: "Failed to fetch profiles",
									cause: e,
								}),
						}),
					]);

				// Questionnaire stats
				const qMap = new Map<
					string,
					{
						id: string;
						title: string;
						totalResponses: number;
						totalScore: number;
					}
				>();
				for (const q of allQuestionnaires) {
					qMap.set(q.id, {
						id: q.id,
						title: q.title,
						totalResponses: 0,
						totalScore: 0,
					});
				}
				for (const r of allResponses) {
					const q = qMap.get(r.questionnaireId);
					if (q) {
						q.totalResponses++;
						q.totalScore += r.totalScore ?? 0;
					}
				}
				const questionnaireStats: QuestionnaireStats[] = Array.from(
					qMap.values(),
				).map((q) => ({
					id: q.id,
					title: q.title,
					totalResponses: q.totalResponses,
					averageScore:
						q.totalResponses > 0 ? q.totalScore / q.totalResponses : 0,
				}));

				// Class stats
				const profileMap = new Map<string, string>();
				for (const p of allProfiles) {
					if (p.class) profileMap.set(p.id, p.class);
				}

				const classMap = new Map<
					string,
					{ className: string; totalResponses: number; totalScore: number }
				>();
				for (const r of allResponses) {
					const cls = profileMap.get(r.userId);
					if (cls) {
						if (!classMap.has(cls)) {
							classMap.set(cls, {
								className: cls,
								totalResponses: 0,
								totalScore: 0,
							});
						}
						const c = classMap.get(cls)!;
						c.totalResponses++;
						c.totalScore += r.totalScore ?? 0;
					}
				}
				const classStats: ClassStats[] = Array.from(classMap.values()).map(
					(c) => ({
						className: c.className,
						totalResponses: c.totalResponses,
						averageScore:
							c.totalResponses > 0 ? c.totalScore / c.totalResponses : 0,
					}),
				);

				return { questionnaires: questionnaireStats, classes: classStats };
			},
		);

		const getAnalyticsDetails: IDashboardService["getAnalyticsDetails"] =
			Effect.gen(function* () {
				const [allDetails, allQuestions, allAnswers, allResponses] =
					yield* Effect.all([
						Effect.tryPromise({
							try: () => db.select().from(responseDetails),
							catch: (e) =>
								new DatabaseError({
									message: "Failed to fetch response details",
									cause: e,
								}),
						}),
						Effect.tryPromise({
							try: () => db.select().from(questions),
							catch: (e) =>
								new DatabaseError({
									message: "Failed to fetch questions",
									cause: e,
								}),
						}),
						Effect.tryPromise({
							try: () => db.select().from(answers),
							catch: (e) =>
								new DatabaseError({
									message: "Failed to fetch answers",
									cause: e,
								}),
						}),
						Effect.tryPromise({
							try: () => db.select().from(responses),
							catch: (e) =>
								new DatabaseError({
									message: "Failed to fetch responses",
									cause: e,
								}),
						}),
					]);

				// Question stats
				const questionMap = new Map<
					string,
					{
						id: string;
						text: string;
						order: number | null;
						totalScore: number;
						count: number;
					}
				>();
				for (const q of allQuestions) {
					questionMap.set(q.id, {
						id: q.id,
						text: q.questionText,
						order: q.orderNumber,
						totalScore: 0,
						count: 0,
					});
				}
				for (const d of allDetails) {
					const q = questionMap.get(d.questionId);
					if (q) {
						q.totalScore += d.score ?? 0;
						q.count++;
					}
				}
				const questionStats: QuestionStats[] = Array.from(
					questionMap.values(),
				).map((q) => ({
					id: q.id,
					text: q.text,
					order: q.order,
					averageScore: q.count > 0 ? q.totalScore / q.count : 0,
				}));

				// Answer stats
				const answerMap = new Map<
					string,
					{
						id: string;
						text: string;
						questionId: string;
						totalScore: number;
						count: number;
					}
				>();
				for (const a of allAnswers) {
					answerMap.set(a.id, {
						id: a.id,
						text: a.answerText,
						questionId: a.questionId,
						totalScore: 0,
						count: 0,
					});
				}
				for (const d of allDetails) {
					const a = answerMap.get(d.answerId);
					if (a) {
						a.totalScore += d.score ?? 0;
						a.count++;
					}
				}
				const answerStats: AnswerStats[] = Array.from(answerMap.values()).map(
					(a) => ({
						id: a.id,
						text: a.text,
						questionId: a.questionId,
						totalResponses: a.count,
						averageScore: a.count > 0 ? a.totalScore / a.count : 0,
					}),
				);

				// Timeline
				const timelineMap = new Map<
					string,
					{ date: string; totalResponses: number; totalScore: number }
				>();
				for (const r of allResponses) {
					const date = r.createdAt.toISOString().slice(0, 10);
					if (!timelineMap.has(date)) {
						timelineMap.set(date, { date, totalResponses: 0, totalScore: 0 });
					}
					const t = timelineMap.get(date)!;
					t.totalResponses++;
					t.totalScore += r.totalScore ?? 0;
				}
				const timeline: TimelineEntry[] = Array.from(timelineMap.values())
					.sort((a, b) => a.date.localeCompare(b.date))
					.map((t) => ({
						date: t.date,
						totalResponses: t.totalResponses,
						averageScore:
							t.totalResponses > 0 ? t.totalScore / t.totalResponses : 0,
					}));

				// Video stats
				const withVideo = allResponses.filter((r) => r.videoPath).length;

				return {
					questions: questionStats,
					answers: answerStats,
					timeline,
					video: {
						withVideo,
						total: allResponses.length,
					},
				};
			});

		return {
			getSummary,
			getBreakdown,
			getAnalyticsDetails,
		};
	}),
);
