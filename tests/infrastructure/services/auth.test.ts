import { describe, it, expect, vi, beforeEach } from "vitest";
import { Effect, Exit, Layer } from "effect";
import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import {
	AuthService,
	AuthServiceLive,
} from "@/infrastructure/services/auth";

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
		it("should create a new user successfully", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const authService = yield* AuthService;
				return yield* authService.signup("test@example.com", "password123");
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toBeDefined();
			expect(result.email).toBe("test@example.com");
		});

		it("should fail if user already exists", async () => {
			// Mock that user already exists
			mockDb.where = vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) => {
					return Promise.resolve([{
						id: "existing-id",
						email: "test@example.com",
						passwordHash: "hash",
						createdAt: new Date(),
						updatedAt: new Date(),
					}]).then(resolve);
				},
			}));

			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const authService = yield* AuthService;
				return yield* authService.signup("test@example.com", "password123");
			});

			const exit = await Effect.runPromiseExit(
				program.pipe(Effect.provide(testLayer))
			);

			expect(Exit.isFailure(exit)).toBe(true);
		});
	});

	describe("login", () => {
		it("should login successfully with valid credentials", async () => {
			const bcrypt = await import("bcryptjs");
			vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

			// Mock user exists
			let callCount = 0;
			mockDb.where = vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) => {
					callCount++;
					if (callCount === 1) {
						// First call: finding user
						return Promise.resolve([{
							id: "user-id",
							email: "test@example.com",
							passwordHash: "hashed_password",
							createdAt: new Date(),
							updatedAt: new Date(),
						}]).then(resolve);
					}
					return Promise.resolve([]).then(resolve);
				},
			}));

			// Mock session creation
			mockDb.returning = vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) => {
					return Promise.resolve([{
						id: "session-id",
						userId: "user-id",
						token: "test-token",
						expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
						createdAt: new Date(),
					}]).then(resolve);
				},
			}));

			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const authService = yield* AuthService;
				return yield* authService.login("test@example.com", "password123");
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result.user).toBeDefined();
			expect(result.session).toBeDefined();
			expect(result.user.email).toBe("test@example.com");
		});

		it("should fail with invalid credentials", async () => {
			// Mock user not found
			mockDb.where = vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) => {
					return Promise.resolve([]).then(resolve);
				},
			}));

			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const authService = yield* AuthService;
				return yield* authService.login("test@example.com", "password123");
			});

			const exit = await Effect.runPromiseExit(
				program.pipe(Effect.provide(testLayer))
			);

			expect(Exit.isFailure(exit)).toBe(true);
		});
	});

	describe("validateSession", () => {
		it("should fail with empty token", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const authService = yield* AuthService;
				return yield* authService.validateSession("");
			});

			const exit = await Effect.runPromiseExit(
				program.pipe(Effect.provide(testLayer))
			);

			expect(Exit.isFailure(exit)).toBe(true);
		});

		it("should fail with expired session", async () => {
			// Mock no valid session found
			mockDb.where = vi.fn().mockImplementation(() => ({
				then: (resolve: (rows: unknown[]) => void) => {
					return Promise.resolve([]).then(resolve);
				},
			}));

			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const authService = yield* AuthService;
				return yield* authService.validateSession("expired-token");
			});

			const exit = await Effect.runPromiseExit(
				program.pipe(Effect.provide(testLayer))
			);

			expect(Exit.isFailure(exit)).toBe(true);
		});
	});

	describe("logout", () => {
		it("should logout successfully", async () => {
			const testLayer = createTestLayer(mockDb);

			const program = Effect.gen(function* () {
				const authService = yield* AuthService;
				return yield* authService.logout("test-token");
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(testLayer))
			);

			expect(result).toBeUndefined();
			expect(mockDb.delete).toHaveBeenCalled();
		});
	});
});
