# AGENTS · Git & Operational Workflow

## Before editing
1. Confirm scope (routes/APIs/services/DB/React).
2. Reuse existing abstractions; avoid adding duplicate infrastructure.
3. Check README/AGENTS/docs consistency if behavior changes (env, auth, scripts, schema).

## During implementation
- Keep diffs scoped and small.
- Avoid touching generated files (`routeTree.gen.ts`) unless absolutely necessary.
- Run relevant checks after changes:
  - `bun run lint`
  - `bun run check` or `bun run format`

## Validation before handoff
- Run targeted tests for touched module.
- Run at least one build-target check if shared runtime/service layer changes:
  - `bun run build`

## Delivery / PR notes
- Include changed test commands and test names.
- State any temporary deviations and why (if any).
- Mention security implications for auth/session/file uploads.

## Review checklist
- Ensure imports use alias and typed patterns.
- Validate error types remain specific and consistent.
- Confirm no behavior changes in auth/session without review summary.
- Confirm DB contract changes are reflected in docs.
