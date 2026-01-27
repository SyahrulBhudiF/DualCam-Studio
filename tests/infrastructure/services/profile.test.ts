import { describe, it, expect, vi, beforeEach } from "vitest";
import { Effect, Exit, Layer } from "effect";
import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import {
	ProfileService,
	ProfileServiceLive,
} from "@/infrastructure/services/profile";

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
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
		then: vi.fn(),
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
	}
) => {
	// Mock for getAll - select().from(profiles)
	mockDb.from = vi.fn().mockImplementation(() => ({
		then: (resolve: (rows: unknown[]) => void) =>
			Promise.resolve(overrides?.getAllResult ?? mockDb.profiles).then(resolve),
		where: vi.fn().mockImplementation(() => ({
			then: (resolve: (rows: unknown[]) => void) =>
				Promise.resolve(overrides?.selectResult ?? [mockDb.profiles[0]]).then(
					resolve
				),
		})),
	}));

	mockDb.where = vi.fn().mockImplementation(() => ({
		then: (resolve: (rows: unknown[]) => void) =>
			Promise.resolve(overrides?.selectResult ?? [mockDb.profiles[0]]).then(
				resolve
			),
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
	return ProfileServiceLive.pipe(Layer.provide(MockPgDrizzle));
};

describe("ProfileService", () => {
	let mockDb: ReturnType<typeof createMockDb>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = createMockDb();
	});

	describe("getById", () => {
		it("should return profile by id", async () => {
			const testLayer = createTestLayer(mockDb, {
				selectResult: [mockDb.profiles[0]],
			});

			const program = Effect.gen(function* () {
				const service = yield* ProfileService;
				return yield* service.getById("p1");
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result.id).toBe("p1");
			expect(result.email).toBe("user1@example.com");
		});

		it("should fail when profile not found", async () => {
			mockDb.from = vi.fn().mockImplementation(() => ({
				where: vi.fn().mockImplementation(() => ({
					then: (resolve: (rows: unknown[]) => void) =>
						Promise.resolve([]).then(resolve),
				})),
			}));

			const testLayer = createTestLayer(mockDb, { selectResult: [] });

			const program = Effect.gen(function* () {
				const service = yield* ProfileService;
				return yield* service.getById("non-existent");
			});

			const exit = await Effect.runPromiseExit(
				program.pipe(Effect.provide(testLayer))
			);

			expect(Exit.isFailure(exit)).toBe(true);
		});
	});

	describe("getByEmail", () => {
		it("should return profile by email", async () => {
			const testLayer = createTestLayer(mockDb, {
				selectResult: [mockDb.profiles[0]],
			});

			const program = Effect.gen(function* () {
				const service = yield* ProfileService;
				return yield* service.getByEmail("user1@example.com");
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result?.email).toBe("user1@example.com");
		});

		it("should return null when email not found", async () => {
			mockDb.from = vi.fn().mockImplementation(() => ({
				where: vi.fn().mockImplementation(() => ({
					then: (resolve: (rows: unknown[]) => void) =>
						Promise.resolve([]).then(resolve),
				})),
			}));

			const testLayer = createTestLayer(mockDb, { selectResult: [] });

			const program = Effect.gen(function* () {
				const service = yield* ProfileService;
				return yield* service.getByEmail("nonexistent@example.com");
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toBeNull();
		});
	});

	describe("create", () => {
		it("should create a new profile", async () => {
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

			const program = Effect.gen(function* () {
				const service = yield* ProfileService;
				return yield* service.create({
					email: "new@example.com",
					name: "New User",
					class: "Class C",
				});
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result.email).toBe("new@example.com");
			expect(result.name).toBe("New User");
		});
	});

	describe("upsertByEmail", () => {
		it("should update existing profile", async () => {
			const updatedProfile = {
				id: "p1",
				email: "user1@example.com",
				name: "Updated User",
				class: "Class D",
				createdAt: new Date(),
			};

			// Mock to find existing user and then update
			mockDb.from = vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) =>
					Promise.resolve(mockDb.profiles).then(resolve),
				where: vi.fn().mockImplementation(() => ({
					then: (resolve: (rows: unknown[]) => void) =>
						Promise.resolve([mockDb.profiles[0]]).then(resolve),
				})),
			}));

			mockDb.where = vi.fn().mockImplementation(() => ({
				returning: vi.fn().mockImplementation(() => ({
					then: (resolve: (rows: unknown[]) => void) =>
						Promise.resolve([updatedProfile]).then(resolve),
				})),
			}));

			const testLayer = createTestLayer(mockDb, {
				selectResult: [mockDb.profiles[0]],
				updateResult: updatedProfile,
			});

			const program = Effect.gen(function* () {
				const service = yield* ProfileService;
				return yield* service.upsertByEmail("user1@example.com", {
					name: "Updated User",
					class: "Class D",
				});
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result.name).toBe("Updated User");
		});

		it("should create new profile if not exists", async () => {
			const newProfile = {
				id: "new-id",
				email: "newuser@example.com",
				name: "New User",
				class: "Class E",
				createdAt: new Date(),
			};

			// Mock to not find existing user, then create
			mockDb.from = vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) =>
					Promise.resolve([]).then(resolve),
				where: vi.fn().mockImplementation(() => ({
					then: (resolve: (rows: unknown[]) => void) =>
						Promise.resolve([]).then(resolve),
				})),
			}));

			mockDb.returning = vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) =>
					Promise.resolve([newProfile]).then(resolve),
			}));

			const testLayer = createTestLayer(mockDb, {
				selectResult: [],
				insertResult: newProfile,
			});

			const program = Effect.gen(function* () {
				const service = yield* ProfileService;
				return yield* service.upsertByEmail("newuser@example.com", {
					name: "New User",
					class: "Class E",
				});
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result.email).toBe("newuser@example.com");
		});
	});

	describe("getAll", () => {
		it("should return all profiles", async () => {
			const testLayer = createTestLayer(mockDb, {
				getAllResult: mockDb.profiles,
			});

			const program = Effect.gen(function* () {
				const service = yield* ProfileService;
				return yield* service.getAll;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toHaveLength(3);
		});

		it("should return empty array when no profiles", async () => {
			const testLayer = createTestLayer(mockDb, { getAllResult: [] });

			const program = Effect.gen(function* () {
				const service = yield* ProfileService;
				return yield* service.getAll;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toHaveLength(0);
		});
	});

	describe("getUniqueClasses", () => {
		it("should return unique classes sorted", async () => {
			const testLayer = createTestLayer(mockDb, {
				getAllResult: mockDb.profiles,
			});

			const program = Effect.gen(function* () {
				const service = yield* ProfileService;
				return yield* service.getUniqueClasses;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toEqual(["Class A", "Class B"]);
		});

		it("should return empty array when no profiles", async () => {
			const testLayer = createTestLayer(mockDb, { getAllResult: [] });

			const program = Effect.gen(function* () {
				const service = yield* ProfileService;
				return yield* service.getUniqueClasses;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toHaveLength(0);
		});
	});
});
