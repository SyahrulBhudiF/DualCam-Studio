import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { beforeEach, describe, expect, vi } from "vitest";
import { DB } from "@/infrastructure/layers/database";
import { DashboardService } from "@/infrastructure/services/dashboard";

const toEffect = <T>(data: T, methods?: Record<string, unknown>) => {
	const obj = Effect.succeed(data) as Effect.Effect<T> &
		Record<string, unknown>;
	if (methods) Object.assign(obj, methods);
	return obj;
};

const queryResults = [
	[{ count: 2 }],
	[{ count: 1 }],
	[{ totalResponses: 3, avgScore: "12.5" }],
	[{ count: 2 }],
	[
		{
			id: "qn1",
			title: "Questionnaire 1",
			totalResponses: 2,
			totalScore: "30",
		},
		{
			id: "qn2",
			title: "Questionnaire 2",
			totalResponses: 0,
			totalScore: null,
		},
	],
	[
		{ className: "Class A", totalResponses: 2, totalScore: "25" },
		{ className: null, totalResponses: 1, totalScore: "10" },
	],
	[
		{
			id: "q1",
			text: "Question 1",
			order: 1,
			totalResponses: 2,
			totalScore: "7",
		},
		{
			id: "q2",
			text: "Question 2",
			order: 2,
			totalResponses: 0,
			totalScore: null,
		},
	],
	[
		{
			id: "a1",
			text: "Answer 1",
			questionId: "q1",
			totalResponses: 2,
			totalScore: "6",
		},
	],
	[{ date: "2024-06-15", totalResponses: 2, totalScore: "24" }],
	[{ total: 3, withVideo: 1 }],
	[
		{
			response: {
				id: "r1",
				totalScore: 10,
				videoPath: "video.webm",
				createdAt: new Date("2024-06-15T10:00:00.000Z"),
				questionnaireId: "qn1",
			},
			profile: {
				id: "p1",
				name: "Student",
				class: "Class A",
				email: "student@example.com",
				nim: "123",
				semester: "1",
				gender: "Other",
				age: 20,
			},
			questionnaire: { id: "qn1", title: "Questionnaire 1" },
		},
	],
] as const;

function createChain(data: unknown) {
	const effectResult = toEffect(data);
	const chain = toEffect(data, {
		where: vi.fn(() => effectResult),
		leftJoin: vi.fn(() => chain),
		innerJoin: vi.fn(() => chain),
		groupBy: vi.fn(() => chain),
		orderBy: vi.fn(() => chain),
		limit: vi.fn(() => effectResult),
	});

	return chain;
}

function createMockDb() {
	let index = 0;
	const mockDb = {
		select: vi.fn(() => ({
			from: vi.fn(() => createChain(queryResults[index++] ?? [])),
		})),
	};

	return mockDb;
}

function createTestLayer() {
	const db = createMockDb();
	return DashboardService.layer.pipe(
		Layer.provide(Layer.succeed(DB, db as never)),
	);
}

describe("DashboardService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it.effect("returns dashboard data", () =>
		Effect.gen(function* () {
			const service = yield* DashboardService.asEffect();
			const result = yield* service.getDashboardData();

			expect(result.summary).toEqual({
				totalQuestionnaires: 2,
				activeQuestionnaires: 1,
				totalResponses: 3,
				averageScore: 12.5,
				totalClasses: 2,
			});
			expect(result.breakdown.questionnaires[0]?.averageScore).toBe(15);
			expect(result.breakdown.questionnaires[1]?.averageScore).toBe(0);
			expect(result.breakdown.classes).toEqual([
				{ className: "Class A", totalResponses: 2, averageScore: 12.5 },
			]);
			expect(result.analytics.questions[0]?.averageScore).toBe(3.5);
			expect(result.analytics.answers[0]?.averageScore).toBe(3);
			expect(result.analytics.timeline).toEqual([
				{ date: "2024-06-15", totalResponses: 2, averageScore: 12 },
			]);
			expect(result.analytics.video).toEqual({ total: 3, withVideo: 1 });
			expect(result.recentResponses).toHaveLength(1);
			expect(result.recentResponses[0]?.createdAt).toBe(
				"2024-06-15T10:00:00.000Z",
			);
		}).pipe(Effect.provide(createTestLayer())),
	);
});
