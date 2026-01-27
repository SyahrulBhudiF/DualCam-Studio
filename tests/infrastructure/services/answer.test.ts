import { describe, it, expect, vi, beforeEach } from "vitest";
import { Effect, Exit, Layer } from "effect";
import { PgDrizzle } from "@effect/sql-drizzle/Pg";
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
	}
) => {
	mockDb.orderBy = vi.fn().mockImplementation(() => ({
		then: (resolve: (rows: unknown[]) => void) =>
			Promise.resolve(
				overrides?.selectResult ?? mockDb.answers.filter((a) => a.questionId === "q1")
			).then(resolve),
	}));

	mockDb.where = vi.fn().mockImplementation(() => ({
		then: (resolve: (rows: unknown[]) => void) =>
			Promise.resolve(overrides?.selectResult ?? [mockDb.answers[0]]).then(
				resolve
			),
		orderBy: vi.fn().mockImplementation(() => ({
			then: (resolve: (rows: unknown[]) => void) =>
				Promise.resolve(
					overrides?.selectResult ?? mockDb.answers.filter((a) => a.questionId === "q1")
				).then(resolve),
		})),
		returning: vi.fn().mockImplementation(() => ({
			then: (resolve: (rows: unknown[]) => void) =>
				Promise.resolve(
					overrides?.updateResult ? [overrides.updateResult] : []
				).then(resolve),
		})),
	}));

	mockDb.returning = vi.fn().mockImplementation(() => ({
		then: (resolve: (rows: unknown[]) => void) =>
			Promise.resolve(
				overrides?.insertResult ? [overrides.insertResult] : []
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
		it("should return answers for a question", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const service = yield* AnswerService;
				return yield* service.getByQuestionId("q1");
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toHaveLength(2);
			expect(result[0].answerText).toBe("Answer 1");
		});

		it("should return empty array when no answers", async () => {
			const testLayer = createTestLayer(mockDb, { selectResult: [] });

			const program = Effect.gen(function* () {
				const service = yield* AnswerService;
				return yield* service.getByQuestionId("non-existent");
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toHaveLength(0);
		});
	});

	describe("getById", () => {
		it("should return answer by id", async () => {
			const testLayer = createTestLayer(mockDb, {
				selectResult: [mockDb.answers[0]],
			});

			const program = Effect.gen(function* () {
				const service = yield* AnswerService;
				return yield* service.getById("a1");
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result.id).toBe("a1");
			expect(result.answerText).toBe("Answer 1");
		});

		it("should fail when answer not found", async () => {
			mockDb.where = vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) =>
					Promise.resolve([]).then(resolve),
			}));

			const testLayer = createTestLayer(mockDb, { selectResult: [] });

			const program = Effect.gen(function* () {
				const service = yield* AnswerService;
				return yield* service.getById("non-existent");
			});

			const exit = await Effect.runPromiseExit(
				program.pipe(Effect.provide(testLayer))
			);

			expect(Exit.isFailure(exit)).toBe(true);
		});
	});

	describe("getByIds", () => {
		it("should return multiple answers by ids", async () => {
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

			const program = Effect.gen(function* () {
				const service = yield* AnswerService;
				return yield* service.getByIds(["a1", "a2"]);
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toHaveLength(2);
		});

		it("should return empty array for empty ids", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const service = yield* AnswerService;
				return yield* service.getByIds([]);
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toHaveLength(0);
		});
	});

	describe("create", () => {
		it("should create a new answer", async () => {
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

			const program = Effect.gen(function* () {
				const service = yield* AnswerService;
				return yield* service.create({
					questionId: "q1",
					answerText: "New Answer",
					score: 5,
				});
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result.answerText).toBe("New Answer");
			expect(result.score).toBe(5);
		});
	});

	describe("update", () => {
		it("should update an existing answer", async () => {
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

			const program = Effect.gen(function* () {
				const service = yield* AnswerService;
				return yield* service.update("a1", { answerText: "Updated Answer", score: 10 });
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result.answerText).toBe("Updated Answer");
			expect(result.score).toBe(10);
		});

		it("should fail when updating non-existent answer", async () => {
			mockDb.where = vi.fn().mockImplementation(() => ({
				returning: vi.fn().mockImplementation(() => ({
					then: (resolve: (rows: unknown[]) => void) =>
						Promise.resolve([]).then(resolve),
				})),
			}));

			const testLayer = createTestLayer(mockDb, { updateResult: undefined });

			const program = Effect.gen(function* () {
				const service = yield* AnswerService;
				return yield* service.update("non-existent", { answerText: "New Text" });
			});

			const exit = await Effect.runPromiseExit(
				program.pipe(Effect.provide(testLayer))
			);

			expect(Exit.isFailure(exit)).toBe(true);
		});
	});

	describe("delete", () => {
		it("should delete answers", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const service = yield* AnswerService;
				return yield* service.delete(["a1", "a2"]);
			});

			await Effect.runPromise(program.pipe(Effect.provide(testLayer)));

			expect(mockDb.delete).toHaveBeenCalled();
		});
	});
});
