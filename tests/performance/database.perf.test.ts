import { describe, expect } from "vitest";
import { it } from "@effect/vitest";
import { Effect, Layer, Duration, Redacted, Array as Arr } from "effect";
import { layer as pgDrizzleLayer } from "@effect/sql-drizzle/Pg";
import { PgClient } from "@effect/sql-pg";
import {
	DashboardService,
	
} from "@/infrastructure/services/dashboard";
import {
	QuestionnaireService,
	
} from "@/infrastructure/services/questionnaire";
import {
	ResponseService,
	
} from "@/infrastructure/services/response";
import {
	ProfileService,
	
} from "@/infrastructure/services/profile";

// Performance measurement using performance.now() for accurate timing
const timed = <A, E, R>(
	name: string,
	effect: Effect.Effect<A, E, R>,
	maxMs: number,
) =>
	Effect.gen(function* () {
		const start = performance.now();
		const result = yield* effect;
		const ms = performance.now() - start;
		console.log(`  ⏱️  ${name}: ${formatDuration(ms)}`);
		expect(ms).toBeLessThan(maxMs);
		return result;
	});

const formatDuration = (ms: number): string => {
	if (ms < 1) return `${(ms * 1000).toFixed(2)}µs`;
	if (ms < 1000) return `${ms.toFixed(2)}ms`;
	return `${(ms / 1000).toFixed(2)}s`;
};

const DATABASE_URL = process.env.DATABASE_URL;
const shouldSkip = !DATABASE_URL;

// Create real database layer
const PgClientLive = PgClient.layer({
	url: Redacted.make(DATABASE_URL ?? ""),
	maxConnections: 10,
	idleTimeout: Duration.seconds(60),
	connectTimeout: Duration.seconds(10),
});

const DrizzleLive = Layer.merge(
	pgDrizzleLayer.pipe(Layer.provide(PgClientLive)),
	PgClientLive,
);

// Combined service layer for all services
const ServicesLive = Layer.mergeAll(
	DashboardService.Default,
	QuestionnaireService.Default,
	ResponseService.Default,
	ProfileService.Default,
).pipe(Layer.provide(DrizzleLive));

