import {
	deleteCookie,
	getCookies,
	setCookie,
} from"@tanstack/react-start/server";
import { Cause, Effect, Option } from"effect";
import { SessionConfig } from"@/infrastructure/config";
import { UnauthorizedError } from"@/infrastructure/errors/auth";
import { AuthService } from"@/infrastructure/services/auth";

// Get the session token from cookies
export const getSessionToken = Effect.gen(function* () {
	const config = yield* SessionConfig;
	const cookies = getCookies();
	return cookies[config.cookieName] as string | undefined;
});

// Require authenticated session — fails with UnauthorizedError if not logged in
export const requireAuth = Effect.gen(function* () {
	const token = yield* getSessionToken;

	if (!token) {
		return yield* Effect.fail(
			new UnauthorizedError({ message:"Authentication required" }),
		);
	}

	const authService = yield* AuthService.asEffect();
	const result = yield* authService
		.validateSession(token)
		.pipe(
			Effect.mapError(
				() => new UnauthorizedError({ message:"Invalid or expired session" }),
			),
		);

	return result;
});

// Set the session cookie with secure options
export const setSessionCookie = (token: string) =>
	Effect.gen(function* () {
		const config = yield* SessionConfig;
		setCookie(config.cookieName, token, {
			httpOnly: true,
			secure: config.secure,
			sameSite:"lax",
			path:"/",
			maxAge: config.durationDays * 24 * 60 * 60,
		});
	});

// Clear the session cookie
export const clearSessionCookie = Effect.gen(function* () {
	const config = yield* SessionConfig;
	deleteCookie(config.cookieName);
});

// Extract error message from Effect Cause
export const extractErrorMessage = (
	cause: unknown,
	defaultMessage: string,
): string => {
	if (!Cause.isCause(cause)) {
		if (cause && typeof cause ==="object" &&"error" in cause) {
			const legacy = cause as { error?: { message?: string } };
			if (legacy.error?.message) return legacy.error.message;
		}
		return defaultMessage;
	}

	const error = Cause.findErrorOption(cause);
	if (Option.isSome(error)) {
		const value = error.value;
		if (value instanceof Error) return value.message;
		if (value && typeof value ==="object" &&"message" in value) {
			return String(value.message);
		}
		return String(value);
	}

	return defaultMessage;
};
