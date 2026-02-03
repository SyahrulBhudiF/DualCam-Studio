import {
	deleteCookie,
	getCookies,
	setCookie,
} from "@tanstack/react-start/server";
import { Config, Effect } from "effect";

// Session configuration using Effect Config
const SessionConfig = Config.all({
	cookieName: Config.string("SESSION_COOKIE_NAME"),
	durationDays: Config.number("SESSION_DURATION_DAYS"),
	secure: Config.string("NODE_ENV").pipe(
		Config.map((env) => env === "production"),
		Config.withDefault(false),
	),
});

// Get the session token from cookies
export const getSessionToken = Effect.gen(function* () {
	const config = yield* SessionConfig;
	const cookies = getCookies();
	return cookies[config.cookieName] as string | undefined;
});

// Set the session cookie with secure options
export const setSessionCookie = (token: string) =>
	Effect.gen(function* () {
		const config = yield* SessionConfig;
		setCookie(config.cookieName, token, {
			httpOnly: true,
			secure: config.secure,
			sameSite: "lax",
			path: "/",
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
	if (cause && typeof cause === "object" && "_tag" in cause) {
		const failure = cause as { _tag: string; error?: { message?: string } };
		if (failure._tag === "Fail" && failure.error?.message) {
			return failure.error.message;
		}
	}
	return defaultMessage;
};
