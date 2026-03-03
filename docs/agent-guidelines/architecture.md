# AGENTS · Architecture & Error Handling

## Platform architecture
- TanStack Start (React + React Router) app with server functions as API boundary.
- Business logic and DB work should live in `src/infrastructure/services/*`.
- Route files remain orchestration + composition roots.
- Data layer is Postgres + Drizzle (`@effect/sql-drizzle/Pg`) with typed schemas in `src/infrastructure/db/schema.ts`.

## Domain & layering rules
- Do not bypass services for DB/file/auth/cookie flows from routes.
- Prefer server functions in `src/apis/*` as single public operations per domain area.
- Keep cross-cutting concerns in `src/infrastructure` (config, runtime, errors, services).
- Keep migration/infra helpers in DB/layer modules, not UI.

## Error model
- Prefer `Schema.TaggedError` for domain failures.
- Keep errors specific (`InvalidCredentialsError`, `SessionExpiredError`, etc.).
- Map low-level exceptions into domain errors early.
- Favor `catchTag` / `catchTags` for branching semantics; avoid broad `catchAll` transformations.

## Auth/security expectations
- Session token source: cookie + `SessionConfig` in `src/infrastructure/config`.
- Mutation endpoints should continue to run CSRF validation (`verifyCsrfOrigin`).
- Auth/login/signup/logout paths should keep rate limiting + session checks and explicit errors.
- Any change to auth/session/cookie policy needs explicit security review.

## Data and services
- Keep service methods pure in intent, deterministic where possible, and strongly typed.
- Keep side effects explicit and testable through Effect composition.
- Avoid returning ad-hoc shape from services; prefer stable typed objects.
- Use index-anchored and selective querying to avoid obvious N+1 query patterns.

## Frontend architecture notes
- Keep route components thin; use hooks for long-lived logic and server functions for data ops.
- Keep validation and transformation close to form boundary; keep UI components presentation-first.

## Runtime/performance expectations
- For heavy endpoints, add/adjust performance tests in `tests/performance`.
- Use `Effect.all` for independent operations; prefer bounded concurrency where useful.

## Python camera bridge boundary
- `server-camera.py` is external integration boundary; keep protocol and file naming contracts stable.
- If bridge behavior changes, update API contracts + docs and migration notes in one change.
