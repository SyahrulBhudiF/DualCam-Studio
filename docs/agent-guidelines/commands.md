# AGENTS · Commands & Tooling

## Canonical package/tooling
- Package manager: **Bun**.
- Python camera bridge deps: **uv**.
- Build/test/lint scripts use `package.json` as canonical source.

## Core commands
- Install JS deps: `bun install`
- Install Python deps: `uv sync`

### Dev
- `bun run dev` → start TanStack Start dev server, usually `http://localhost:3000`
- `bun run camera` → start RealSense websocket bridge (`server-camera.py`)

### Build/start
- `bun run build` → `vite build && tsc --noEmit`
- `bun run start` → run production server
- Do **not** run build by default; user prefers lint-based validation unless build is explicitly requested.

### DB helpers
- `bun run db:generate` → generate Drizzle migrations
- `bun run db:migrate` → apply migrations
- `bun run db:push` → push schema
- `bun run db:studio` → open Drizzle Studio

### Lint/format/check
- `bun run lint`
- `bun run lint:fix`
- `bun run format`
- `bun run format:fix`
- `bun run check`
- `bun run check:fix`

### Testing
- `bun run test` → watch mode
- `bun run test:run` → single-run
- `bun run test:coverage`
- `bun run test:perf` → performance tests; expect env gating

### Single test
- `bun run test tests/utils/session.test.ts`
- `bun run test:run tests/utils/session.test.ts`
- `bun run test:run -- -t "Invalid login credentials"`

## Environment
- `.env.example` is the canonical env template.
- Required DB runtime variable: `DATABASE_URL`.
- Session defaults exist for `SESSION_COOKIE_NAME` and `SESSION_DURATION_DAYS`, but keep them explicit in `.env` for clarity.

## Browser/manual validation
- Use `agent-browser` when user requests browser validation or CSS/hydration/debug inspection.
- Common pages to smoke-check:
  - `/login`
  - `/admin/dashboard`
  - `/admin/responses`
  - `/questionnaire`

## Notes for contributors
- Vitest config: `vitest.config.ts`
- Biome config: `biome.json`
- Path alias: `@/*` via `tsconfig.json` + `vite-tsconfig-paths`.
