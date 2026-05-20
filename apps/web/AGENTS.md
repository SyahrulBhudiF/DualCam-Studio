# QUIS AGENTS (Root)

## Project

- **Project**: QUIS (DualCam Studio) — TanStack Start / React app for dual-camera questionnaire workflows with recording, analytics, and admin management.
- **Package manager**: Bun (`bun install`, `bun run ...`).
- **Primary stack**: TypeScript (strict), React 19, TanStack Start.
- **Non-standard dependency**: Python camera bridge (`server-camera.py`) via `uv`.
- **TERMINAL**: USE nu (nushell).

## Build / Lint / Test commands

- **Install JS deps**: `bun install`
- **Install Python deps (camera bridge)**: `uv sync`
- **Dev server**: `bun run dev`
- **Production build**: `bun run build` _(runs `vite build` + `tsc --noEmit`)_
- **Start production server**: `bun run start`
- **Run camera server**: `bun run camera`

- **Lint**: `bun run lint`
- **Format check**: `bun run format`
- **Full Biome check**: `bun run check`
- **Auto-fix lint/format**: `bun run lint:fix`, `bun run format:fix`, `bun run check:fix`

## Testing

- **Run all tests (watch)**: `bun run test`
- **Run all tests (single-run)**: `bun run test:run`
- **Coverage**: `bun run test:coverage`
- **Run performance tests**: `bun run test:perf`
- **Single test file**: `bun run test tests/utils/session.test.ts`
- **Single test file (single-run)**: `bun run test:run tests/utils/session.test.ts`
- **Filter by test name**: `bun run test:run -- -t "extracts effect error message"`

## Per-scope instructions

- General style + TypeScript conventions: [`docs/agent-guidelines/style.md`](docs/agent-guidelines/style.md)
- Testing patterns and commands: [`docs/agent-guidelines/testing.md`](docs/agent-guidelines/testing.md)
- Architecture + error handling expectations: [`docs/agent-guidelines/architecture.md`](docs/agent-guidelines/architecture.md)
- Git/operational workflow and review practices: [`docs/agent-guidelines/workflow.md`](docs/agent-guidelines/workflow.md)
- Candidate instructions to delete/clarify: [`docs/agent-guidelines/deletions.md`](docs/agent-guidelines/deletions.md)

## Instruction conflicts found in repo docs

- `README.md` still lists Supabase-centric setup (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `supabase.ts`) and must be updated to current `DATABASE_URL` + Drizzle + Effect stack.
- `.env.example` currently contains Supabase placeholders and does not match runtime config.

## Tools/config references

- **Cursor rules**: none detected.
- **Copilot rules**: none detected.

## Suggested docs layout

- `docs/agent-guidelines/commands.md`
- `docs/agent-guidelines/style.md`
- `docs/agent-guidelines/testing.md`
- `docs/agent-guidelines/architecture.md`
- `docs/agent-guidelines/workflow.md`
- `docs/agent-guidelines/deletions.md`
