# AGENTS · Candidate Instructions to Delete / Clarify

## Already clarified
- Supabase setup is stale. Current runtime uses PostgreSQL + Drizzle + Effect; docs should reference `DATABASE_URL`.
- Legacy `@effect/sql-drizzle` guidance is stale. Current runtime uses `drizzle-orm/effect-postgres` + `@effect/sql-pg`.
- Broad “run build before merge” guidance conflicts with current workflow. Prefer `bun run lint`; build only when explicitly requested.

## Remove stale or contradictory guidance
- Remove legacy environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) from docs/examples.
- Remove references to `supabase.ts` as runtime auth/data source.
- Remove Effect v3 service snippets (`Effect.Service`, `Schema.TaggedError`) when documenting new work; use current v4 beta patterns.
- Remove tracked local planning artifacts under `docs/plans/`; this directory is ignored.

## Clarify instructions that are too broad
- “Run lint before commit” -> keep as `bun run lint`, with note that existing warnings may be unrelated.
- “Use best practices” -> replace with concrete Effect v4 + React + DB conventions.
- “Update docs” -> specify README, `.env.example`, and agent guidelines when env/scripts/runtime architecture changes.

## Anti-noise items
- Avoid duplicated generic style guidance in multiple files with conflicting intent.
- Keep docs focused on repository-specific rules, not broad framework advice.
- Avoid compatibility wrappers, legacy shims, and convenience reexports unless explicitly requested.
