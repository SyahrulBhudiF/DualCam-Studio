import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { Effect, Exit, Layer } from "effect";
import { it } from "@effect/vitest";
import { describe, expect, vi, beforeEach } from "vitest";
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
	},
) => {
	mockDb.orderBy = vi.fn().mockImplementation(() => ({
		then: (resolve: (rows: unknown[]) => void) =>
			Promise.resolve(overrides?.selectResult ?? mockDb.questions).then(
				resolve,
			),
	}));

	mockDb.where = vi.fn().mockImplementation(() => ({
		then: (resolve: (rows: unknown[]) => void) =>
			Promise.resolve(overrides?.selectResult ?? [mockDb.questions[0]]).then(
				resolve,
			),
		orderBy: vi.fn().mockImplementation(() => ({
			then: (resolve: (rows: unknown[]) => void) =>
				Promise.resolve(overrides?.selectResult ?? mockDb.questions).then(
					resolve,
				),
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
	return QuestionServiceLive.pipe(Layer.provide(MockPgDrizzle));
};

describe("QuestionService", () => {
	let mockDb: ReturnType<typeof createMockDb>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = createMockDb();
	});

	describe("getByQuestionnaireId", () => {
		it.effect("should return questions for a questionnaire", () => {
			const testLayer = createTestLayer(mockDb);

			return Effect.gen(function* () {
				const service = yield* QuestionService;
				const result = yield* service.getByQuestionnaireId("qn1");

				expect(result).toHaveLength(2);
				expect(result[0].questionText).toBe("Question 1");
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should return empty array when no questions", () => {
			const testLayer = createTestLayer(mockDb, { selectResult: [] });

			return Effect.gen(function* () {
				const service = yield* QuestionService;
				const result = yield* service.getByQuestionnaireId("non-existent");

				expect(result).toHaveLength(0);
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("getById", () => {
		it.effect("should return question by id", () => {
			const testLayer = createTestLayer(mockDb, {
				selectResult: [mockDb.questions[0]],
			});

			return Effect.gen(function* () {
				const service = yield* QuestionService;
				const result = yield* service.getById("q1");

				expect(result.id).toBe("q1");
				expect(result.questionText).toBe("Question 1");
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should fail when question not found", () => {
			mockDb.where = vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) =>
					Promise.resolve([]).then(resolve),
			}));

			const testLayer = createTestLayer(mockDb, { selectResult: [] });

			return Effect.gen(function* () {
				const service = yield* QuestionService;
				const exit = yield* Effect.exit(service.getById("non-existent"));

				expect(Exit.isFailure(exit)).toBe(true);
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("create", () => {
		it.effect("should create a new question", () => {
			const newQuestion = {
				id: "new-id",
				questionnaireId: "qn1",
				questionText: "New Question",
				orderNumber: 3,
				createdAt: new Date(),
			};

			const testLayer = createTestLayer(mockDb, {
				insertResult: newQuestion,
			});

			return Effect.gen(function* () {
				const service = yield* QuestionService;
				const result = yield* service.create({
					questionnaireId: "qn1",
					questionText: "New Question",
					orderNumber: 3,
				});

				expect(result.questionText).toBe("New Question");
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("update", () => {
		it.effect("should update an existing question", () => {
			const updatedQuestion = {
				id: "q1",
				questionnaireId: "qn1",
				questionText: "Updated Question",
				orderNumber: 1,
				createdAt: new Date(),
			};

			const testLayer = createTestLayer(mockDb, {
				updateResult: updatedQuestion,
			});

			return Effect.gen(function* () {
				const service = yield* QuestionService;
				const result = yield* service.update("q1", {
					questionText: "Updated Question",
				});

				expect(result.questionText).toBe("Updated Question");
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should fail when updating non-existent question", () => {
			mockDb.where = vi.fn().mockImplementation(() => ({
				returning: vi.fn().mockImplementation(() => ({
					then: (resolve: (rows: unknown[]) => void) =>
						Promise.resolve([]).then(resolve),
				})),
			}));

			const testLayer = createTestLayer(mockDb, { updateResult: undefined });

			return Effect.gen(function* () {
				const service = yield* QuestionService;
				const exit = yield* Effect.exit(
					service.update("non-existent", {
						questionText: "New Text",
					}),
				);

				expect(Exit.isFailure(exit)).toBe(true);
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("delete", () => {
		it.effect("should delete questions", () => {
			const testLayer = createTestLayer(mockDb);

			return Effect.gen(function* () {
				const service = yield* QuestionService;
				yield* service.delete(["q1", "q2"]);

				expect(mockDb.delete).toHaveBeenCalled();
			}).pipe(Effect.provide(testLayer));
		});
	});
});
