import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { PgClient } from "@effect/sql-pg";
import { Effect, Exit, Layer } from "effect";
import { CommitPrototype } from "effect/Effectable";
import { it } from "@effect/vitest";
import { describe, expect, vi, beforeEach } from "vitest";
import {
	QuestionnaireService,
	QuestionnaireServiceLive,
} from "@/infrastructure/services/questionnaire";

// Creates an Effect-compatible mock result for yield*
const toEffect = <T>(data: T, methods?: Record<string, any>): any => {
	const obj = Object.create(CommitPrototype);
	obj.commit = () => Effect.succeed(data);
	if (methods) Object.assign(obj, methods);
	return obj;
};

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
	// Setup default behavior
	mockDb.orderBy = vi
		.fn()
		.mockImplementation(() =>
			toEffect(overrides?.selectResult ?? mockDb.questionnaires),
		);

	mockDb.where = vi.fn().mockImplementation(() =>
		toEffect(overrides?.selectResult ?? [mockDb.questionnaires[0]], {
			limit: vi
				.fn()
				.mockImplementation(() =>
					toEffect(overrides?.selectResult ?? [mockDb.questionnaires[1]]),
				),
			returning: vi
				.fn()
				.mockImplementation(() =>
					toEffect(overrides?.updateResult ? [overrides.updateResult] : []),
				),
		}),
	);

	mockDb.returning = vi
		.fn()
		.mockImplementation(() =>
			toEffect(overrides?.insertResult ? [overrides.insertResult] : []),
		);

	const MockPgDrizzle = Layer.succeed(PgDrizzle, mockDb as never);
	const MockPgClient = Layer.succeed(PgClient.PgClient, {
		withTransaction: (effect: any) => effect,
	} as never);
	return QuestionnaireServiceLive.pipe(
		Layer.provide(Layer.merge(MockPgDrizzle, MockPgClient)),
	);
};

describe("QuestionnaireService", () => {
	let mockDb: ReturnType<typeof createMockDb>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = createMockDb();
	});

	describe("getAll", () => {
		it.effect("should return all questionnaires", () => {
			const testLayer = createTestLayer(mockDb);

			return Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				const result = yield* service.getAll;

				expect(result).toHaveLength(2);
				expect(result[0].title).toBe("Test Questionnaire 1");
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should return empty array when no questionnaires", () => {
			const testLayer = createTestLayer(mockDb, { selectResult: [] });

			return Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				const result = yield* service.getAll;

				expect(result).toHaveLength(0);
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("getById", () => {
		it.effect("should return questionnaire by id", () => {
			const testLayer = createTestLayer(mockDb, {
				selectResult: [mockDb.questionnaires[0]],
			});

			return Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				const result = yield* service.getById("q1");

				expect(result.id).toBe("q1");
				expect(result.title).toBe("Test Questionnaire 1");
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should fail when questionnaire not found", () => {
			const testLayer = createTestLayer(mockDb, { selectResult: [] });

			// Override where to return empty for not found
			mockDb.where = vi.fn().mockImplementation(() => toEffect([]));

			return Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				const exit = yield* Effect.exit(service.getById("non-existent"));

				expect(Exit.isFailure(exit)).toBe(true);
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("create", () => {
		it.effect("should create a new questionnaire", () => {
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

			return Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				const result = yield* service.create({
					title: "New Questionnaire",
					description: "New Description",
					isActive: false,
				});

				expect(result.title).toBe("New Questionnaire");
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("update", () => {
		it.effect("should update an existing questionnaire", () => {
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

			return Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				const result = yield* service.update("q1", { title: "Updated Title" });

				expect(result.title).toBe("Updated Title");
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should fail when updating non-existent questionnaire", () => {
			const testLayer = createTestLayer(mockDb, { updateResult: undefined });

			// Override to return empty for not found
			mockDb.where = vi.fn().mockImplementation(() =>
				toEffect([], {
					returning: vi.fn().mockImplementation(() => toEffect([])),
				}),
			);

			return Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				const exit = yield* Effect.exit(
					service.update("non-existent", { title: "New Title" }),
				);

				expect(Exit.isFailure(exit)).toBe(true);
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("delete", () => {
		it.effect("should delete questionnaires", () => {
			const testLayer = createTestLayer(mockDb);

			return Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				yield* service.delete(["q1", "q2"]);

				expect(mockDb.delete).toHaveBeenCalled();
			}).pipe(Effect.provide(testLayer));
		});
	});
});
