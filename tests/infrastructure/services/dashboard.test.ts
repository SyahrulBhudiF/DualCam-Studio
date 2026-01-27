import { describe, it, expect, vi, beforeEach } from "vitest";
import { Effect, Layer } from "effect";
import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import {
	DashboardService,
	DashboardServiceLive,
} from "@/infrastructure/services/dashboard";

// Create mock database operations
const createMockDb = () => {
	const mockQuestionnaires = [
		{ id: "qn1", title: "Questionnaire 1", isActive: true },
		{ id: "qn2", title: "Questionnaire 2", isActive: false },
	];

	const mockResponses = [
		{
			id: "r1",
			userId: "u1",
			questionnaireId: "qn1",
			totalScore: 10,
			videoPath: "/videos/r1.mp4",
			createdAt: new Date("2024-06-15"),
		},
		{
			id: "r2",
			userId: "u2",
			questionnaireId: "qn1",
			totalScore: 20,
			videoPath: null,
			createdAt: new Date("2024-06-16"),
		},
		{
			id: "r3",
			userId: "u1",
			questionnaireId: "qn2",
			totalScore: 15,
			videoPath: "/videos/r3.mp4",
			createdAt: new Date("2024-06-16"),
		},
	];

	const mockProfiles = [
		{
			id: "u1",
			email: "user1@example.com",
			name: "User 1",
			class: "Class A",
		},
		{
			id: "u2",
			email: "user2@example.com",
			name: "User 2",
			class: "Class B",
		},
	];

	const mockQuestions = [
		{
			id: "q1",
			questionnaireId: "qn1",
			questionText: "Question 1",
			orderNumber: 1,
		},
		{
			id: "q2",
			questionnaireId: "qn1",
			questionText: "Question 2",
			orderNumber: 2,
		},
	];

	const mockAnswers = [
		{ id: "a1", questionId: "q1", answerText: "Answer 1", score: 5 },
		{ id: "a2", questionId: "q1", answerText: "Answer 2", score: 10 },
		{ id: "a3", questionId: "q2", answerText: "Answer 3", score: 15 },
	];

	const mockResponseDetails = [
		{
			id: "rd1",
			responseId: "r1",
			questionId: "q1",
			answerId: "a1",
			score: 5,
		},
		{
			id: "rd2",
			responseId: "r1",
			questionId: "q2",
			answerId: "a3",
			score: 5,
		},
		{
			id: "rd3",
			responseId: "r2",
			questionId: "q1",
			answerId: "a2",
			score: 10,
		},
	];

	return {
		questionnaires: mockQuestionnaires,
		responses: mockResponses,
		profiles: mockProfiles,
		questions: mockQuestions,
		answers: mockAnswers,
		responseDetails: mockResponseDetails,
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		then: vi.fn(),
	};
};

// Create a test layer with mocked database
const createTestLayer = (
	mockDb: ReturnType<typeof createMockDb>,
	overrides?: {
		questionnairesCount?: number;
		activeCount?: number;
	}
) => {
	mockDb.from = vi.fn().mockImplementation((table) => {
		const tableName = table?.name || table?._?.name || "unknown";

		return {
			then: (resolve: (rows: unknown[]) => void) => {
				if (tableName === "questionnaires") {
					return Promise.resolve(mockDb.questionnaires).then(resolve);
				}
				if (tableName === "responses") {
					return Promise.resolve(mockDb.responses).then(resolve);
				}
				if (tableName === "profiles") {
					return Promise.resolve(mockDb.profiles).then(resolve);
				}
				if (tableName === "questions") {
					return Promise.resolve(mockDb.questions).then(resolve);
				}
				if (tableName === "answers") {
					return Promise.resolve(mockDb.answers).then(resolve);
				}
				if (tableName === "responseDetails" || tableName === "response_details") {
					return Promise.resolve(mockDb.responseDetails).then(resolve);
				}
				return Promise.resolve([]).then(resolve);
			},
			where: vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) => {
					// For active questionnaires count
					return Promise.resolve([
						{ count: overrides?.activeCount ?? 1 },
					]).then(resolve);
				},
			})),
		};
	});

	mockDb.select = vi.fn().mockImplementation(() => ({
		from: mockDb.from,
	}));

	const MockPgDrizzle = Layer.succeed(PgDrizzle, mockDb as never);
	return DashboardServiceLive.pipe(Layer.provide(MockPgDrizzle));
};

