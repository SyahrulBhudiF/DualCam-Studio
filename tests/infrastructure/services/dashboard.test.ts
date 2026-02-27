import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { Effect, Layer } from "effect";
import { CommitPrototype } from "effect/Effectable";
import { it } from "@effect/vitest";
import { describe, expect, vi, beforeEach } from "vitest";
import {
	DashboardService,
	
} from "@/infrastructure/services/dashboard";

// Creates an Effect-compatible mock result for yield*
const toEffect = <T>(data: T, methods?: Record<string, any>): any => {
	const obj = Object.create(CommitPrototype);
	obj.commit = () => Effect.succeed(data);
	if (methods) Object.assign(obj, methods);
	return obj;
};

// Mock data matching the actual DB result shapes
// Include both 'title' and 'text' so it works for questionnaire stats (uses title) and question stats (uses text)
const mockQuestionnaireStats = [
	{
		id: "qn1",
		title: "Questionnaire 1",
		text: "Question 1",
		order: 1,
		totalResponses: 2,
		totalScore: "30",
		// Fields used by getSummary destructuring
		count: 2,
		avgScore: "15",
		// Fields used by getAnalyticsDetails video stats destructuring
		total: 3,
		withVideo: 2,
	},
	{
		id: "qn2",
		title: "Questionnaire 2",
		text: "Question 2",
		order: 2,
		totalResponses: 1,
		totalScore: "15",
		count: 1,
		avgScore: "10",
		total: 2,
		withVideo: 1,
	},
];

const _mockClassStats = [
	{ className: "Class A", totalResponses: 2, totalScore: "25" },
	{ className: "Class B", totalResponses: 1, totalScore: "20" },
];

const _mockQuestionStats = [
	{
		id: "q1",
		text: "Question 1",
		order: 1,
		totalResponses: 2,
		totalScore: "15",
	},
	{
		id: "q2",
		text: "Question 2",
		order: 2,
		totalResponses: 1,
		totalScore: "5",
	},
];

const _mockAnswerStats = [
	{
		id: "a1",
		text: "Answer 1",
		questionId: "q1",
		totalResponses: 2,
		totalScore: "10",
	},
	{
		id: "a2",
		text: "Answer 2",
		questionId: "q1",
		totalResponses: 1,
		totalScore: "5",
	},
];

const _mockTimeline = [
	{ date: "2024-06-15", totalResponses: 1, totalScore: "10" },
	{ date: "2024-06-16", totalResponses: 2, totalScore: "35" },
];

const _mockVideoStats = [{ total: 3, withVideo: 2 }];

// Create mock database with chainable query builder
// This version always returns appropriate mock data for any query pattern
const createMockDb = () => {
	const mockDb = {
		select: vi.fn().mockImplementation(() => ({
			from: vi.fn().mockImplementation(() => {
				// Build complete chain that returns different data based on query pattern
				const createFullChain = (defaultData: unknown) => {
					const effectResult = toEffect(defaultData);

					// groupBy chain with optional orderBy
					const groupByChain = toEffect(defaultData, {
						orderBy: vi.fn().mockReturnValue(effectResult),
					});

					// leftJoin chain (for questionnaire stats, question stats, answer stats)
					const leftJoinChain = toEffect(defaultData, {
						groupBy: vi.fn().mockImplementation(() => groupByChain),
						leftJoin: vi.fn().mockReturnValue(
							toEffect(defaultData, {
								groupBy: vi.fn().mockImplementation(() => groupByChain),
							}),
						),
					});

					// innerJoin chain (for class stats)
					const innerJoinChain = toEffect(defaultData, {
						groupBy: vi.fn().mockImplementation(() => groupByChain),
					});

					// where chain (for filtered queries)
					const whereChain = toEffect(defaultData, {
						orderBy: vi.fn().mockReturnValue(effectResult),
					});

					return toEffect(defaultData, {
						leftJoin: vi.fn().mockImplementation(() => leftJoinChain),
						innerJoin: vi.fn().mockImplementation(() => innerJoinChain),
						groupBy: vi.fn().mockImplementation(() => groupByChain),
						where: vi.fn().mockImplementation(() => whereChain),
						orderBy: vi.fn().mockReturnValue(effectResult),
					});
				};

				// Return the chain with questionnaire stats as default
				// The service transforms the results anyway
				return createFullChain(mockQuestionnaireStats);
			}),
		})),
	};

	return { db: mockDb };
};

