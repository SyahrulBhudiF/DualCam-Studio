import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import { DashboardService, runEffect } from "@/infrastructure";
import { requireAuth } from "@/utils/session";

export const getDashboardSummary = createServerFn({ method: "GET" }).handler(
	async () => {
		return runEffect(
			Effect.gen(function* () {
				yield* requireAuth;
				const service = yield* DashboardService;

				return yield* service.getSummary;
			}),
		);
	},
);

export const getDashboardBreakdown = createServerFn({
	method: "GET",
}).handler(async () => {
	return runEffect(
		Effect.gen(function* () {
			yield* requireAuth;
			const service = yield* DashboardService;

			return yield* service.getBreakdown;
		}),
	);
});

export const getAnalyticsDetails = createServerFn({
	method: "GET",
}).handler(async () => {
	return runEffect(
		Effect.gen(function* () {
			yield* requireAuth;
			const service = yield* DashboardService;

			return yield* service.getAnalyticsDetails;
		}),
	);
});
