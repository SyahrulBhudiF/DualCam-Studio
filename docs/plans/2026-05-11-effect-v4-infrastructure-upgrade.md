# Effect v4 Infrastructure Upgrade Implementation Plan

> **IMPORTANT**: Use plan-execute skill to implement this plan task-by-task.

**Goal:** Upgrade `src/infrastructure` from Effect v3 to a pinned Effect v4 beta without leaving mixed runtime/service/schema APIs.
**Architecture:** Spike the core runtime + SQL layer + one service first, then bulk-apply proven patterns. Replace generated `Effect.Service` defaults/accessors with explicit v4 service layers, preserve schema-backed errors, and validate DB transactions/runtime lifecycle.
**Tech Stack:** Bun, TypeScript strict, TanStack Start, Effect v4 beta, Effect SQL/Drizzle/Pg, Effect Schema.

---

## Research Basis

- Scout output: `/tmp/pi-subagents-uid-1000/chain-runs/60ccf9a0/context.md`
- Research output: `/tmp/pi-subagents-uid-1000/chain-runs/60ccf9a0/research.md`
- Draft plan output: `/tmp/pi-subagents-uid-1000/chain-runs/60ccf9a0/plan.md`
- Local rule: `/effect-best-practices`

Key findings:

- v4 beta APIs churn. Pin exact versions, no ranges.
- v4 unifies Effect ecosystem package versions.
- `Effect.Service` → `ServiceMap.Service`.
- `.Default`, `accessors`, `dependencies` go away; define explicit `static readonly layer`.
- `Schema.TaggedError` → `Schema.TaggedErrorClass`.
- Some Schema constructors change: UUID, Record, Union, Literal(s), decode helpers.
- `Effect.fork` renamed; choose `forkChild` vs `forkDetach` deliberately.
- SQL/Drizzle transaction propagation is unconfirmed. Must smoke-test.

## Current Infrastructure Map

Core files:

- `src/infrastructure/runtime/index.ts` — app runtime, `ManagedRuntime.make`, `runEffect`, `runEffectExit`, manual service union.
- `src/infrastructure/layers/database.ts` — Pg client + Drizzle live layer.
- `src/infrastructure/services/index.ts` — merges service `.Default` layers + Node filesystem layer.
- `src/infrastructure/config/index.ts` — Effect `Config` descriptors.
- `src/infrastructure/errors/*.ts` — `Schema.TaggedError` errors.
- `src/infrastructure/schemas/*.ts` — Effect Schema validators.
- `src/apis/**/*.ts` — server functions call `runEffect` / `runEffectExit`, use Schema decoders as validators.

Service files:

- `answer.ts`
- `question.ts`
- `profile.ts`
- `questionnaire.ts`
- `response.ts`
- `dashboard.ts`
- `auth.ts`
- `rate-limit.ts`
- `file-upload.ts`

Hotspots:

- `Effect.Service<This>()(... { accessors: true, dependencies: [], effect })`
- `.Default` layer aggregation
- `PgClient.layerConfig`, `PgClient.PgClient`, old `@effect/sql-drizzle/Pg` imports
- Drizzle v1 Effect PostgreSQL API from `drizzle-orm/effect-postgres`
- `PgClient.withTransaction` + Drizzle Effect connection propagation
- `Schema.decodeUnknownSync` in TanStack validators
- `Effect.fork` in auth/rate-limit cleanup
- Runtime lifecycle/disposal under TanStack Start dev/HMR

## Phase 0 — Safety

1. Run `jj status`.
2. Record unrelated changes; do not touch them.
3. Do not format broad files.
4. Do not leave mixed v3/v4 dependency state.
5. If blocked by SQL/runtime API churn, revert dependency + code changes together.

Acceptance:

- Worktree baseline known.
- Migration files scoped.

## Phase 1 — Dependency Pin

1. Edit `package.json`.
2. Replace Effect ecosystem versions as one exact pinned v4 beta set:
   - `effect`
   - `@effect/platform`
   - `@effect/platform-node`
   - `@effect/sql`
   - `@effect/sql-pg`
   - remove `@effect/sql-drizzle` if Drizzle v1 native `drizzle-orm/effect-postgres` fully replaces it
   - `@effect/vitest` if still used/compatible
