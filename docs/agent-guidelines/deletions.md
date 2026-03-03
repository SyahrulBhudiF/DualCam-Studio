# AGENTS · Candidate Instructions to Delete / Clarify

## Remove stale or contradictory guidance
- Replace Supabase references in README and docs where actual runtime now uses Effect + Postgres/Drizzle.
- Remove legacy environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) from docs/examples.

## Clarify instructions that are too broad
- “Run lint before commit” -> keep, but scope to touched files/modules.
- “Use best practices” -> replace with concrete Effect + React + DB conventions above.

## Anti-noise items
- Avoid duplicated generic style guidance in multiple files with conflicting intent.
- Keep docs focused on repository-specific rules, not broad framework advice.
