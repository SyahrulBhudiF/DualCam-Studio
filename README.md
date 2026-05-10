# DualCam Studio

DualCam Studio is a TanStack Start / React app for dual-camera questionnaire workflows. It combines webcam / Intel RealSense recording, an admin-managed questionnaire CMS, PostgreSQL persistence, and analytics/export tooling.

## Core features

- Dual-camera recording with browser `MediaRecorder` and optional Intel RealSense bridge.
- Full-session or per-question segmented video uploads.
- Admin questionnaire, question, answer, and scoring management.
- Participant profile capture and response storage.
- Admin dashboard with summary analytics, filters, response details, video playback, and Excel export.
- Effect-based server services for auth, sessions, database access, validation, and domain errors.

## Stack

| Area | Tech |
| --- | --- |
| App | TanStack Start, React 19, TanStack Router |
| Server/runtime | Bun, TanStack server functions, Effect v4 beta |
| Database | PostgreSQL, Drizzle ORM v1 RC, `drizzle-orm/effect-postgres`, `@effect/sql-pg` |
| Auth | DB-backed sessions, secure cookies, bcrypt |
| UI | Tailwind CSS v4, shadcn/Radix-style components, Sonner |
| Data UI | TanStack Query, TanStack Table, TanStack Form |
| Camera bridge | Python + `uv`, `server-camera.py` |
| Quality | Biome, Vitest |

## Requirements

- Bun
- PostgreSQL
- Python 3.10+ and `uv` for the optional RealSense bridge
- Intel RealSense SDK for RealSense capture

## Setup

```bash
bun install
uv sync
cp .env.example .env
```

Configure `.env`:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/quis
SESSION_COOKIE_NAME=quis_session
SESSION_DURATION_DAYS=7
NODE_ENV=development
BCRYPT_SALT_ROUNDS=10
RATE_LIMIT_MAX_ATTEMPTS=5
RATE_LIMIT_WINDOW_MS=900000
```

## Database

```bash
bun run db:generate
bun run db:migrate
```

Useful alternatives:

```bash
bun run db:push
bun run db:studio
```

Drizzle schema lives in `src/infrastructure/db/schema.ts`. Runtime DB access is provided through Effect layers in `src/infrastructure/layers/database.ts`.

## Development

```bash
bun run dev
```

App defaults to Vite/TanStack Start dev server output, usually `http://localhost:3000`.

Optional RealSense bridge:

```bash
bun run camera
```

## Scripts

| Script | Purpose |
| --- | --- |
| `bun run dev` | Start dev server |
| `bun run start` | Start production server |
| `bun run camera` | Run Python camera bridge |
| `bun run lint` | Biome lint |
| `bun run format` | Biome format check |
| `bun run check` | Biome check |
| `bun run test:run` | Vitest single run |
| `bun run test:coverage` | Vitest coverage |
| `bun run test:perf` | Performance tests |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Apply Drizzle migrations |
| `bun run db:push` | Push schema to DB |
| `bun run db:studio` | Open Drizzle Studio |

## Main paths

```text
src/apis/                 Server functions
src/components/           Shared UI and layout
src/features/             Feature modules
src/infrastructure/       Effect services, layers, schemas, DB, errors
src/libs/                 Client utilities, hooks, stores, schemas
src/routes/               TanStack routes
src/styles/app.css        Tailwind/theme tokens
server-camera.py          RealSense WebSocket bridge
video_uploads/            Local uploaded videos (ignored)
```

## Video storage

```text
video_uploads/
├── full/{userName}_{timestamp}/
│   ├── recording_main.webm
│   └── recording_realsense.avi
└── segmented/{userName}_{timestamp}/q{n}/
    ├── {userName}_{n}_{questionId}_main.webm
    └── {userName}_{n}_{questionId}_sec.avi
```

`video_uploads/` is local runtime data and is ignored by git.
