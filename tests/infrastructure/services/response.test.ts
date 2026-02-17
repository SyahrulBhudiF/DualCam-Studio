import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { Effect, Exit, Layer } from "effect";
import { CommitPrototype } from "effect/Effectable";
import { it } from "@effect/vitest";
import { describe, expect, vi, beforeEach } from "vitest";
import {
	ResponseService,
	ResponseServiceLive,
} from "@/infrastructure/services/response";

// Creates an Effect-compatible mock result for yield*
const toEffect = <T>(data: T, methods?: Record<string, any>): any => {
	const obj = Object.create(CommitPrototype);
	obj.commit = () => Effect.succeed(data);
	if (methods) Object.assign(obj, methods);
	return obj;
};

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

	const mockQuestions = [
		{ id: "q1", questionText: "Question 1", orderNumber: 1 },
	];

	const mockAnswers = [{ id: "a1", answerText: "Answer 1", score: 5 }];

	return {
		responses: mockResponses,
		profiles: mockProfiles,
		questionnaires: mockQuestionnaires,
		responseDetails: mockResponseDetails,
		questions: mockQuestions,
		answers: mockAnswers,
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		orderBy: vi.fn().mockReturnThis(),
		leftJoin: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
	};
};

// Create joined result format that matches leftJoin query output
const createJoinedResponses = (mockDb: ReturnType<typeof createMockDb>) => {
	return mockDb.responses.map((r) => ({
		response: r,
		profile: mockDb.profiles.find((p) => p.id === r.userId) || null,
		questionnaire:
			mockDb.questionnaires.find((q) => q.id === r.questionnaireId) || null,
	}));
};

// Create a test layer with mocked database
const createTestLayer = (
	mockDb: ReturnType<typeof createMockDb>,
	overrides?: {
		responsesResult?: unknown[];
		insertResult?: unknown;
		emptyResponse?: boolean;
	},
) => {
	const joinedResponses = createJoinedResponses(mockDb);

	// Mock the full query chain for leftJoin queries
	const createQueryChain = (defaultResult: unknown[]) => {
		const data = overrides?.responsesResult ?? defaultResult;
		const singleData = overrides?.emptyResponse ? undefined : data[0];

		return toEffect(data, {
			leftJoin: vi.fn().mockReturnValue(
				toEffect(data, {
					leftJoin: vi.fn().mockReturnValue(
						toEffect(data, {
							orderBy: vi.fn().mockReturnValue(toEffect(data)),
							where: vi.fn().mockReturnValue(
								toEffect(singleData !== undefined ? [singleData] : [], {
									orderBy: vi.fn().mockReturnValue(toEffect(data)),
								}),
							),
						}),
					),
					orderBy: vi.fn().mockReturnValue(toEffect(data)),
					where: vi.fn().mockReturnValue(
						toEffect(singleData !== undefined ? [singleData] : [], {
							orderBy: vi.fn().mockReturnValue(toEffect(data)),
						}),
					),
				}),
			),
			where: vi.fn().mockReturnValue(toEffect(data)),
			orderBy: vi.fn().mockReturnValue(toEffect(data)),
		});
	};

	mockDb.select = vi.fn().mockImplementation(() => ({
		from: vi.fn().mockImplementation(() => createQueryChain(joinedResponses)),
	}));

	mockDb.returning = vi
		.fn()
		.mockImplementation(() =>
			toEffect(overrides?.insertResult ? [overrides.insertResult] : []),
		);

	mockDb.values = vi.fn().mockImplementation(() =>
		toEffect(undefined, {
			returning: mockDb.returning,
		}),
	);

	mockDb.insert = vi.fn().mockImplementation(() => ({
		values: mockDb.values,
	}));

	mockDb.delete = vi.fn().mockImplementation(() => ({
		where: vi.fn().mockImplementation(() => toEffect(undefined)),
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
		it.effect(
			"should return all responses with profiles and questionnaires",
			() => {
				const testLayer = createTestLayer(mockDb);

				return Effect.gen(function* () {
					const service = yield* ResponseService;
					const result = yield* service.getAll;

					expect(result).toBeDefined();
					expect(Array.isArray(result)).toBe(true);
					expect(result.length).toBe(2);
					expect(result[0].profile).toBeDefined();
					expect(result[0].questionnaire).toBeDefined();
				}).pipe(Effect.provide(testLayer));
			},
		);
	});

	describe("getById", () => {
		it.effect("should fail when response not found", () => {
			const testLayer = createTestLayer(mockDb, { emptyResponse: true });

			return Effect.gen(function* () {
				const service = yield* ResponseService;
				const exit = yield* Effect.exit(service.getById("non-existent"));

				expect(Exit.isFailure(exit)).toBe(true);
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("getByQuestionnaireId", () => {
		it.effect("should return responses for a questionnaire", () => {
			const testLayer = createTestLayer(mockDb);

			return Effect.gen(function* () {
				const service = yield* ResponseService;
				const result = yield* service.getByQuestionnaireId("qn1");

				expect(result).toBeDefined();
				expect(Array.isArray(result)).toBe(true);
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("getFiltered", () => {
		it.effect("should return filtered responses by questionnaireId", () => {
			const testLayer = createTestLayer(mockDb);

			return Effect.gen(function* () {
				const service = yield* ResponseService;
				const result = yield* service.getFiltered({ questionnaireId: "qn1" });

				expect(result).toBeDefined();
				expect(Array.isArray(result)).toBe(true);
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should return filtered responses by date range", () => {
			const testLayer = createTestLayer(mockDb);

			return Effect.gen(function* () {
				const service = yield* ResponseService;
				const result = yield* service.getFiltered({
					startDate: "2024-01-01",
					endDate: "2024-12-31",
				});

				expect(result).toBeDefined();
				expect(Array.isArray(result)).toBe(true);
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("create", () => {
		it.effect("should create a new response", () => {
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

			return Effect.gen(function* () {
				const service = yield* ResponseService;
				const result = yield* service.create(
					{
						userId: "u1",
						questionnaireId: "qn1",
						totalScore: 30,
					},
					[],
				);

				expect(result.totalScore).toBe(30);
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should create response with details", () => {
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

			return Effect.gen(function* () {
				const service = yield* ResponseService;
				const result = yield* service.create(
					{
						userId: "u1",
						questionnaireId: "qn1",
						totalScore: 15,
					},
					[
						{ questionId: "q1", answerId: "a1", score: 5 },
						{ questionId: "q2", answerId: "a2", score: 10 },
					],
				);

				expect(result.totalScore).toBe(15);
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("delete", () => {
		it.effect("should delete responses and their details", () => {
			const testLayer = createTestLayer(mockDb);

			return Effect.gen(function* () {
				const service = yield* ResponseService;
				yield* service.delete(["r1", "r2"]);

				expect(mockDb.delete).toHaveBeenCalled();
			}).pipe(Effect.provide(testLayer));
		});
	});
});
