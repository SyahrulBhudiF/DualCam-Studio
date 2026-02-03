import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { Effect, Exit, Layer } from "effect";
import { it } from "@effect/vitest";
import { describe, expect, vi, beforeEach } from "vitest";
import {
	AnswerService,
	AnswerServiceLive,
} from "@/infrastructure/services/answer";

// Create mock database operations
const createMockDb = () => {
	const mockAnswers = [
		{
			id: "a1",
			questionId: "q1",
			answerText: "Answer 1",
			score: 1,
			createdAt: new Date(),
		},
		{
			id: "a2",
			questionId: "q1",
			answerText: "Answer 2",
			score: 2,
			createdAt: new Date(),
		},
		{
			id: "a3",
			questionId: "q2",
			answerText: "Answer 3",
			score: 3,
			createdAt: new Date(),
		},
	];

	return {
		answers: mockAnswers,
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		orderBy: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
		then: vi.fn(),
	};
};

// Create a test layer with mocked database
const createTestLayer = (
	mockDb: ReturnType<typeof createMockDb>,
	overrides?: {
		selectResult?: unknown[];
		insertResult?: unknown;
		updateResult?: unknown;
	},
) => {
	mockDb.orderBy = vi.fn().mockImplementation(() => ({
		then: (resolve: (rows: unknown[]) => void) =>
			Promise.resolve(
				overrides?.selectResult ??
					mockDb.answers.filter((a) => a.questionId === "q1"),
			).then(resolve),
	}));

	mockDb.where = vi.fn().mockImplementation(() => ({
		then: (resolve: (rows: unknown[]) => void) =>
			Promise.resolve(overrides?.selectResult ?? [mockDb.answers[0]]).then(
				resolve,
			),
		orderBy: vi.fn().mockImplementation(() => ({
			then: (resolve: (rows: unknown[]) => void) =>
				Promise.resolve(
					overrides?.selectResult ??
						mockDb.answers.filter((a) => a.questionId === "q1"),
				).then(resolve),
		})),
		returning: vi.fn().mockImplementation(() => ({
			then: (resolve: (rows: unknown[]) => void) =>
				Promise.resolve(
					overrides?.updateResult ? [overrides.updateResult] : [],
				).then(resolve),
		})),
	}));

	mockDb.returning = vi.fn().mockImplementation(() => ({
		then: (resolve: (rows: unknown[]) => void) =>
			Promise.resolve(
				overrides?.insertResult ? [overrides.insertResult] : [],
			).then(resolve),
	}));

	const MockPgDrizzle = Layer.succeed(PgDrizzle, mockDb as never);
	return AnswerServiceLive.pipe(Layer.provide(MockPgDrizzle));
};

describe("AnswerService", () => {
	let mockDb: ReturnType<typeof createMockDb>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = createMockDb();
	});

	describe("getByQuestionId", () => {
		it.effect("should return answers for a question", () => {
			const testLayer = createTestLayer(mockDb);

			return Effect.gen(function* () {
				const service = yield* AnswerService;
				const result = yield* service.getByQuestionId("q1");

				expect(result).toHaveLength(2);
				expect(result[0].answerText).toBe("Answer 1");
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should return empty array when no answers", () => {
			const testLayer = createTestLayer(mockDb, { selectResult: [] });

			return Effect.gen(function* () {
				const service = yield* AnswerService;
				const result = yield* service.getByQuestionId("non-existent");

				expect(result).toHaveLength(0);
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("getById", () => {
		it.effect("should return answer by id", () => {
			const testLayer = createTestLayer(mockDb, {
				selectResult: [mockDb.answers[0]],
			});

			return Effect.gen(function* () {
				const service = yield* AnswerService;
				const result = yield* service.getById("a1");

				expect(result.id).toBe("a1");
				expect(result.answerText).toBe("Answer 1");
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should fail when answer not found", () => {
			mockDb.where = vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) =>
					Promise.resolve([]).then(resolve),
			}));

			const testLayer = createTestLayer(mockDb, { selectResult: [] });

			return Effect.gen(function* () {
				const service = yield* AnswerService;
				const exit = yield* Effect.exit(service.getById("non-existent"));

				expect(Exit.isFailure(exit)).toBe(true);
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("getByIds", () => {
		it.effect("should return multiple answers by ids", () => {
			// Setup mock for getByIds which iterates through ids
			let callCount = 0;
			mockDb.where = vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) => {
					const answer = mockDb.answers[callCount];
					callCount++;
					return Promise.resolve(answer ? [answer] : []).then(resolve);
				},
			}));

			const testLayer = createTestLayer(mockDb);

			return Effect.gen(function* () {
				const service = yield* AnswerService;
				const result = yield* service.getByIds(["a1", "a2"]);

				expect(result).toHaveLength(2);
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should return empty array for empty ids", () => {
			const testLayer = createTestLayer(mockDb);

			return Effect.gen(function* () {
				const service = yield* AnswerService;
				const result = yield* service.getByIds([]);

				expect(result).toHaveLength(0);
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("create", () => {
		it.effect("should create a new answer", () => {
			const newAnswer = {
				id: "new-id",
				questionId: "q1",
				answerText: "New Answer",
				score: 5,
				createdAt: new Date(),
			};

			const testLayer = createTestLayer(mockDb, {
				insertResult: newAnswer,
			});

			return Effect.gen(function* () {
				const service = yield* AnswerService;
				const result = yield* service.create({
					questionId: "q1",
					answerText: "New Answer",
					score: 5,
				});

				expect(result.answerText).toBe("New Answer");
				expect(result.score).toBe(5);
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("update", () => {
		it.effect("should update an existing answer", () => {
			const updatedAnswer = {
				id: "a1",
				questionId: "q1",
				answerText: "Updated Answer",
				score: 10,
				createdAt: new Date(),
			};

			const testLayer = createTestLayer(mockDb, {
				updateResult: updatedAnswer,
			});

			return Effect.gen(function* () {
				const service = yield* AnswerService;
				const result = yield* service.update("a1", {
					answerText: "Updated Answer",
					score: 10,
				});

				expect(result.answerText).toBe("Updated Answer");
				expect(result.score).toBe(10);
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should fail when updating non-existent answer", () => {
			mockDb.where = vi.fn().mockImplementation(() => ({
				returning: vi.fn().mockImplementation(() => ({
					then: (resolve: (rows: unknown[]) => void) =>
						Promise.resolve([]).then(resolve),
				})),
			}));

			const testLayer = createTestLayer(mockDb, { updateResult: undefined });

			return Effect.gen(function* () {
				const service = yield* AnswerService;
				const exit = yield* Effect.exit(
					service.update("non-existent", {
						answerText: "New Text",
					}),
				);

				expect(Exit.isFailure(exit)).toBe(true);
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("delete", () => {
		it.effect("should delete answers", () => {
			const testLayer = createTestLayer(mockDb);

			return Effect.gen(function* () {
				const service = yield* AnswerService;
				yield* service.delete(["a1", "a2"]);

				expect(mockDb.delete).toHaveBeenCalled();
			}).pipe(Effect.provide(testLayer));
		});
	});
});
