# AGENTS · Code Style & Conventions

## Formatting & linting
- Biome is canonical: tabs, double quotes, organized imports.
- Keep config/tooling aligned with `biome.json`.
- Run `bun run lint` for validation unless user explicitly asks for broader checks.
- Do not run `bun run build` unless explicitly requested.

## Imports
- Prefer `@/*` for in-repo imports.
- Use `import type` for type-only imports.
- Preserve deterministic import ordering so Biome can sort consistently.

## TypeScript & Effect conventions
- Keep strict TypeScript semantics; avoid ad-hoc `any`.
- Favor Effect-first designs in services and API layers.
- Use Effect v4 beta patterns:
  - `Context.Service` for services.
  - explicit `.layer` exports for live layers.
  - `Service.asEffect()` when accessing a service in generators.
  - `Schema.TaggedErrorClass` for typed failures.
  - `Effect.result` / `Result` helpers instead of older `Effect.either` conventions.
  - `Effect.forkDetach` only for daemon-like work that should outlive request scope.
- Use named Effect functions (`Effect.fn`) for non-trivial service operations where it improves tracing/readability.
- Prefer explicit return types for non-trivial exported functions.
- Prefer branded/domain IDs when IDs cross service boundaries.

## Config/env
- Avoid direct `process.env` reads in domain code.
- Use `Config`, `ConfigProvider`, and exported config descriptors/helpers.
- Keep defaults for session cookie name and session duration unless intentionally changing auth policy.

## Naming conventions
- React components: `PascalCase`.
- Hooks: `useXxx`.
- Server functions: verb-noun names (`getActiveQuestionnaire`, `submitQuestionnaire`, `getDashboardSummary`).
- Schema constants: `...Schema` or domain-specific PascalCase schema names.
- File names: existing conventions (`kebab-case` for non-component files, PascalCase for components).

## Error handling
- Use typed domain errors and transform low-level exceptions at boundary layers.
- Prefer `catchTag` / `catchTags` instead of broad `catchAll`.
- Preserve failure cause for observability where possible.
- Return generic user-facing messages for auth failures where security-sensitive.

## React/frontend practices
- Keep route components small and data orchestration thin.
- Use TanStack Query loader `ensureQueryData` when SSR output must match hydrated client output.
- Avoid `isMounted` hydration workarounds.
- Use Suspense/lazy boundaries for expensive dashboard tab content when useful.
- Keep client state local when possible; avoid global stores for ephemeral component state.
- Use Sonner for user-visible async auth/form feedback when already mounted globally.

## UI/theme conventions
- Prefer theme tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `text-destructive`, `border-border`, `bg-card`) over hardcoded zinc/red/green/blue classes.
- Do not broadly redesign theme tokens unless requested.
- Preserve shadcn/Radix primitives and default behavior unless the task explicitly asks for a custom interaction.
- Avoid mass automated class removals without manual diff review.

## Testing style
- Prefer `@effect/vitest` for Effect generators; keep tests deterministic.
- Mock server/client boundaries before imports that capture global/runtime state.
- Keep performance tests in `tests/performance/**` and gated by env such as `RUN_PERF_TESTS` / `DATABASE_URL`.

## API/data layer conventions
- Keep route files thin; use `src/apis/*` as server boundaries.
- Keep database/file operations in `src/infrastructure/services/*`.
- Keep schema files separated from runtime services.
- Ensure Drizzle schema/types stay source-of-truth for DB names and query mapping.

## Security / operational conventions
- Auth/session/cookie handling files (`src/utils/session.ts`, `src/utils/csrf.ts`, auth services) need explicit review.
- Validate every mutation input server-side and protect mutation routes with CSRF checks.
- Keep rate limiting and session verification close to auth-sensitive handlers.

## Python bridge
- Keep `pyproject.toml`, websocket message shape, and `video_uploads` conventions stable unless protocol migration is documented.
