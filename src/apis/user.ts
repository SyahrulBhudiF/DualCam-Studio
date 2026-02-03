import { Schema } from "@effect/schema";
import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Effect, Exit } from "effect";
import { AuthService, runEffectExit } from "@/infrastructure";
import { LoginSchema, SignupSchema } from "@/infrastructure/schemas/auth";
import {
	clearSessionCookie,
	extractErrorMessage,
	getSessionToken,
	setSessionCookie,
} from "@/utils/session";

export const fetchUser = createServerFn({ method: "GET" }).handler(async () => {
	const exit = await runEffectExit(
		Effect.gen(function* () {
			const token = yield* getSessionToken;

			if (!token) {
				return null;
			}

			const authService = yield* AuthService;
			const result = yield* Effect.either(authService.validateSession(token));

			if (result._tag === "Left") {
				yield* clearSessionCookie;
				return null;
			}

			return { email: result.right.user.email };
		}),
	);

	if (Exit.isFailure(exit)) {
		return null;
	}

	return exit.value;
});

export const loginFn = createServerFn({ method: "POST" })
	.inputValidator(Schema.decodeUnknownSync(LoginSchema))
	.handler(async ({ data }) => {
		const exit = await runEffectExit(
			Effect.gen(function* () {
				const authService = yield* AuthService;
				const result = yield* authService.login(data.email, data.password);
				yield* setSessionCookie(result.session.token);
				return result;
			}),
		);

		if (Exit.isFailure(exit)) {
			return {
				error: true,
				message: extractErrorMessage(exit.cause, "Login failed"),
			};
		}

		return { error: false };
	});

export const logoutFn = createServerFn().handler(async () => {
	await runEffectExit(
		Effect.gen(function* () {
			const token = yield* getSessionToken;

			if (token) {
				const authService = yield* AuthService;
				yield* Effect.either(authService.logout(token));
			}

			yield* clearSessionCookie;
		}),
	);

	throw redirect({
		href: "/",
	});
});

export const signupFn = createServerFn({ method: "POST" })
	.inputValidator(Schema.decodeUnknownSync(SignupSchema))
	.handler(async ({ data }) => {
		const exit = await runEffectExit(
			Effect.gen(function* () {
				const authService = yield* AuthService;
				yield* authService.signup(data.email, data.password);
				const result = yield* authService.login(data.email, data.password);
				yield* setSessionCookie(result.session.token);

				return result;
			}),
		);

		if (Exit.isFailure(exit)) {
			return {
				error: true,
				message: extractErrorMessage(exit.cause, "Signup failed"),
			};
		}

		throw redirect({
			href: data.redirectUrl || "/",
		});
	});