describe.skipIf(shouldSkip)("Performance Tests - Real Database", () => {
	// Use it.layer to share the layer across all tests in this describe block
	it.layer(ServicesLive)("Dashboard Service Performance", (it) => {
		it.effect("getSummary should complete under 1000ms", () =>
			Effect.gen(function* () {
				const service = yield* DashboardService;
				yield* timed("Dashboard.getSummary", service.getSummary(), 1000);
			}),
		);

		it.effect("getBreakdown should complete under 1000ms", () =>
			Effect.gen(function* () {
				const service = yield* DashboardService;
				yield* timed("Dashboard.getBreakdown", service.getBreakdown(), 1000);
			}),
		);

		it.effect("getAnalyticsDetails should complete under 1000ms", () =>
			Effect.gen(function* () {
				const service = yield* DashboardService;
				yield* timed(
					"Dashboard.getAnalyticsDetails",
					service.getAnalyticsDetails(),
					1000,
				);
			}),
		);
	});

	it.layer(ServicesLive)("Questionnaire Service Performance", (it) => {
		it.effect("getAll should complete under 300ms", () =>
			Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				yield* timed("Questionnaire.getAll", service.getAll(), 300);
			}),
		);
	});

	it.layer(ServicesLive)("Response Service Performance", (it) => {
		it.effect("getAll should complete under 1000ms", () =>
			Effect.gen(function* () {
				const service = yield* ResponseService;
				yield* timed("Response.getAll", service.getAll(), 1000);
			}),
		);

		it.effect("getAllWithDetails should complete under 2500ms", () =>
			Effect.gen(function* () {
				const service = yield* ResponseService;
				yield* timed(
					"Response.getAllWithDetails",
					service.getAllWithDetails(),
					2500,
				);
			}),
		);
	});

	it.layer(ServicesLive)("Profile Service Performance", (it) => {
		it.effect("getAll should complete under 500ms", () =>
			Effect.gen(function* () {
				const service = yield* ProfileService;
				yield* timed("Profile.getAll", service.getAll(), 500);
			}),
		);

		it.effect("getUniqueClasses should complete under 500ms", () =>
			Effect.gen(function* () {
				const service = yield* ProfileService;
				yield* timed("Profile.getUniqueClasses", service.getUniqueClasses(), 500);
			}),
		);
	});

	it.layer(ServicesLive)("Concurrent Load Test", (it) => {
		it.effect("should handle 10 concurrent dashboard requests", () =>
			Effect.gen(function* () {
				const service = yield* DashboardService;
				const concurrency = 10;

				const start = performance.now();
				const results = yield* Effect.all(
					Arr.replicate(service.getSummary(), concurrency),
					{ concurrency: "unbounded" },
				);
				const totalMs = performance.now() - start;

				console.log(`\n  🔄 Concurrent Load Test (${concurrency} requests)`);
				console.log(`  ⏱️  Total time: ${formatDuration(totalMs)}`);
				console.log(
					`  📊 Avg per request: ${formatDuration(totalMs / concurrency)}`,
				);
				console.log(`  ✅ Success rate: ${results.length}/${concurrency}`);

				expect(results.length).toBe(concurrency);
				expect(totalMs).toBeLessThan(5000);
			}),
		);

		it.effect(
			"should handle 20 sequential requests efficiently",
			() =>
				Effect.gen(function* () {
					const service = yield* QuestionnaireService;
					const iterations = 20;

					const start = performance.now();
					yield* Effect.forEach(
						Arr.range(1, iterations),
						() => service.getAll(),
						{ concurrency: 1 },
					);
					const totalMs = performance.now() - start;
					const avgMs = totalMs / iterations;

					console.log(`\n  🔁 Sequential Load Test (${iterations} requests)`);
					console.log(`  ⏱️  Total time: ${formatDuration(totalMs)}`);
					console.log(`  📊 Avg per request: ${formatDuration(avgMs)}`);
					console.log(`  ✅ Success rate: ${iterations}/${iterations}`);

					expect(avgMs).toBeLessThan(200);
				}),
			{ timeout: 30000 },
		);
	});

	it.layer(ServicesLive)("Full Performance Report", (it) => {
		it.effect(
			"should generate performance report",
			() =>
				Effect.gen(function* () {
					const dashboard = yield* DashboardService;
					const questionnaire = yield* QuestionnaireService;
					const response = yield* ResponseService;
					const profile = yield* ProfileService;

					interface PerfResult {
						name: string;
						duration: number;
						success: boolean;
					}

					const results: PerfResult[] = [];

					const measure = <A, E>(name: string, effect: Effect.Effect<A, E>) =>
						Effect.gen(function* () {
							const start = performance.now();
							yield* effect.pipe(Effect.either);
							const ms = performance.now() - start;
							results.push({ name, duration: ms, success: true });
							return ms;
						});

					// Run all operations
					yield* measure("Dashboard.getSummary", dashboard.getSummary());
					yield* measure("Dashboard.getBreakdown", dashboard.getBreakdown());
					yield* measure(
						"Dashboard.getAnalyticsDetails",
						dashboard.getAnalyticsDetails(),
					);
					yield* measure("Questionnaire.getAll", questionnaire.getAll());
					yield* measure("Response.getAll", response.getAll());
					yield* measure(
						"Response.getAllWithDetails",
						response.getAllWithDetails(),
					);
					yield* measure("Profile.getAll", profile.getAll());
					yield* measure("Profile.getUniqueClasses", profile.getUniqueClasses());

					// Print results
					console.log("\n📊 Performance Results:");
					console.log("─".repeat(60));

					const maxNameLen = Math.max(...results.map((r) => r.name.length));

					for (const result of results) {
						const status = result.success ? "✅" : "❌";
						const name = result.name.padEnd(maxNameLen);
						const duration = formatDuration(result.duration).padStart(10);
						console.log(`${status} ${name} ${duration}`);
					}

					console.log("─".repeat(60));

					const avgDuration =
						results.reduce((acc, r) => acc + r.duration, 0) / results.length;
					const maxDuration = Math.max(...results.map((r) => r.duration));
					const minDuration = Math.min(...results.map((r) => r.duration));

					console.log(
						`📈 Stats: min=${formatDuration(minDuration)}, avg=${formatDuration(avgDuration)}, max=${formatDuration(maxDuration)}`,
					);
					console.log(`✅ Passed: ${results.length}/${results.length}`);

					expect(results.every((r) => r.success)).toBe(true);
				}),
			{ timeout: 30000 },
		);
	});
});
