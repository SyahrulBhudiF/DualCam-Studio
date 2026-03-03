# AGENTS · Code Style & Conventions

## Formatting & Linting
- Use **Biome** as canonical style tool: tabs + 1 tab indentation, double quotes, organize imports enabled.
- Keep config files and tooling aligned with `biome.json` and ignore list (`components/ui/**`, `components/data-table/**`, `routeTree.gen.ts`, generated outputs).
- Run lint/format checks for touched files: `bun run lint` / `bun run format` / `bun run check`.

## Imports
- Prefer path alias `@/*` for in-repo imports.
- Use `import type` for type-only imports.
- Preserve deterministic import ordering so `Biome` can sort consistently.

## TypeScript & Effect conventions
- Keep `strict: true` semantics in mind; avoid ad-hoc `any`.
- Favor `Effect`-first designs in services and API layers.
- Use `Effect.Service` for business logic services with `accessors: true`.
- Use `Effect.fn("Service.method")` for all named service functions.
- Prefer `Schema.TaggedError` subclasses for typed failures.
- Prefer explicit return types for non-trivial exported functions.
- Prefer branded IDs (if they cross service boundaries) and avoid raw string misuse in domain models.
- Keep file naming with existing conventions (`kebab-case` for non-component files, PascalCase for components).

## Naming conventions
- **React components**: `PascalCase`.
- **Hooks**: `useXxx`.
- **Server functions**: verb-noun names (`getActiveQuestionnaire`, `submitQuestionnaire`, `getDashboardSummary`).
- **Schema constants**: `...Schema` suffix (e.g., `LoginSchema`, `SubmissionSchema`).

## Effect patterns
- Use `yield*` and `runEffect`/`runEffectExit` at API boundary.
- Do not use `Effect.run*` directly inside routes/APIs for production codepaths.
- Prefer structured logging (`Effect.log`) over `console.log` when adding side-effect logs.
- Avoid `process.env` direct reads; use `Config.*` and exported config helpers.

## Error handling
- Use typed domain errors and transform low-level exceptions at boundary layers.
- Prefer `catchTag`/`catchTags` instead of broad `catchAll`.
- Preserve failure cause for observability where possible.
- Return generic user-facing messages for auth failures where security-sensitive.

## React/Frontend best practices (Vercel / Next-style)
- Keep route components small and data orchestration thin.
- Co-locate interaction handlers with UI where simple; move heavy state/persistence logic into hooks/services.
- Avoid avoidable render waterfalls (`async-parallel` / `async-defer-await` patterns).
- Reduce re-render churn: pass minimal props, memoize derived structures selectively where profiling shows impact.
- Keep client state local when possible; avoid global stores for ephemeral component state.

## Testing style
- Prefer `@effect/vitest` for Effect generators; prefer deterministic tests.
- Mock server/client boundaries explicitly before imports that capture global/runtime state.
- Keep performance tests in `tests/performance/**` with `describe.skipIf(!DATABASE_URL)` guards.

## API/data layer conventions
- Keep route files thin; use `src/apis/*` as boundaries.
- Keep database/file operations in `src/infrastructure/services/*`.
- Keep schema files separated from runtime services.
- Ensure Drizzle schema/types stay source-of-truth for DB names and query mapping.

## Security / operational conventions
- Auth/session/cookie handling files (`src/utils/session.ts`, `src/utils/csrf.ts`, `src/infrastructure/auth*`) need explicit review.
- Validate every mutation input (server-side) and protect mutation routes with CSRF checks.
- Keep rate limiting and session verification close to auth-sensitive handlers.

## Performance-sensitive areas
- Favor bulk queries and avoid N+1 patterns.
- Use `Effect.all` for independent DB operations when parallelizable.

## Python bridge
- Keep `pyproject.toml`, websocket message shape, and `video_uploads` conventions stable unless protocol migration plan is documented.
