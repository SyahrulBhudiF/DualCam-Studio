import { describe, it, expect, vi, beforeEach } from "vitest";
import { Effect, Exit, Layer } from "effect";
import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import {
	QuestionService,
	QuestionServiceLive,
} from "@/infrastructure/services/question";

// Create mock database operations
const createMockDb = () => {
	const mockQuestions = [
		{
			id: "q1",
			questionnaireId: "qn1",
			questionText: "Question 1",
			questionType: "single_choice",
			orderNumber: 1,
			createdAt: new Date(),
		},
		{
			id: "q2",
			questionnaireId: "qn1",
			questionText: "Question 2",
			questionType: "single_choice",
			orderNumber: 2,
			createdAt: new Date(),
		},
	];

	return {
		questions: mockQuestions,
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
			Promise.resolve(overrides?.selectResult ?? mockDb.questions).then(
				resolve
			),
	}));

	mockDb.where = vi.fn().mockImplementation(() => ({
		then: (resolve: (rows: unknown[]) => void) =>
			Promise.resolve(overrides?.selectResult ?? [mockDb.questions[0]]).then(
				resolve
			),
		orderBy: vi.fn().mockImplementation(() => ({
			then: (resolve: (rows: unknown[]) => void) =>
				Promise.resolve(overrides?.selectResult ?? mockDb.questions).then(
					resolve
				),
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
	return QuestionServiceLive.pipe(Layer.provide(MockPgDrizzle));
};

describe("QuestionService", () => {
	let mockDb: ReturnType<typeof createMockDb>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = createMockDb();
	});

	describe("getByQuestionnaireId", () => {
		it("should return questions for a questionnaire", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const service = yield* QuestionService;
				return yield* service.getByQuestionnaireId("qn1");
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toHaveLength(2);
			expect(result[0].questionText).toBe("Question 1");
		});

		it("should return empty array when no questions", async () => {
			const testLayer = createTestLayer(mockDb, { selectResult: [] });

			const program = Effect.gen(function* () {
				const service = yield* QuestionService;
				return yield* service.getByQuestionnaireId("non-existent");
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toHaveLength(0);
		});
	});

	describe("getById", () => {
		it("should return question by id", async () => {
			const testLayer = createTestLayer(mockDb, {
				selectResult: [mockDb.questions[0]],
			});

			const program = Effect.gen(function* () {
				const service = yield* QuestionService;
				return yield* service.getById("q1");
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result.id).toBe("q1");
			expect(result.questionText).toBe("Question 1");
		});

		it("should fail when question not found", async () => {
			mockDb.where = vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) =>
					Promise.resolve([]).then(resolve),
			}));

			const testLayer = createTestLayer(mockDb, { selectResult: [] });

			const program = Effect.gen(function* () {
				const service = yield* QuestionService;
				return yield* service.getById("non-existent");
			});

			const exit = await Effect.runPromiseExit(
				program.pipe(Effect.provide(testLayer))
			);

			expect(Exit.isFailure(exit)).toBe(true);
		});
	});

	describe("create", () => {
		it("should create a new question", async () => {
			const newQuestion = {
				id: "new-id",
				questionnaireId: "qn1",
				questionText: "New Question",
				questionType: "single_choice",
				orderNumber: 3,
				createdAt: new Date(),
			};

			const testLayer = createTestLayer(mockDb, {
				insertResult: newQuestion,
			});

			const program = Effect.gen(function* () {
				const service = yield* QuestionService;
				return yield* service.create({
					questionnaireId: "qn1",
					questionText: "New Question",
					questionType: "single_choice",
					orderNumber: 3,
				});
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result.questionText).toBe("New Question");
		});
	});

	describe("update", () => {
		it("should update an existing question", async () => {
			const updatedQuestion = {
				id: "q1",
				questionnaireId: "qn1",
				questionText: "Updated Question",
				questionType: "single_choice",
				orderNumber: 1,
				createdAt: new Date(),
			};

			const testLayer = createTestLayer(mockDb, {
				updateResult: updatedQuestion,
			});

			const program = Effect.gen(function* () {
				const service = yield* QuestionService;
				return yield* service.update("q1", { questionText: "Updated Question" });
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result.questionText).toBe("Updated Question");
		});

		it("should fail when updating non-existent question", async () => {
			mockDb.where = vi.fn().mockImplementation(() => ({
				returning: vi.fn().mockImplementation(() => ({
					then: (resolve: (rows: unknown[]) => void) =>
						Promise.resolve([]).then(resolve),
				})),
			}));

			const testLayer = createTestLayer(mockDb, { updateResult: undefined });

			const program = Effect.gen(function* () {
				const service = yield* QuestionService;
				return yield* service.update("non-existent", {
					questionText: "New Text",
				});
			});

			const exit = await Effect.runPromiseExit(
				program.pipe(Effect.provide(testLayer))
			);

			expect(Exit.isFailure(exit)).toBe(true);
		});
	});

	describe("delete", () => {
		it("should delete questions", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const service = yield* QuestionService;
				return yield* service.delete(["q1", "q2"]);
			});

			await Effect.runPromise(program.pipe(Effect.provide(testLayer)));

			expect(mockDb.delete).toHaveBeenCalled();
		});
	});
});
