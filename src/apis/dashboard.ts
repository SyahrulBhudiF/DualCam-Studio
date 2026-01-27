import { Effect } from "effect";
import { createServerFn } from "@tanstack/react-start";
import { DashboardService, runEffect } from "@/infrastructure";

export const getDashboardSummary = createServerFn({ method: "GET" }).handler(
	async () => {
		return runEffect(
			Effect.gen(function* () {
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
			const service = yield* DashboardService;
			return yield* service.getAnalyticsDetails;
		}),
	);
});
