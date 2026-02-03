import { Effect } from "effect";
import { it } from "@effect/vitest";
import { describe, expect, vi, beforeEach } from "vitest";

// Mock the tanstack server functions
vi.mock("@tanstack/react-start/server", () => ({
	getCookies: vi.fn(() => ({})),
	setCookie: vi.fn(),
	deleteCookie: vi.fn(),
}));

// Set environment variables for tests
beforeEach(() => {
	vi.stubEnv("SESSION_COOKIE_NAME", "test_session");
	vi.stubEnv("SESSION_DURATION_DAYS", "7");
	vi.stubEnv("NODE_ENV", "test");
});

describe("Session Utilities", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
	});

	describe("getSessionToken", () => {
		it("should return undefined when no session cookie exists", async () => {
			const { getCookies } = await import("@tanstack/react-start/server");
			vi.mocked(getCookies).mockReturnValue({});

			const { getSessionToken } = await import("@/utils/session");

			const result = await Effect.runPromise(getSessionToken);

			expect(result).toBeUndefined();
		});

		it("should return token when session cookie exists", async () => {
			const { getCookies } = await import("@tanstack/react-start/server");
			vi.mocked(getCookies).mockReturnValue({
				test_session: "my-token-123",
			});

			const { getSessionToken } = await import("@/utils/session");

			const result = await Effect.runPromise(getSessionToken);

			expect(result).toBe("my-token-123");
		});
	});

	describe("setSessionCookie", () => {
		it("should set cookie with correct options", async () => {
			const { setCookie } = await import("@tanstack/react-start/server");
			const { setSessionCookie } = await import("@/utils/session");

			await Effect.runPromise(setSessionCookie("new-token"));

			expect(setCookie).toHaveBeenCalledWith("test_session", "new-token", {
				httpOnly: true,
				secure: false, // NODE_ENV is 'test'
				sameSite: "lax",
				path: "/",
				maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
			});
		});
	});

	describe("clearSessionCookie", () => {
		it("should delete the session cookie", async () => {
			const { deleteCookie } = await import("@tanstack/react-start/server");
			const { clearSessionCookie } = await import("@/utils/session");

			await Effect.runPromise(clearSessionCookie);

			expect(deleteCookie).toHaveBeenCalledWith("test_session");
		});
	});

	describe("extractErrorMessage", () => {
		it("should return default message for non-Effect errors", async () => {
			const { extractErrorMessage } = await import("@/utils/session");

			const result = extractErrorMessage(
				new Error("Some error"),
				"Default message",
			);

			expect(result).toBe("Default message");
		});

		it("should extract message from Effect Fail cause", async () => {
			const { extractErrorMessage } = await import("@/utils/session");

			const cause = {
				_tag: "Fail",
				error: { message: "Effect error message" },
			};

			const result = extractErrorMessage(cause, "Default message");

			expect(result).toBe("Effect error message");
		});

		it("should return default for invalid cause structure", async () => {
			const { extractErrorMessage } = await import("@/utils/session");

			const cause = { _tag: "Fail" };

			const result = extractErrorMessage(cause, "Default message");

			expect(result).toBe("Default message");
		});
	});
});

describe("Session Config", () => {
	it("should use environment variables for configuration", async () => {
		vi.stubEnv("SESSION_COOKIE_NAME", "custom_session");
		vi.stubEnv("SESSION_DURATION_DAYS", "14");
		vi.resetModules();

		const { setCookie } = await import("@tanstack/react-start/server");
		const { setSessionCookie } = await import("@/utils/session");

		await Effect.runPromise(setSessionCookie("test-token"));

		expect(setCookie).toHaveBeenCalledWith(
			"custom_session",
			"test-token",
			expect.objectContaining({
				maxAge: 14 * 24 * 60 * 60,
			}),
		);
	});
});
