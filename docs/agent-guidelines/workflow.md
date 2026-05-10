# AGENTS · Git/JJ & Operational Workflow

## Version control
- Use **jj (Jujutsu)** for this repo workflow.
- `@` is the working-copy commit; `@-` is its parent.
- Prefer `jj status`, `jj diff`, `jj log`, `jj describe`, `jj bookmark set`, and `jj git push`.
- Do not use git commands unless explicitly needed for Git interop.

## Before editing
1. Confirm scope (routes/APIs/services/DB/React/docs).
2. Reuse existing abstractions; avoid duplicate infrastructure.
3. Check README/AGENTS/docs consistency if behavior changes (env, auth, scripts, schema, runtime).
4. Expect parallel changes in unrelated files; keep edits scoped.

## During implementation
- Keep diffs scoped and small.
- Avoid touching generated files (`routeTree.gen.ts`) unless absolutely necessary.
- Use fff MCP tools for file search.
- Use `read` for file contents, `edit` for precise edits, `write` for full rewrites/new files.
- Do not commit automatically unless user asks.

## Validation before handoff
- Preferred baseline: `bun run lint`.
- Run targeted tests for changed modules when relevant.
- Do not run `bun run build` unless explicitly requested.
- For UI/CSS/hydration/browser issues, use `agent-browser` if requested or useful.

## Commit / push
- With jj, describing `@` is the commit message:
  - `jj describe -m "message"`
- Move the branch/bookmark deliberately:
  - `jj bookmark set <bookmark> -r @`
- Push:
  - `jj git push --bookmark <bookmark>`
- If user asks to commit, include all current intended working-copy changes only after checking `jj status`.

## Delivery / PR notes
- State what changed.
- Include validation commands and whether failures are pre-existing.
- Mention security implications for auth/session/file uploads.
- Mention branch/bookmark and pushed commit id when pushing.

## Review checklist
- Ensure imports use alias/type-only patterns.
- Validate Effect errors remain typed and specific.
- Confirm no auth/session behavior changes without review summary.
- Confirm DB contract changes are reflected in docs and `.env.example` if needed.
- Confirm docs do not reference stale Supabase or `@effect/sql-drizzle` runtime guidance.
