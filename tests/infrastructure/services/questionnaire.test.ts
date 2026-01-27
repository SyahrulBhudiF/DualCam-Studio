import { describe, it, expect, vi, beforeEach } from "vitest";
import { Effect, Exit, Layer } from "effect";
import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import {
	QuestionnaireService,
	QuestionnaireServiceLive,
} from "@/infrastructure/services/questionnaire";

// Create mock database operations
const createMockDb = () => {
	const mockQuestionnaires = [
		{
			id: "q1",
			title: "Test Questionnaire 1",
			description: "Description 1",
			isActive: false,
			createdAt: new Date(),
		},
		{
			id: "q2",
			title: "Test Questionnaire 2",
			description: "Description 2",
			isActive: true,
			createdAt: new Date(),
		},
	];

	return {
		questionnaires: mockQuestionnaires,
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		orderBy: vi.fn().mockReturnThis(),
		limit: vi.fn().mockReturnThis(),
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
	// Setup default behavior
	mockDb.orderBy = vi.fn().mockImplementation(() => ({
		then: (resolve: (rows: unknown[]) => void) =>
			Promise.resolve(overrides?.selectResult ?? mockDb.questionnaires).then(
				resolve
			),
	}));

	mockDb.where = vi.fn().mockImplementation(() => ({
		then: (resolve: (rows: unknown[]) => void) =>
			Promise.resolve(overrides?.selectResult ?? [mockDb.questionnaires[0]]).then(
				resolve
			),
		limit: vi.fn().mockImplementation(() => ({
			then: (resolve: (rows: unknown[]) => void) =>
				Promise.resolve(
					overrides?.selectResult ?? [mockDb.questionnaires[1]]
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

	const MockPgDrizzle = Layer.succeed(
		PgDrizzle,
		mockDb as never
	);
	return QuestionnaireServiceLive.pipe(Layer.provide(MockPgDrizzle));
};

describe("QuestionnaireService", () => {
	let mockDb: ReturnType<typeof createMockDb>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = createMockDb();
	});

	describe("getAll", () => {
		it("should return all questionnaires", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				return yield* service.getAll;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toHaveLength(2);
			expect(result[0].title).toBe("Test Questionnaire 1");
		});

		it("should return empty array when no questionnaires", async () => {
			const testLayer = createTestLayer(mockDb, { selectResult: [] });

			const program = Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				return yield* service.getAll;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toHaveLength(0);
		});
	});

	describe("getById", () => {
		it("should return questionnaire by id", async () => {
			const testLayer = createTestLayer(mockDb, {
				selectResult: [mockDb.questionnaires[0]],
			});

			const program = Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				return yield* service.getById("q1");
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result.id).toBe("q1");
			expect(result.title).toBe("Test Questionnaire 1");
		});

		it("should fail when questionnaire not found", async () => {
			const testLayer = createTestLayer(mockDb, { selectResult: [] });

			// Override where to return empty for not found
			mockDb.where = vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) =>
					Promise.resolve([]).then(resolve),
			}));

			const program = Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				return yield* service.getById("non-existent");
			});

			const exit = await Effect.runPromiseExit(
				program.pipe(Effect.provide(testLayer))
			);

			expect(Exit.isFailure(exit)).toBe(true);
		});
	});

	describe("create", () => {
		it("should create a new questionnaire", async () => {
			const newQuestionnaire = {
				id: "new-id",
				title: "New Questionnaire",
				description: "New Description",
				isActive: false,
				createdAt: new Date(),
			};

			const testLayer = createTestLayer(mockDb, {
				insertResult: newQuestionnaire,
			});

			const program = Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				return yield* service.create({
					title: "New Questionnaire",
					description: "New Description",
					isActive: false,
				});
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result.title).toBe("New Questionnaire");
		});
	});

	describe("update", () => {
		it("should update an existing questionnaire", async () => {
			const updatedQuestionnaire = {
				id: "q1",
				title: "Updated Title",
				description: "Updated Description",
				isActive: false,
				createdAt: new Date(),
			};

			const testLayer = createTestLayer(mockDb, {
				updateResult: updatedQuestionnaire,
			});

			const program = Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				return yield* service.update("q1", { title: "Updated Title" });
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result.title).toBe("Updated Title");
		});

		it("should fail when updating non-existent questionnaire", async () => {
			const testLayer = createTestLayer(mockDb, { updateResult: undefined });

			// Override to return empty for not found
			mockDb.where = vi.fn().mockImplementation(() => ({
				returning: vi.fn().mockImplementation(() => ({
					then: (resolve: (rows: unknown[]) => void) =>
						Promise.resolve([]).then(resolve),
				})),
			}));

			const program = Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				return yield* service.update("non-existent", { title: "New Title" });
			});

			const exit = await Effect.runPromiseExit(
				program.pipe(Effect.provide(testLayer))
			);

			expect(Exit.isFailure(exit)).toBe(true);
		});
	});

	describe("delete", () => {
		it("should delete questionnaires", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				return yield* service.delete(["q1", "q2"]);
			});

			await Effect.runPromise(program.pipe(Effect.provide(testLayer)));

			expect(mockDb.delete).toHaveBeenCalled();
		});
	});
});