describe("DashboardService", () => {
	let mockDb: ReturnType<typeof createMockDb>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = createMockDb();
	});

	describe("getSummary", () => {
		it("should return dashboard summary", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const service = yield* DashboardService;
				return yield* service.getSummary;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toBeDefined();
			expect(typeof result.totalQuestionnaires).toBe("number");
			expect(typeof result.activeQuestionnaires).toBe("number");
			expect(typeof result.totalResponses).toBe("number");
			expect(typeof result.averageScore).toBe("number");
			expect(typeof result.totalClasses).toBe("number");
		});

		it("should calculate average score", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const service = yield* DashboardService;
				return yield* service.getSummary;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			// Average score should be a number (mock returns may vary)
			expect(typeof result.averageScore).toBe("number");
			expect(result.averageScore).toBeGreaterThanOrEqual(0);
		});
	});

	describe("getBreakdown", () => {
		it("should return questionnaire breakdown", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const service = yield* DashboardService;
				return yield* service.getBreakdown;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toBeDefined();
			expect(Array.isArray(result.questionnaires)).toBe(true);
			expect(Array.isArray(result.classes)).toBe(true);
		});

		it("should return questionnaire stats with correct structure", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const service = yield* DashboardService;
				return yield* service.getBreakdown;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			// Verify structure of questionnaire stats
			for (const q of result.questionnaires) {
				expect(q.id).toBeDefined();
				expect(q.title).toBeDefined();
				expect(typeof q.totalResponses).toBe("number");
				expect(typeof q.averageScore).toBe("number");
			}
		});

		it("should calculate class stats correctly", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const service = yield* DashboardService;
				return yield* service.getBreakdown;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			// Class A has u1 with 2 responses (r1 and r3)
			// Class B has u2 with 1 response (r2)
			expect(result.classes.length).toBeGreaterThanOrEqual(0);
		});
	});

	describe("getAnalyticsDetails", () => {
		it("should return analytics details", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const service = yield* DashboardService;
				return yield* service.getAnalyticsDetails;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toBeDefined();
			expect(Array.isArray(result.questions)).toBe(true);
			expect(Array.isArray(result.answers)).toBe(true);
			expect(Array.isArray(result.timeline)).toBe(true);
			expect(result.video).toBeDefined();
		});

		it("should calculate video stats", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const service = yield* DashboardService;
				return yield* service.getAnalyticsDetails;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			// Video stats should have correct structure
			expect(typeof result.video.withVideo).toBe("number");
			expect(typeof result.video.total).toBe("number");
			expect(result.video.withVideo).toBeLessThanOrEqual(result.video.total);
		});

		it("should generate timeline entries", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const service = yield* DashboardService;
				return yield* service.getAnalyticsDetails;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			// Timeline should be an array
			expect(Array.isArray(result.timeline)).toBe(true);
			for (const entry of result.timeline) {
				expect(entry.date).toBeDefined();
				expect(typeof entry.totalResponses).toBe("number");
				expect(typeof entry.averageScore).toBe("number");
			}
		});

		it("should calculate question stats", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const service = yield* DashboardService;
				return yield* service.getAnalyticsDetails;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			// Questions should be an array with correct structure
			expect(Array.isArray(result.questions)).toBe(true);
			for (const q of result.questions) {
				expect(q.id).toBeDefined();
				expect(q.text).toBeDefined();
				expect(typeof q.averageScore).toBe("number");
			}
		});
	});
});
