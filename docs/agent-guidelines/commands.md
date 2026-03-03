# AGENTS · Commands & Tooling

## Canonical package/tooling
- Package manager: **Bun**.
- Build/test/lint scripts use `package.json` as the canonical source.

## Core commands
- Install deps: `bun install`
- Python deps (camera bridge): `uv sync`

### Dev
- `bun run dev` → start app (`http://localhost:3000`)
- `bun run camera` → start RealSense websocket bridge

### Build
- `bun run build` → `vite build && tsc --noEmit`
- `bun run start` → run production server

### DB helpers
- `bun run db:generate` (generate migrations)
- `bun run db:migrate` (apply migrations)
- `bun run db:push` (push schema)
- `bun run db:studio` (open drizzle studio)

### Lint/format/check
- `bun run lint`
- `bun run lint:fix`
- `bun run format`
- `bun run format:fix`
- `bun run check`
- `bun run check:fix`

### Testing
- `bun run test` / `bun run test:run`
- `bun run test:coverage`
- `bun run test:perf`

### Single test
- `bun run test tests/utils/session.test.ts`
- `bun run test:run tests/utils/session.test.ts`
- `bun run test:run -- -t "Invalid login credentials"`

## Notes for contributors
- Config file to inspect: `vitest.config.ts`
- Biome config: `biome.json`
- Path alias: `@/*` (configured in `tsconfig.json` + `vite-tsconfig-paths`).
