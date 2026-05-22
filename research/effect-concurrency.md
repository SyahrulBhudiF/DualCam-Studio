# Research: Effect-TS concurrency/fork patterns for browser/frontend async queues

## Summary
Effect is suitable for frontend async queues when treated as an edge-managed runtime: model work as lazy `Effect`s, run at React/TanStack boundaries with `runPromise`/`runFork`, and tie long-lived fibers/queues to React cleanup or `Scope`. Prefer bounded/sliding queues plus explicit concurrency limits; avoid daemon/global fibers and unbounded queues in browser UI unless lifetime and memory are intentionally global.

## Findings
1. **Use `Effect.runPromise` at Promise API boundaries; use `runFork` only when you need a cancelable fiber handle.** `runPromise` executes an effect and resolves/rejects a JavaScript `Promise`, intended for compatibility with promise-based code; docs say run functions should be used at the outer edges. `runFork` returns a runtime fiber that can be observed/interrupted, useful for background loops or queue workers. [Running Effects](https://effect.website/docs/getting-started/running-effects/)

2. **TanStack Query integration should pass TanStack’s `signal` to `Effect.runPromise`.** TanStack Query gives each query function an `AbortSignal`; if consumed, cancellation aborts the underlying promise and reverts query state. Effect `runPromise` accepts `{ signal?: AbortSignal }`, and Effect’s change log states aborting the signal interrupts effect execution. Pattern: `queryFn: ({ signal }) => Effect.runPromise(program, { signal })`. [TanStack Query cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation), [Effect Runtime API](https://effect-ts.github.io/effect/effect/Runtime.ts.html), [Effect commit adding runPromise AbortSignal](https://github.com/Effect-TS/effect/commit/817a04cb2df0f4140984dc97eb3e1bb14a6c4a38)

3. **Wrap browser async APIs with `Effect.tryPromise`/`Effect.async` using `AbortSignal` so interruption reaches `fetch`, timers, XHR, etc.** `Effect.tryPromise` is for promises that may reject; `Effect.async` supports a `signal` parameter and/or interruption cleanup effect. Without wiring abort/cleanup, interrupting the Effect fiber may stop Effect continuation but not necessarily stop the underlying browser operation. [Creating Effects](https://effect.website/docs/getting-started/creating-effects/)

4. **`Effect.fork` gives structured concurrency: child fiber lifetime is tied to parent.** The docs state ordinary `Effect.fork` automatically supervises child fibers; child fibers terminate when parent terminates. This is good inside a request/workflow, but a fork created inside a short-lived effect may die when its parent completes. For long-lived workers, use `forkScoped`/`forkIn` tied to an explicit scope, not `forkDaemon` in UI code. [Fibers](https://effect.website/docs/concurrency/fibers/)

5. **Avoid `forkDaemon` for React component or page-local workers.** `forkDaemon` creates a global-scope fiber that continues after the parent completes or is interrupted; docs show it keeps logging indefinitely. In a React app this is a leak risk across unmounts, route changes, hot reload, or Strict Mode remounts. [Fibers](https://effect.website/docs/concurrency/fibers/), [React useEffect](https://react.dev/reference/react/useEffect)

6. **Use `Scope` to bind queue workers/resources to component/app lifetimes.** `Scope` manages resource lifetime and runs finalizers on close; `Effect.scoped` creates/closes a scope automatically. For queue workers, create queue + fork workers in a scope and close/interrupt on cleanup. Note: closing a scope alone does not interrupt arbitrary pending tasks unless they are scoped resources/fibers; use `forkScoped` or finalizers like `Queue.shutdown`/`Fiber.interrupt`. [Scope](https://effect.website/docs/resource-management/scope/), [Fibers](https://effect.website/docs/concurrency/fibers/)

7. **For frontend queues, prefer bounded/sliding/dropping queues over unbounded.** Effect `Queue` supports bounded, dropping, sliding, and unbounded queues. Bounded queues provide back-pressure: `Queue.offer` suspends when full. Sliding queues discard old values for new ones; dropping queues discard new values when full. In UI, sliding is often right for latest-only events (search input, autosave state), bounded for reliable work, dropping for telemetry/noisy events. [Queue](https://effect.website/docs/concurrency/queue/)

8. **Remember queue operations suspend.** `Queue.offer` on a full bounded queue and `Queue.take` on an empty queue suspend. That is fine inside fibers, but do not await a never-unblocked `offer`/`take` from a React event handler via `runPromise` without cancellation/backpressure strategy. If you need non-blocking behavior, use `Queue.poll`, `takeUpTo`, dropping/sliding queues, or fork the blocking operation. [Queue](https://effect.website/docs/concurrency/queue/)

9. **Use `Queue.shutdown` during teardown.** `Queue.shutdown` interrupts fibers suspended on `offer*` or `take*`, empties the queue, and makes future queue operations terminate immediately. This is an important finalizer for component/page-local queue workers. [Queue](https://effect.website/docs/concurrency/queue/)

10. **Use built-in concurrency options before manual worker pools when possible.** `Effect.all` / `Effect.forEach` concurrency accepts a number, `"unbounded"`, or `"inherit"`; default is sequential. Numeric limits prevent resource exhaustion and map naturally to browser/API rate limits. `Effect.withConcurrency` can set inherited concurrency for nested operations. [Basic Concurrency](https://effect.website/docs/concurrency/basic-concurrency/)

11. **Interruption is cooperative at Effect boundaries and finalizers run.** Fibers can be interrupted; `Fiber.interrupt` waits until the fiber terminates and safely runs finalizers. Concurrent combinators propagate interruption: if one `Effect.forEach` child is interrupted, concurrent effects are interrupted too. Use `Effect.onInterrupt`/finalizers for cleanup and avoid assuming partial work completed. [Fibers](https://effect.website/docs/concurrency/fibers/), [Basic Concurrency](https://effect.website/docs/concurrency/basic-concurrency/)

12. **React cleanup must mirror setup.** React runs cleanup before dependency changes and on unmount; Strict Mode runs an extra development-only setup+cleanup cycle. Any `runFork`, queue worker, subscription, or manual scope created in `useEffect` must be interrupted/closed in cleanup. Do not start fibers during render. [React useEffect](https://react.dev/reference/react/useEffect)

13. **Forked fibers may not start immediately.** Effect docs note forked fibers begin after the current fiber completes or yields; a forked stream/subscription can miss immediate updates unless the current fiber yields (`Effect.yieldNow`/small sleep) or setup is ordered differently. This matters for browser event streams/subscription refs. [Fibers](https://effect.website/docs/concurrency/fibers/)

14. **Race/timeout patterns interrupt losers, but may wait for cleanup.** Effect races interrupt losing effects; `raceFirst` does not resume until loser terminates cleanly. `Effect.disconnect` can return quicker while termination happens in background, but use carefully in UI because cleanup continues after caller proceeds. [Basic Concurrency](https://effect.website/docs/concurrency/basic-concurrency/)

## Guidance for React/TanStack app
- **TanStack query:** `queryFn: ({ signal }) => Effect.runPromise(effect, { signal })`; inside effect, use `Effect.tryPromise({ try: signal => fetch(url, { signal }), catch })` or equivalent so cancellation propagates to `fetch`.
- **Component-local queue:** create queue/workers inside a `useEffect` or custom hook, run a scoped program with `runFork`, and cleanup with `Fiber.interrupt` or closing the scope plus `Queue.shutdown` finalizer.
- **App-wide queue:** place one runtime/scope/provider near app root; do not create per render. Expose enqueue functions only (`Queue.Enqueue`) to UI callers where possible.
- **Backpressure choice:** bounded for must-process jobs; sliding for latest-state jobs; dropping for lossy events; avoid unbounded unless data volume is provably bounded elsewhere.
- **Concurrency:** prefer `Effect.forEach(items, worker, { concurrency: n })` for batches. Use Queue + N forked workers only for long-lived producer/consumer flows.

## Pitfalls
- Starting fibers in render or module init causes leaks/non-deterministic lifetimes.
- `forkDaemon` leaks across unmount/route changes unless intentionally app-global.
- `runPromise` without TanStack/React abort wiring lets stale requests finish and possibly update cache/state unexpectedly.
- Interrupting Effect does not automatically cancel arbitrary Promise work unless the Promise API consumes `AbortSignal` or `Effect.async` cleanup is provided.
- Bounded `Queue.offer` can suspend forever if no worker drains it; do not call from UI path without timeout/cancel/nonblocking design.
- `Effect.fork` inside a parent that immediately completes may terminate child due structured concurrency; use scoped/app-lifetime fork for workers.
- React Strict Mode double setup exposes missing cleanup; design setup/cleanup to be idempotent.

## Sources
- Kept: Effect Running Effects (https://effect.website/docs/getting-started/running-effects/) — official `runPromise`, `runFork`, edge execution guidance.
- Kept: Effect Fibers (https://effect.website/docs/concurrency/fibers/) — official fork, fiber lifecycle, interruption, daemon/scoped fork behavior.
- Kept: Effect Queue (https://effect.website/docs/concurrency/queue/) — official queue types, suspension/backpressure, shutdown.
- Kept: Effect Basic Concurrency (https://effect.website/docs/concurrency/basic-concurrency/) — official concurrency options, interruption propagation, race behavior.
- Kept: Effect Scope (https://effect.website/docs/resource-management/scope/) — official scoped lifetimes/finalizers.
- Kept: Effect Creating Effects (https://effect.website/docs/getting-started/creating-effects/) — official `tryPromise`, `async`, AbortSignal/cleanup wrapping.
- Kept: TanStack Query Cancellation (https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation) — primary docs for query `AbortSignal` behavior.
- Kept: React `useEffect` Reference (https://react.dev/reference/react/useEffect) — primary docs for setup/cleanup and Strict Mode behavior.
- Kept: Effect Runtime API (https://effect-ts.github.io/effect/effect/Runtime.ts.html) — API signature for `runPromise(..., { signal })`.
- Dropped: third-party Effect Query/effectify packages — useful integration examples but not needed for core guidance; versions/APIs may drift.
- Dropped: EffectPatterns GitHub examples — secondary pattern source; official docs covered concurrency controls.
- Dropped: SEO/API mirror pages — redundant versus official Effect docs and generated API docs.

## Gaps
- No browser performance benchmark found comparing Effect queues/fibers to hand-written promise queues.
- Exact project version not checked; confirm installed `effect` version supports `runPromise` `{ signal }` and current import paths.
- Need app architecture decision: one app-wide Effect runtime/scope vs feature-local scopes for queues.
