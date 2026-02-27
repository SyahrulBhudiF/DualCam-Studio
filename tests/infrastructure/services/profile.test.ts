import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { Effect, Exit, Layer } from "effect";
import { CommitPrototype } from "effect/Effectable";
import { it } from "@effect/vitest";
import { describe, expect, vi, beforeEach } from "vitest";
import {
	ProfileService,
	ProfileServiceLive,
} from "@/infrastructure/services/profile";

// Creates an Effect-compatible mock result for yield*
const toEffect = <T>(data: T, methods?: Record<string, any>): any => {
	const obj = Object.create(CommitPrototype);
	obj.commit = () => Effect.succeed(data);
	if (methods) Object.assign(obj, methods);
	return obj;
};

// Create mock database operations
const createMockDb = () => {
	const mockProfiles = [
		{
			id: "p1",
			email: "user1@example.com",
			name: "User 1",
			class: "Class A",
			createdAt: new Date(),
		},
		{
			id: "p2",
			email: "user2@example.com",
			name: "User 2",
			class: "Class B",
			createdAt: new Date(),
		},
		{
			id: "p3",
			email: "user3@example.com",
			name: "User 3",
			class: "Class A",
			createdAt: new Date(),
		},
	];

	return {
		profiles: mockProfiles,
		select: vi.fn().mockReturnThis(),
		selectDistinct: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
	};
};

