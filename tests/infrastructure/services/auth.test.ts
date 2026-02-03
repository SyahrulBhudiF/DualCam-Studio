import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { Effect, Exit, Layer } from "effect";
import { it } from "@effect/vitest";
import { describe, expect, vi, beforeEach } from "vitest";
import { AuthService, AuthServiceLive } from "@/infrastructure/services/auth";

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
	default: {
		hash: vi.fn().mockResolvedValue("hashed_password"),
		compare: vi.fn().mockResolvedValue(true),
	},
	hash: vi.fn().mockResolvedValue("hashed_password"),
	compare: vi.fn().mockResolvedValue(true),
}));

// Create mock database operations
const createMockDb = () => {
	const mockUsers: Array<{
		id: string;
		email: string;
		passwordHash: string;
		createdAt: Date;
		updatedAt: Date;
	}> = [];

	const mockSessions: Array<{
		id: string;
		userId: string;
		token: string;
		expiresAt: Date;
		createdAt: Date;
	}> = [];

	return {
		users: mockUsers,
		sessions: mockSessions,
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockImplementation(() => ({
			then: (resolve: (rows: unknown[]) => void) => {
				// Return empty by default, tests can override
				return Promise.resolve([]).then(resolve);
			},
		})),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockImplementation(() => ({
			then: (resolve: (rows: unknown[]) => void) => {
				const newUser = {
					id: "test-user-id",
					email: "test@example.com",
					passwordHash: "hashed_password",
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				return Promise.resolve([newUser]).then(resolve);
			},
		})),
		delete: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
	};
};

// Create a test layer with mocked database
const createTestLayer = (mockDb: ReturnType<typeof createMockDb>) => {
	const MockPgDrizzle = Layer.succeed(PgDrizzle, mockDb as never);
	return AuthServiceLive.pipe(Layer.provide(MockPgDrizzle));
};

describe("AuthService", () => {
	let mockDb: ReturnType<typeof createMockDb>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = createMockDb();
	});

	describe("signup", () => {
		it.effect("should create a new user successfully", () => {
			const testLayer = createTestLayer(mockDb);

			return Effect.gen(function* () {
				const authService = yield* AuthService;
				const result = yield* authService.signup("test@example.com", "password123");

				expect(result).toBeDefined();
				expect(result.email).toBe("test@example.com");
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should fail if user already exists", () => {
			// Mock that user already exists
			mockDb.where = vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) => {
					return Promise.resolve([
						{
							id: "existing-id",
							email: "test@example.com",
							passwordHash: "hash",
							createdAt: new Date(),
							updatedAt: new Date(),
						},
					]).then(resolve);
				},
			}));

			const testLayer = createTestLayer(mockDb);

			return Effect.gen(function* () {
				const authService = yield* AuthService;
				const exit = yield* Effect.exit(
					authService.signup("test@example.com", "password123"),
				);

				expect(Exit.isFailure(exit)).toBe(true);
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("login", () => {
		it.effect("should login successfully with valid credentials", () => {
			// Mock user exists
			let callCount = 0;
			mockDb.where = vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) => {
					callCount++;
					if (callCount === 1) {
						// First call: finding user
						return Promise.resolve([
							{
								id: "user-id",
								email: "test@example.com",
								passwordHash: "hashed_password",
								createdAt: new Date(),
								updatedAt: new Date(),
							},
						]).then(resolve);
					}
					return Promise.resolve([]).then(resolve);
				},
			}));

			// Mock session creation
			mockDb.returning = vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) => {
					return Promise.resolve([
						{
							id: "session-id",
							userId: "user-id",
							token: "test-token",
							expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
							createdAt: new Date(),
						},
					]).then(resolve);
				},
			}));

			const testLayer = createTestLayer(mockDb);

			return Effect.gen(function* () {
				const authService = yield* AuthService;
				const result = yield* authService.login("test@example.com", "password123");

				expect(result.user).toBeDefined();
				expect(result.session).toBeDefined();
				expect(result.user.email).toBe("test@example.com");
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should fail with invalid credentials", () => {
			// Mock user not found
			mockDb.where = vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) => {
					return Promise.resolve([]).then(resolve);
				},
			}));

			const testLayer = createTestLayer(mockDb);

			return Effect.gen(function* () {
				const authService = yield* AuthService;
				const exit = yield* Effect.exit(
					authService.login("test@example.com", "password123"),
				);

				expect(Exit.isFailure(exit)).toBe(true);
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("validateSession", () => {
		it.effect("should fail with empty token", () => {
			const testLayer = createTestLayer(mockDb);

			return Effect.gen(function* () {
				const authService = yield* AuthService;
				const exit = yield* Effect.exit(authService.validateSession(""));

				expect(Exit.isFailure(exit)).toBe(true);
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should fail with expired session", () => {
			// Mock no valid session found
			mockDb.where = vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) => {
					return Promise.resolve([]).then(resolve);
				},
			}));

			const testLayer = createTestLayer(mockDb);

			return Effect.gen(function* () {
				const authService = yield* AuthService;
				const exit = yield* Effect.exit(
					authService.validateSession("expired-token"),
				);

				expect(Exit.isFailure(exit)).toBe(true);
			}).pipe(Effect.provide(testLayer));
		});
	});

	describe("logout", () => {
		it.effect("should logout successfully", () => {
			const testLayer = createTestLayer(mockDb);

			return Effect.gen(function* () {
				const authService = yield* AuthService;
				const result = yield* authService.logout("test-token");

				expect(result).toBeUndefined();
				expect(mockDb.delete).toHaveBeenCalled();
			}).pipe(Effect.provide(testLayer));
		});
	});
});
