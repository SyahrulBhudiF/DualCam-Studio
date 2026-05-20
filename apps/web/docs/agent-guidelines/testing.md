# AGENTS · Testing Guidelines

## Scope
- `tests/**/*.test.ts` and `tests/**/*.spec.ts` are official test suites.
- `tests/performance/**` contains optional DB-backed/performance tests.

## Core commands
- `bun run test` (watch)
- `bun run test:run` (single-run)
- `bun run test:coverage`
- `bun run test:perf`

## Single test patterns
- Single file: `bun run test tests/utils/session.test.ts`
- Single file (CI-style): `bun run test:run tests/utils/session.test.ts`
- By name: `bun run test:run -- -t "should return token when session cookie exists"`
- Single perf target: `bun run test:run tests/performance/database.perf.test.ts`

## Coverage & config
- Coverage config lives in `vitest.config.ts` using the `v8` provider.
- DB/perf tests should respect environment gating (`RUN_PERF_TESTS`, `DATABASE_URL`, or `describe.skipIf`).
- Do not make local DB availability mandatory for normal unit tests.

## Effect tests
- Prefer `@effect/vitest` for Effect generator tests.
- Mock Effect services/layers at the boundary under test.
- For infra service tests, mock the `DB` service rather than opening a real pool unless the test is explicitly integration/perf.
- Use deterministic clocks/tokens where possible.

## Mocks and boundaries
- Mock server-side globals before imports that read env, cookies, request headers, or runtime state.
- Use `vi.stubEnv(...)` before importing modules that parse env/config.
- Reset modules after env changes to avoid cross-test pollution.

## Auth/session tests
- Test happy paths and failure branches of `extractErrorMessage`, session token set/clear, env-derived config, and invalid auth.
- Keep sensitive values out of logs.
- Preserve generic user-facing auth errors unless testing an internal typed error.

## Frontend/manual validation
- Use `agent-browser` for browser-observed regressions: login submit, CSS loading, hydration mismatch, dashboard/responses UI, and form behavior.
- Prefer checking browser console plus computed styles/network behavior over guessing from code.

## Before merge checklist
1. Run `bun run lint`.
2. Run targeted tests for changed modules when relevant.
3. Run perf/integration tests only when DB/query behavior changed and env is available.
4. Do not run `bun run build` unless user requests it.
