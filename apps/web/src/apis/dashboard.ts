import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import { DashboardService, runEffect } from "@/infrastructure";
import { requireAuth } from "@/utils/session";

export const getDashboardData = createServerFn({ method: "GET" }).handler(
	async () => {
		return runEffect(
			Effect.gen(function* () {
				yield* requireAuth;
				const service = yield* DashboardService.asEffect();

				return yield* service.getDashboardData();
			}),
		);
	},
);
