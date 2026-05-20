# AGENTS · Architecture & Error Handling

## Platform architecture
- TanStack Start / React 19 app with TanStack Router server functions as API boundary.
- Business logic and DB work live in `src/infrastructure/services/*`.
- Route files stay thin: auth/data orchestration, loader wiring, UI composition.
- Data layer is PostgreSQL + Drizzle ORM v1 RC via `drizzle-orm/effect-postgres` and `@effect/sql-pg`.
- Drizzle schemas in `src/infrastructure/db/schema.ts` are the canonical DB shape.

## Effect runtime/layers
- Use Effect v4 beta APIs.
- Provide runtime dependencies through layers in `src/infrastructure/layers/*` and `src/infrastructure/runtime/*`.
- DB runtime must provide both Drizzle DB service and `PgClient` when services need transactions.
- Prefer `Context.Service` + explicit `.layer`/`.asEffect()` patterns over legacy `Effect.Service` accessors.
- Keep env/config parsing in config/layer modules with `Config` / `ConfigProvider`, not scattered `process.env` reads.

## Domain & layering rules
- Do not bypass services for DB/file/auth/cookie flows from routes.
- Prefer server functions in `src/apis/*` as public operations per domain area.
- Keep cross-cutting concerns in `src/infrastructure` (config, runtime, errors, services, schemas).
- Keep migration/infra helpers in DB/layer modules, not UI.

## Error model
- Prefer `Schema.TaggedErrorClass` for Effect v4 domain failures.
- Keep errors specific (`InvalidCredentialsError`, `SessionExpiredError`, etc.).
- Map low-level exceptions into domain errors early.
- Favor `catchTag` / `catchTags` for branching semantics; avoid broad `catchAll` unless preserving cause and mapping intentionally.
- Preserve failure causes for logs/observability; expose safe user-facing messages at API/UI boundary.

## Auth/security expectations
- Session token source: cookie + `SessionConfig` in `src/infrastructure/config`.
- Mutation endpoints must keep CSRF validation (`verifyCsrfOrigin`).
- Auth/login/signup/logout paths must keep rate limiting, session checks, and explicit typed errors.
- Any auth/session/cookie policy change needs explicit security review summary.

## Data and services
- Keep service methods pure in intent, deterministic where possible, and strongly typed.
- Keep side effects explicit and testable through Effect composition.
- Avoid returning ad-hoc service shapes; prefer stable typed objects.
- Use selective/index-aware querying and bulk operations to avoid obvious N+1 patterns.
- Keep Drizzle raw date/time OID parser behavior documented if touched; it lets Drizzle map schema metadata instead of pg pre-parsing.

## Frontend architecture notes
- Keep route components thin; use hooks for durable UI logic and server functions for data operations.
- Keep validation/transformation close to form boundaries.
- Use TanStack Form for auth/admin forms when form state/validation is non-trivial.
- Keep shadcn/Radix component behavior default unless there is a clear UX reason.

## Runtime/performance expectations
- Use `Effect.all` for independent operations; prefer bounded concurrency where useful.
- Dashboard/admin query changes should consider perf tests in `tests/performance`, gated by env.
- Do not use Recharts container workarounds that rely on mount flags; prefer stable layout/Suspense or non-chart fallback UI.

## Python camera bridge boundary
- `server-camera.py` is an external integration boundary; keep protocol and file naming contracts stable.
- If bridge behavior changes, update API contracts + docs in the same change.
