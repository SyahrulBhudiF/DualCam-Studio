import { PgDrizzle } from "@effect/sql-drizzle/Pg";
import { Effect, Exit, Layer } from "effect";
import { CommitPrototype } from "effect/Effectable";
import { it } from "@effect/vitest";
import { describe, expect, vi, beforeEach } from "vitest";
import { AuthService } from "@/infrastructure/services/auth";

// Creates an Effect-compatible mock result for yield*
const toEffect = <T>(data: T, methods?: Record<string, any>): any => {
	const obj = Object.create(CommitPrototype);
	obj.commit = () => Effect.succeed(data);
	if (methods) Object.assign(obj, methods);
	return obj;
};

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
		where: vi.fn().mockImplementation(() => toEffect([])),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn().mockImplementation(() =>
			toEffect([
				{
					id: "test-user-id",
					email: "test@example.com",
					passwordHash: "hashed_password",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			]),
		),
		delete: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
	};
};

// Create a test layer with mocked database
const createTestLayer = (mockDb: ReturnType<typeof createMockDb>) => {
	const MockPgDrizzle = Layer.succeed(PgDrizzle, mockDb as never);
	return AuthService.Default.pipe(Layer.provide(MockPgDrizzle));
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
				const result = yield* authService.signup(
					"test@example.com",
					"password123",
				);

				expect(result).toBeDefined();
				expect(result.email).toBe("test@example.com");
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should fail if user already exists", () => {
			// Mock that user already exists
			mockDb.where = vi.fn().mockImplementation(() =>
				toEffect([
					{
						id: "existing-id",
						email: "test@example.com",
						passwordHash: "hash",
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				]),
			);

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
			mockDb.where = vi.fn().mockImplementation(() => {
				callCount++;
				if (callCount === 1) {
					// First call: finding user
					return toEffect([
						{
							id: "user-id",
							email: "test@example.com",
							passwordHash: "hashed_password",
							createdAt: new Date(),
							updatedAt: new Date(),
						},
					]);
				}
				return toEffect([]);
			});

			// Mock session creation
			mockDb.returning = vi.fn().mockImplementation(() =>
				toEffect([
					{
						id: "session-id",
						userId: "user-id",
						token: "test-token",
						expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
						createdAt: new Date(),
					},
				]),
			);

			const testLayer = createTestLayer(mockDb);

			return Effect.gen(function* () {
				const authService = yield* AuthService;
				const result = yield* authService.login(
					"test@example.com",
					"password123",
				);

				expect(result.user).toBeDefined();
				expect(result.session).toBeDefined();
				expect(result.user.email).toBe("test@example.com");
			}).pipe(Effect.provide(testLayer));
		});

		it.effect("should fail with invalid credentials", () => {
			// Mock user not found
			mockDb.where = vi.fn().mockImplementation(() => toEffect([]));

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
			mockDb.where = vi.fn().mockImplementation(() => toEffect([]));

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
