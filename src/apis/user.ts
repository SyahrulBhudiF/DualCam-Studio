import { redirect } from"@tanstack/react-router";
import { createServerFn } from"@tanstack/react-start";
import { getRequestIP } from"@tanstack/react-start/server";
import { Effect, Exit, Result } from"effect";
import { AuthService, RateLimitService, runEffectExit } from"@/infrastructure";
import { LoginSchema, SignupSchema } from"@/infrastructure/schemas/auth";
import { verifyCsrfOrigin } from"@/utils/csrf";
import {
	clearSessionCookie,
	extractErrorMessage,
	getSessionToken,
	setSessionCookie,
} from"@/utils/session";
import { inputValidator } from"../infrastructure/schemas/validator";

export const fetchUser = createServerFn({ method:"GET" }).handler(async () => {
	const exit = await runEffectExit(
		Effect.gen(function* () {
			const token = yield* getSessionToken;

			if (!token) {
				return null;
			}

			const authService = yield* AuthService.asEffect();
			const result = yield* Effect.result(authService.validateSession(token));

			if (Result.isFailure(result)) {
				yield* clearSessionCookie;
				return null;
			}

			return { email: result.success.user.email };
		}),
	);

	if (Exit.isFailure(exit)) {
		return null;
	}

	return exit.value;
});

export const loginFn = createServerFn({ method:"POST" })
	.inputValidator(inputValidator(LoginSchema))
	.handler(async ({ data }) => {
		const exit = await runEffectExit(
			Effect.gen(function* () {
				// CSRF protection
				yield* verifyCsrfOrigin;

				// Rate limiting by IP
				const ip = getRequestIP() ??"unknown";
				const rateLimiter = yield* RateLimitService.asEffect();
				yield* rateLimiter.check(`login:${ip}`);

				// Piggyback rate limit cleanup (fire-and-forget)
				yield* Effect.forkDetach(rateLimiter.cleanup());

				const authService = yield* AuthService.asEffect();
				const result = yield* authService.login(data.email, data.password);
				yield* setSessionCookie(result.session.token);
				return result;
			}),
		);

		if (Exit.isFailure(exit)) {
			return {
				error: true,
				message: extractErrorMessage(exit.cause,"Login failed"),
			};
		}

		return { error: false };
	});

export const logoutFn = createServerFn().handler(async () => {
	await runEffectExit(
		Effect.gen(function* () {
			// CSRF protection
			yield* verifyCsrfOrigin;

			const token = yield* getSessionToken;

			if (token) {
				const authService = yield* AuthService.asEffect();
				yield* Effect.result(authService.logout(token));
			}

			yield* clearSessionCookie;
		}),
	);

	throw redirect({
		href:"/",
	});
});

export const signupFn = createServerFn({ method:"POST" })
	.inputValidator(inputValidator(SignupSchema))
	.handler(async ({ data }) => {
		const exit = await runEffectExit(
			Effect.gen(function* () {
				// CSRF protection
				yield* verifyCsrfOrigin;

				// Rate limiting by IP
				const ip = getRequestIP() ??"unknown";
				const rateLimiter = yield* RateLimitService.asEffect();
				yield* rateLimiter.check(`signup:${ip}`);

				const authService = yield* AuthService.asEffect();
				yield* authService.signup(data.email, data.password);
				const result = yield* authService.login(data.email, data.password);
				yield* setSessionCookie(result.session.token);

				return result;
			}),
		);

		if (Exit.isFailure(exit)) {
			return {
				error: true,
				message: extractErrorMessage(exit.cause,"Signup failed"),
			};
		}

		throw redirect({
			href: data.redirectUrl ||"/",
		});
	});