3. Use exact versions, no `^`, no `~`.
4. Run `bun install`.
5. Inspect `bun.lock` drift.

Acceptance:

- Package graph upgraded together.
- Lockfile only reflects expected Effect ecosystem changes.

## Phase 2 — Compile Spike: SQL Layer

File: `src/infrastructure/layers/database.ts`

Reference: <https://orm.drizzle.team/docs/connect-effect-postgres>

Tasks:

1. Prefer Drizzle v1 native Effect PostgreSQL API over old `@effect/sql-drizzle/Pg`.
2. Import Drizzle from `drizzle-orm/effect-postgres`.
3. Create `PgClientLive` with `PgClient.layer(...)` from `@effect/sql-pg`.
4. Configure pg type parsers like Drizzle docs so date/time values stay raw for Drizzle:
   - type IDs: `1184, 1114, 1082, 1186, 1231, 1115, 1185, 1187, 1182`
   - fallback to `pg` `types.getTypeParser(typeId, format)`
5. Build DB effect with `PgDrizzle.make({ schema, relations? })` or `makeWithDefaults()` if no schema object is needed.
6. Provide `PgDrizzle.DefaultServices` to the DB effect.
7. Expose one app DB service/layer, e.g. `DBLive`, instead of relying on `@effect/sql-drizzle/Pg`'s `PgDrizzle` tag.
8. Compose DB layer with `PgClientLive` using `Layer.provideMerge` / v4 equivalent.
9. Remove old `@effect/sql-drizzle/Pg` imports and dependency if no longer used.
10. Remove unused `Redacted` import and stray semicolon.
11. Run `bun run build`.

Acceptance:

- File compiles or errors are limited to next migration layer.
- `DrizzleLive`/new DB live layer can be constructed with `DATABASE_URL`.
- No `@effect/sql-drizzle/Pg` import remains if native Drizzle Effect API works.

## Phase 3 — Compile Spike: One Service

File: `src/infrastructure/services/answer.ts`

Rewrite pattern:

```ts
import { Effect, Layer, ServiceMap } from "effect"

export class AnswerService extends ServiceMap.Service<AnswerService>()("AnswerService", {
  make: Effect.gen(function* () {
    const db = yield* DB

    const list = Effect.fn("AnswerService.list")(function* () {
      // existing body
    })

    return { list }
  }),
}) {
  static readonly layer = Layer.effect(this, this.make)
}
```

Tasks:

1. Replace `Effect.Service` with `ServiceMap.Service`.
2. Remove `accessors`, `dependencies`, `effect` keys.
3. Add `static readonly layer`.
4. Keep existing `Effect.fn` method bodies.
5. Replace `yield* PgDrizzle` with the new DB service from Phase 2.
6. Run `bun run build`.

Acceptance:

- `AnswerService` compiles under v4 shape.
- No static generated accessor use introduced.

## Phase 4 — Compile Spike: Service Aggregation

File: `src/infrastructure/services/index.ts`

Tasks:

1. Replace `AnswerService.Default` with `AnswerService.layer`.
2. If compiler forbids mixing `.Default` and `.layer`, migrate all service class headers before this phase completes.
3. Update `NodeFileSystem.layer` import/path if changed.
4. Run `bun run build`.

Acceptance:

- Aggregation works with explicit service layers.
- Pattern is proven for bulk migration.

## Phase 5 — Compile Spike: Runtime

File: `src/infrastructure/runtime/index.ts`

Tasks:

1. Verify whether v4 still supports `ManagedRuntime.make(AppLayer)`.
2. If not, switch to v4-supported service-map runtime API.
3. Remove or reduce stale manual `ServiceUnion` if inference is possible.
4. Keep API shape:
   - `runEffect(effect): Promise<A>`
   - `runEffectExit(effect): Promise<Exit.Exit<A, E>>`
5. Preserve equivalent composition: all services provided with the new Drizzle Effect DB layer + `PgClientLive`.
6. Run `bun run build`.

Acceptance:

- API programs can still yield service classes and call `runEffect`.
- Runtime layer compiles.

## Phase 6 — Bulk Service Migration

Files:

- `src/infrastructure/services/question.ts`
- `src/infrastructure/services/profile.ts`
- `src/infrastructure/services/dashboard.ts`
- `src/infrastructure/services/response.ts`
- `src/infrastructure/services/questionnaire.ts`
- `src/infrastructure/services/auth.ts`
- `src/infrastructure/services/rate-limit.ts`
- `src/infrastructure/services/file-upload.ts`

