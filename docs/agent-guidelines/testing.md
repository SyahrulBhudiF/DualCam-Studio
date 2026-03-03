# AGENTS · Testing Guidelines

## Scope
- `tests/**/*.test.ts` and `tests/**/*.spec.ts` are the official test suites.
- `tests/performance` are optional DB-backed/perf tests.

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
- Coverage config in `vitest.config.ts` using `v8` provider.
- DB/perf tests should respect environment gating (`describe.skipIf` style) and `DATABASE_URL` availability.

## Mocks and boundaries
- Mock server-side globals before imports that read env or request context.
- Use `vi.stubEnv(...)` before modules that depend on env.
- Reset modules after env changes to avoid cross-test pollution.

## Auth/session tests
- Test both happy path and failure branches of `extractErrorMessage`, session token set/clear, and env-derived config values.
- Keep sensitive values out of logs in tests.

## Before merge checklist
1. Run relevant unit/feature tests for modified area.
2. Run `bun run test:run <specific-file>` for changed modules.
3. Run `bun run test:perf` if dashboard/admin query logic is modified.