// Create a test layer with mocked database
const createTestLayer = (
	mockDb: ReturnType<typeof createMockDb>,
	overrides?: {
		selectResult?: unknown[] | null;
		insertResult?: unknown;
		updateResult?: unknown;
		getAllResult?: unknown[];
	},
) => {
	// Mock for getAll - select().from(profiles)
	mockDb.from = vi.fn().mockImplementation(() =>
		toEffect(overrides?.getAllResult ?? mockDb.profiles, {
			where: vi
				.fn()
				.mockImplementation(() =>
					toEffect(overrides?.selectResult ?? [mockDb.profiles[0]]),
				),
		}),
	);

	mockDb.selectDistinct = vi.fn().mockImplementation(() => ({
		from: vi.fn().mockImplementation(() => ({
			where: vi
				.fn()
				.mockImplementation(() =>
					toEffect(overrides?.selectResult ?? [{ class: "Class A" }]),
				),
		})),
	}));

	mockDb.where = vi.fn().mockImplementation(() =>
		toEffect(overrides?.selectResult ?? [mockDb.profiles[0]], {
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
	return ProfileServiceLive.pipe(Layer.provide(MockPgDrizzle));
};

describe("ProfileService", () => {
	let mockDb: ReturnType<typeof createMockDb>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = createMockDb();
	});

	describe("getById", () => {
		it.effect("should return profile by id", () => {
			const testLayer = createTestLayer(mockDb, {
				selectResult: [mockDb.profiles[0]],
			});

			return Effect.gen(function* () {
				const service = yield* ProfileService;
				const result = yield* service.getById("p1");

				expect(result.id).toBe("p1");
				expect(result.email).toBe("user1@example.com");
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should fail when profile not found", () => {
			mockDb.from = vi.fn().mockImplementation(() =>
				toEffect([], {
					where: vi.fn().mockImplementation(() => toEffect([])),
				}),
			);

			const testLayer = createTestLayer(mockDb, { selectResult: [] });

			return Effect.gen(function* () {
				const service = yield* ProfileService;
				const exit = yield* Effect.exit(service.getById("non-existent"));

				expect(Exit.isFailure(exit)).toBe(true);
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("getByEmail", () => {
		it.effect("should return profile by email", () => {
			const testLayer = createTestLayer(mockDb, {
				selectResult: [mockDb.profiles[0]],
			});

			return Effect.gen(function* () {
				const service = yield* ProfileService;
				const result = yield* service.getByEmail("user1@example.com");

				expect(result?.email).toBe("user1@example.com");
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should return null when email not found", () => {
			mockDb.from = vi.fn().mockImplementation(() =>
				toEffect([], {
					where: vi.fn().mockImplementation(() => toEffect([])),
				}),
			);

			const testLayer = createTestLayer(mockDb, { selectResult: [] });

			return Effect.gen(function* () {
				const service = yield* ProfileService;
				const result = yield* service.getByEmail("nonexistent@example.com");

				expect(result).toBeNull();
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("create", () => {
		it.effect("should create a new profile", () => {
			const newProfile = {
				id: "new-id",
				email: "new@example.com",
				name: "New User",
				class: "Class C",
				createdAt: new Date(),
			};

			const testLayer = createTestLayer(mockDb, {
				insertResult: newProfile,
			});

			return Effect.gen(function* () {
				const service = yield* ProfileService;
				const result = yield* service.create({
					email: "new@example.com",
					name: "New User",
					class: "Class C",
				});

				expect(result.email).toBe("new@example.com");
				expect(result.name).toBe("New User");
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("upsertByEmail", () => {
		it.effect("should update existing profile", () => {
			const updatedProfile = {
				id: "p1",
				email: "user1@example.com",
				name: "Updated User",
				class: "Class D",
				createdAt: new Date(),
			};

			// Mock to find existing user and then update
			mockDb.from = vi.fn().mockImplementation(() =>
				toEffect(mockDb.profiles, {
					where: vi
						.fn()
						.mockImplementation(() => toEffect([mockDb.profiles[0]])),
				}),
			);

			mockDb.where = vi.fn().mockImplementation(() =>
				toEffect([], {
					returning: vi
						.fn()
						.mockImplementation(() => toEffect([updatedProfile])),
				}),
			);

			const testLayer = createTestLayer(mockDb, {
				selectResult: [mockDb.profiles[0]],
				updateResult: updatedProfile,
			});

			return Effect.gen(function* () {
				const service = yield* ProfileService;
				const result = yield* service.upsertByEmail("user1@example.com", {
					name: "Updated User",
					class: "Class D",
				});

				expect(result.name).toBe("Updated User");
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should create new profile if not exists", () => {
			const newProfile = {
				id: "new-id",
				email: "newuser@example.com",
				name: "New User",
				class: "Class E",
				createdAt: new Date(),
			};

			// Mock to not find existing user, then create
			mockDb.from = vi.fn().mockImplementation(() =>
				toEffect([], {
					where: vi.fn().mockImplementation(() => toEffect([])),
				}),
			);

			mockDb.returning = vi
				.fn()
				.mockImplementation(() => toEffect([newProfile]));

			const testLayer = createTestLayer(mockDb, {
				selectResult: [],
				insertResult: newProfile,
			});

			return Effect.gen(function* () {
				const service = yield* ProfileService;
				const result = yield* service.upsertByEmail("newuser@example.com", {
					name: "New User",
					class: "Class E",
				});

				expect(result.email).toBe("newuser@example.com");
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("getAll", () => {
		it.effect("should return all profiles", () => {
			const testLayer = createTestLayer(mockDb, {
				getAllResult: mockDb.profiles,
			});

			return Effect.gen(function* () {
				const service = yield* ProfileService;
				const result = yield* service.getAll;

				expect(result).toHaveLength(3);
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should return empty array when no profiles", () => {
			const testLayer = createTestLayer(mockDb, { getAllResult: [] });

			return Effect.gen(function* () {
				const service = yield* ProfileService;
				const result = yield* service.getAll;

				expect(result).toHaveLength(0);
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("getUniqueClasses", () => {
		it.effect("should return unique classes sorted", () => {
			const mockClasses = [{ class: "Class A" }, { class: "Class B" }];
			const testLayer = createTestLayer(mockDb, {
				selectResult: mockClasses,
			});

			return Effect.gen(function* () {
				const service = yield* ProfileService;
				const result = yield* service.getUniqueClasses;

				expect(result).toEqual(["Class A", "Class B"]);
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should return empty array when no profiles", () => {
			const testLayer = createTestLayer(mockDb, {
				selectResult: [],
			});

			return Effect.gen(function* () {
				const service = yield* ProfileService;
				const result = yield* service.getUniqueClasses;

				expect(result).toHaveLength(0);
			}).pipe(Effect.provide(testLayer));
		});
	});
});