Tasks per file:

1. Apply proven `ServiceMap.Service` pattern.
2. Add `Layer`/`ServiceMap` imports.
3. Remove `Effect.Service`, `accessors`, `dependencies`, `effect`.
4. Add `static readonly layer`.
5. Keep `Effect.fn("Service.method")`.
6. Keep domain logic unchanged.
7. Run `bun run build` after 2–3 files, not after all.

Acceptance:

- All services compile.
- `grep -R "Effect.Service\|\.Default\|accessors:" src/infrastructure/services` returns no service migration leftovers.

## Phase 7 — Transactions

File: `src/infrastructure/services/questionnaire.ts`

Tasks:

1. Update `PgClient` import/tag usage.
2. Keep `sql.withTransaction(...)` body initially.
3. Verify Drizzle Effect queries participate in `PgClient` transaction context with the new `drizzle-orm/effect-postgres` setup.
4. Run manual rollback smoke:
   - start transaction
   - insert questionnaire + children
   - fail intentionally
   - verify no partial rows remain

Acceptance:

- Transaction compile passes.
- Rollback verified against dev/test DB.

## Phase 8 — Fork Semantics

Files:

- `src/infrastructure/services/auth.ts`
- `src/apis/user.ts`

Tasks:

1. Replace `Effect.fork(...)` with one v4 API:
   - `forkDetach` if cleanup should outlive request fiber
   - `forkChild` if cleanup should be tied to request fiber
2. Use same semantic choice for:
   - `deleteExpiredSessions()`
   - `rateLimiter.cleanup()`
3. Add a short comment only if choice is non-obvious.

Acceptance:

- No `Effect.fork(` remains.
- Cleanup behavior intentionally chosen.

## Phase 9 — Error Schema Migration

Files:

- `src/infrastructure/errors/auth.ts`
- `src/infrastructure/errors/database.ts`
- `src/infrastructure/errors/file.ts`
- `src/infrastructure/errors/not-found.ts`
- `src/infrastructure/errors/validation.ts`

Tasks:

1. Replace `Schema.TaggedError<T>()` with `Schema.TaggedErrorClass<T>()`.
2. Preserve explicit `_tag` names.
3. Preserve `message` fields.
4. Keep caught unknown `cause` as `Schema.Unknown`; do not use `Schema.Defect` for routine DB/FS/bcrypt failures.
5. Run `bun run build`.

Acceptance:

- `grep -R "Schema.TaggedError" src/infrastructure/errors` returns none.
- Existing `new ErrorClass({ ... })` construction compiles.

## Phase 10 — Schema Constructors + Validators

Files:

- `src/infrastructure/schemas/questionnaire.ts`
- `src/infrastructure/schemas/auth.ts`
- `src/apis/user.ts`
- `src/apis/segmented-upload.ts`
- `src/apis/questionnaire.ts`
- `src/apis/admin/questionnaires.ts`
- `src/apis/admin/responses.ts`

Tasks:

1. Replace v3-only constructors:
   - `Schema.UUID` → v4 UUID equivalent, likely `Schema.String.check(Schema.isUUID())`
   - `Schema.Record({ key, value })` → `Schema.Record(key, value)`
   - `Schema.Union(A, B)` → `Schema.Union([A, B])`
   - `Schema.Literal("a", "b")` → `Schema.Literals(["a", "b"])`
2. Verify `Schema.mutable(...)` support.
3. Verify `Schema.decodeUnknownSync` still fits TanStack `inputValidator`.
4. If direct decode no longer fits, add `src/infrastructure/schemas/validator.ts` with one helper.
5. Replace direct validator calls only if helper is required.

Acceptance:

- All schemas compile.
- Invalid input still rejects before handler.
- No helper added unless necessary.

## Phase 11 — Broad Combinator Audit

Run searches:

```sh
grep -R "catchAll\|catchSome\|catchAllCause\|Effect.fork(" src
```

Tasks:

1. `Effect.catchAll` → `Effect.catch`.
2. `catchAllCause` → `catchCause`.
3. `catchSome` → `catchFilter`.
4. Prefer `catchTag` / `catchTags` for tagged errors.
5. Do not replace specific handling with broad catches.

