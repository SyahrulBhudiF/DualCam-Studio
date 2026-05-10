import { getRequestHeader, getRequestUrl } from "@tanstack/react-start/server";
import { Effect } from "effect";
import { CsrfError } from "@/infrastructure/errors/auth";

export const verifyCsrfOrigin = Effect.gen(function* () {
	const origin = getRequestHeader("origin");
	const requestUrl = getRequestUrl();

	// If no Origin header, check Referer as fallback
	if (!origin) {
		const referer = getRequestHeader("referer");
		if (!referer) {
			return yield* Effect.fail(
				new CsrfError({ message: "Missing Origin header" }),
			);
		}

		const refererHost = new URL(referer).host;
		const requestHost = new URL(requestUrl).host;

		if (refererHost !== requestHost) {
			return yield* Effect.fail(
				new CsrfError({ message: "Invalid Referer header" }),
			);
		}
		return;
	}

	const originHost = new URL(origin).host;
	const requestHost = new URL(requestUrl).host;

	if (originHost !== requestHost) {
		return yield* Effect.fail(new CsrfError({ message: "Origin mismatch" }));
	}
});