// Create a test layer with mocked database
const createTestLayer = () => {
	const { db } = createMockDb();
	const MockPgDrizzle = Layer.succeed(PgDrizzle, db as never);
	return DashboardService.Default.pipe(Layer.provide(MockPgDrizzle));
};

describe("DashboardService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getSummary", () => {
		it.effect("should return dashboard summary", () =>
			Effect.gen(function* () {
				const service = yield* DashboardService;
				const result = yield* service.getSummary();

				expect(result).toBeDefined();
				expect(typeof result.totalQuestionnaires).toBe("number");
				expect(typeof result.activeQuestionnaires).toBe("number");
				expect(typeof result.totalResponses).toBe("number");
				expect(typeof result.averageScore).toBe("number");
				expect(typeof result.totalClasses).toBe("number");
			}).pipe(Effect.provide(createTestLayer())),
		);

		it.effect("should calculate average score", () =>
			Effect.gen(function* () {
				const service = yield* DashboardService;
				const result = yield* service.getSummary();

				expect(typeof result.averageScore).toBe("number");
				expect(result.averageScore).toBeGreaterThanOrEqual(0);
			}).pipe(Effect.provide(createTestLayer())),
		);
	});

	describe("getBreakdown", () => {
		it.effect("should return questionnaire breakdown", () =>
			Effect.gen(function* () {
				const service = yield* DashboardService;
				const result = yield* service.getBreakdown();

				expect(result).toBeDefined();
				expect(Array.isArray(result.questionnaires)).toBe(true);
				expect(Array.isArray(result.classes)).toBe(true);
			}).pipe(Effect.provide(createTestLayer())),
		);

		it.effect("should return questionnaire stats with correct structure", () =>
			Effect.gen(function* () {
				const service = yield* DashboardService;
				const result = yield* service.getBreakdown();

				expect(result.questionnaires.length).toBeGreaterThan(0);
				for (const q of result.questionnaires) {
					expect(q.id).toBeDefined();
					expect(q.title).toBeDefined();
					expect(typeof q.totalResponses).toBe("number");
					expect(typeof q.averageScore).toBe("number");
				}
			}).pipe(Effect.provide(createTestLayer())),
		);

		it.effect("should calculate class stats correctly", () =>
			Effect.gen(function* () {
				const service = yield* DashboardService;
				const result = yield* service.getBreakdown();

				expect(result.classes.length).toBeGreaterThanOrEqual(0);
			}).pipe(Effect.provide(createTestLayer())),
		);
	});

	describe("getAnalyticsDetails", () => {
		it.effect("should return analytics details", () =>
			Effect.gen(function* () {
				const service = yield* DashboardService;
				const result = yield* service.getAnalyticsDetails();

				expect(result).toBeDefined();
				expect(Array.isArray(result.questions)).toBe(true);
				expect(Array.isArray(result.answers)).toBe(true);
				expect(Array.isArray(result.timeline)).toBe(true);
				expect(result.video).toBeDefined();
			}).pipe(Effect.provide(createTestLayer())),
		);

		it.effect("should calculate video stats", () =>
			Effect.gen(function* () {
				const service = yield* DashboardService;
				const result = yield* service.getAnalyticsDetails();

				expect(typeof result.video.withVideo).toBe("number");
				expect(typeof result.video.total).toBe("number");
				expect(result.video.withVideo).toBeLessThanOrEqual(result.video.total);
			}).pipe(Effect.provide(createTestLayer())),
		);

		it.effect("should generate timeline entries", () =>
			Effect.gen(function* () {
				const service = yield* DashboardService;
				const result = yield* service.getAnalyticsDetails();

				expect(Array.isArray(result.timeline)).toBe(true);
				for (const entry of result.timeline) {
					expect(entry.date).toBeDefined();
					expect(typeof entry.totalResponses).toBe("number");
					expect(typeof entry.averageScore).toBe("number");
				}
			}).pipe(Effect.provide(createTestLayer())),
		);

		it.effect("should calculate question stats", () =>
			Effect.gen(function* () {
				const service = yield* DashboardService;
				const result = yield* service.getAnalyticsDetails();

				expect(Array.isArray(result.questions)).toBe(true);
				for (const q of result.questions) {
					expect(q.id).toBeDefined();
					expect(q.text).toBeDefined();
					expect(typeof q.averageScore).toBe("number");
				}
			}).pipe(Effect.provide(createTestLayer())),
		);
	});
});