Acceptance:

- Search returns no stale v3 combinators.
- Error specificity preserved.

## Phase 12 — Barrels + Cleanup

Files:

- `src/infrastructure/index.ts`
- touched service/schema/runtime files

Tasks:

1. Remove stray semicolon in infrastructure barrel.
2. Remove unused imports caused by migration.
3. Do not add compatibility reexports.
4. Do not add legacy shims.

Acceptance:

- Imports clean.
- No convenience wrappers added.

## Phase 13 — Validation

Commands:

```sh
bun run build
bun run check
bun run test:run
```

If needed:

```sh
bun run check:fix
bun run build
bun run check
bun run test:run
```

Test scope:

1. Run existing unit tests under `tests/`.
2. Add/adjust unit tests only where behavior changed and TypeScript cannot guarantee it.
3. Run/add integration coverage for runtime DB layer construction, service calls, auth/session, validator adapter, and transaction rollback.
4. Run/add e2e coverage for signup/login, admin questionnaire CRUD, public questionnaire submit, response/dashboard read, and segmented upload finalization.

Runtime smoke checks with `DATABASE_URL` set:

1. Signup/login/session path.
2. Admin questionnaire CRUD.
3. Public questionnaire submit.
4. Dashboard/response reads.
5. Segmented upload finalization.
6. File write/delete path.
7. Transaction rollback smoke.
8. Dev reload/HMR checks for duplicate SQL pools.

Acceptance:

- Build passes.
- Check passes.
- Unit tests pass.
- Integration tests pass.
- E2E tests pass or documented manual e2e smoke passes if no automated e2e harness exists.
- Runtime smoke passes.
- Transaction rollback verified.

## Risks

- v4 beta churn may invalidate researched names.
- SQL/Drizzle v4 API and transactions are least certain.
- Runtime disposal under TanStack Start may need framework-specific hook.
- Schema validator sync/async behavior may affect TanStack server functions.
- Fork semantics are behavior decisions, not mechanical rename.
- Bulk service migration touches many files; watch parallel changes.

## Rollback Rule

If v4 SQL/runtime cannot be made to compile or preserve transaction behavior:

1. Revert `package.json` and `bun.lock`.
2. Revert all v4 code edits.
3. Restore pre-migration build.
4. Open a blocker note with exact failing package/API.

## Resolved Decisions / Clarifications

1. Exact Effect v4 beta: user approved choosing/pinning one exact current beta package set during implementation.
2. `forkChild` vs `forkDetach`: `forkChild` = background work tied to parent request/scope and interrupted with it. `forkDetach` = daemon-like work continues outside request until runtime shutdown. For cleanup jobs in login/auth, prefer `forkDetach` only if cleanup must continue after response; otherwise `forkChild`.
3. Runtime disposal hook: means closing Effect runtime/layer scope when TanStack server shuts down/HMR reloads, so SQL pool finalizers close DB connections. Research needed during implementation against exact TanStack Start lifecycle.
4. Error `cause` fields: keep `Schema.Unknown` for routine caught DB/FS/bcrypt/etc causes. Use `Schema.Defect` only for actual defect/Cause/Exit serialization, not normal recoverable tagged errors.
5. TanStack `inputValidator`: source awaits validators, so async works in current Start, but prefer sync `Schema.decodeUnknownSync` for pure request schemas. Add a tiny sync adapter; only use async `Effect.runPromise(Schema.decodeUnknown(...))` if a schema truly needs effectful validation.

## Next Concrete Steps

1. Run `jj status` and note unrelated files.
2. Choose and pin exact current Effect v4 beta package versions in `package.json`.
3. Run `bun install`.
4. Spike `database.ts`, `answer.ts`, `services/index.ts`, `runtime/index.ts`.
5. Run `bun run build` and adapt the proven pattern.
6. Bulk-migrate remaining services.
7. Migrate errors using `TaggedErrorClass` + `Schema.Unknown` causes.
8. Add/keep sync schema validator adapter for `createServerFn.inputValidator`.
9. Decide `forkChild` vs `forkDetach` at the cleanup call sites.
10. Run `bun run build` and `bun run check`.
11. Run DB/auth/upload/transaction/manual smokes.
