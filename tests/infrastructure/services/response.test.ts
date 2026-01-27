import { describe, it, expect, vi, beforeEach } from "vitest";
import { Effect, Exit, Layer } from "effect";
import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import {
	ResponseService,
	ResponseServiceLive,
} from "@/infrastructure/services/response";

// Create mock database operations
const createMockDb = () => {
	const mockResponses = [
		{
			id: "r1",
			userId: "u1",
			questionnaireId: "qn1",
			totalScore: 10,
			videoPath: "/videos/r1.mp4",
			createdAt: new Date(),
		},
		{
			id: "r2",
			userId: "u2",
			questionnaireId: "qn1",
			totalScore: 20,
			videoPath: null,
			createdAt: new Date(),
		},
	];

	const mockProfiles = [
		{ id: "u1", email: "user1@example.com", name: "User 1", class: "Class A" },
		{ id: "u2", email: "user2@example.com", name: "User 2", class: "Class B" },
	];

	const mockQuestionnaires = [
		{ id: "qn1", title: "Questionnaire 1", isActive: true },
	];

	const mockResponseDetails = [
		{ id: "rd1", responseId: "r1", questionId: "q1", answerId: "a1", score: 5 },
	];

	return {
		responses: mockResponses,
		profiles: mockProfiles,
		questionnaires: mockQuestionnaires,
		responseDetails: mockResponseDetails,
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		orderBy: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
		then: vi.fn(),
	};
};

// Create a test layer with mocked database
const createTestLayer = (
	mockDb: ReturnType<typeof createMockDb>,
	overrides?: {
		responsesResult?: unknown[];
		profileResult?: unknown | null;
		questionnaireResult?: unknown | null;
		insertResult?: unknown;
	}
) => {
	// Mock complex query chains
	mockDb.from = vi.fn().mockImplementation((table) => {
		const tableName = table?.name || table?._?.name || "unknown";

		return {
			then: (resolve: (rows: unknown[]) => void) => {
				if (tableName === "responses" || tableName.includes("response")) {
					return Promise.resolve(
						overrides?.responsesResult ?? mockDb.responses
					).then(resolve);
				}
				if (tableName === "profiles") {
					return Promise.resolve(mockDb.profiles).then(resolve);
				}
				if (tableName === "questionnaires") {
					return Promise.resolve(mockDb.questionnaires).then(resolve);
				}
				return Promise.resolve([]).then(resolve);
			},
			where: vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) => {
					return Promise.resolve(
						overrides?.responsesResult ?? [mockDb.responses[0]]
					).then(resolve);
				},
				orderBy: vi.fn().mockImplementation(() => ({
					then: (resolve: (rows: unknown[]) => void) =>
						Promise.resolve(
							overrides?.responsesResult ?? mockDb.responses
						).then(resolve),
				})),
			})),
			orderBy: vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) =>
					Promise.resolve(overrides?.responsesResult ?? mockDb.responses).then(
						resolve
					),
			})),
		};
	});

	mockDb.where = vi.fn().mockImplementation(() => ({
		then: (resolve: (rows: unknown[]) => void) =>
			Promise.resolve([mockDb.profiles[0]]).then(resolve),
	}));

	mockDb.returning = vi.fn().mockImplementation(() => ({
		then: (resolve: (rows: unknown[]) => void) =>
			Promise.resolve(
				overrides?.insertResult ? [overrides.insertResult] : []
			).then(resolve),
	}));

	// Mock insert().values() for response details (no returning)
	mockDb.values = vi.fn().mockImplementation(() => ({
		returning: mockDb.returning,
		then: (resolve: () => void) => Promise.resolve().then(resolve),
	}));

	const MockPgDrizzle = Layer.succeed(PgDrizzle, mockDb as never);
	return ResponseServiceLive.pipe(Layer.provide(MockPgDrizzle));
};

describe("ResponseService", () => {
	let mockDb: ReturnType<typeof createMockDb>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = createMockDb();
	});

	describe("getAll", () => {
		it("should return all responses with profiles and questionnaires", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const service = yield* ResponseService;
				return yield* service.getAll;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toBeDefined();
			expect(Array.isArray(result)).toBe(true);
		});
	});

	describe("getById", () => {
		it("should fail when response not found", async () => {
			mockDb.from = vi.fn().mockImplementation(() => ({
				where: vi.fn().mockImplementation(() => ({
					then: (resolve: (rows: unknown[]) => void) =>
						Promise.resolve([]).then(resolve),
				})),
			}));

			const testLayer = createTestLayer(mockDb, { responsesResult: [] });

			const program = Effect.gen(function* () {
				const service = yield* ResponseService;
				return yield* service.getById("non-existent");
			});

			const exit = await Effect.runPromiseExit(
				program.pipe(Effect.provide(testLayer))
			);

			expect(Exit.isFailure(exit)).toBe(true);
		});
	});

	describe("getByQuestionnaireId", () => {
		it("should return responses for a questionnaire", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const service = yield* ResponseService;
				return yield* service.getByQuestionnaireId("qn1");
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toBeDefined();
			expect(Array.isArray(result)).toBe(true);
		});
	});

	describe("getFiltered", () => {
		it("should return filtered responses by questionnaireId", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const service = yield* ResponseService;
				return yield* service.getFiltered({ questionnaireId: "qn1" });
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toBeDefined();
			expect(Array.isArray(result)).toBe(true);
		});

		it("should return filtered responses by date range", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const service = yield* ResponseService;
				return yield* service.getFiltered({
					startDate: "2024-01-01",
					endDate: "2024-12-31",
				});
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toBeDefined();
			expect(Array.isArray(result)).toBe(true);
		});
	});

	describe("create", () => {
		it("should create a new response", async () => {
			const newResponse = {
				id: "new-id",
				userId: "u1",
				questionnaireId: "qn1",
				totalScore: 30,
				videoPath: null,
				createdAt: new Date(),
			};

			const testLayer = createTestLayer(mockDb, {
				insertResult: newResponse,
			});

			const program = Effect.gen(function* () {
				const service = yield* ResponseService;
				return yield* service.create(
					{
						userId: "u1",
						questionnaireId: "qn1",
						totalScore: 30,
					},
					[]
				);
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result.totalScore).toBe(30);
		});

		it("should create response with details", async () => {
			const newResponse = {
				id: "new-id",
				userId: "u1",
				questionnaireId: "qn1",
				totalScore: 15,
				videoPath: null,
				createdAt: new Date(),
			};

			const testLayer = createTestLayer(mockDb, {
				insertResult: newResponse,
			});

			const program = Effect.gen(function* () {
				const service = yield* ResponseService;
				return yield* service.create(
					{
						userId: "u1",
						questionnaireId: "qn1",
						totalScore: 15,
					},
					[
						{ questionId: "q1", answerId: "a1", score: 5 },
						{ questionId: "q2", answerId: "a2", score: 10 },
					]
				);
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result.totalScore).toBe(15);
		});
	});

	describe("delete", () => {
		it("should delete responses and their details", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const service = yield* ResponseService;
				return yield* service.delete(["r1", "r2"]);
			});

			await Effect.runPromise(program.pipe(Effect.provide(testLayer)));

			expect(mockDb.delete).toHaveBeenCalled();
		});
	});
});
