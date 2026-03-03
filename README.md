# DualCam Studio

DualCam Studio is a TanStack Start / React application for building rich microexpression and questionnaire workflows. It combines dual-camera video capture (Intel RealSense and standard webcam), a flexible questionnaire CMS, and an admin dashboard for analytics and management.

The system is designed for research scenarios such as anxiety and microexpression studies, but is also suitable for online exams, surveys, and related assessment workflows.

---

## Table of Contents

- [Core Capabilities](#core-capabilities)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Setup and Configuration](#setup-and-configuration)
- [Usage Overview](#usage-overview)
- [API Routes](#api-routes)
- [Scripts](#scripts)

---

## Core Capabilities

### 1. Dual‑Camera Recording
- **Primary camera:** Standard webcam (MediaRecorder in the browser)
- **Secondary camera:**
  - Intel RealSense via a WebSocket bridge (`server-camera.py`)
  - Or a second standard webcam
- **Recording modes:**
  - **Full-session recording:** record one full session video
  - **Segmented recording:** per-question chunks with chunked uploads
- Videos are written to `video_uploads/` and linked to responses/questions.

### 2. Flexible Questionnaire CMS
- Questionnaires, questions, and answers are data-driven and admin-manageable.
- Admin can:
  - Create/edit questionnaires, questions, answers
  - Activate one active questionnaire
  - Define scoring per answer

### 3. Participant Profiles and Responses
- Profiles hold demographic data (name, class, email, nim, etc.).
- Responses are linked to questionnaires, users, and optional answer details.

### 4. Dashboard and Analytics
- Response summary and averages
- Class/questionnaire breakouts
- Per-question/per-option analytics
- Timeline analytics
- Video attachment ratio
- Excel export for reports

### 5. Response Management
- Admin list/filter views by class, questionnaire, date
- Response detail with profile + playback
- Bulk delete
- Export individual response details

### 6. Video Playback
- Full mode: main + secondary camera side-by-side
- Segmented mode: question-by-question playback
- Backward compatibility for older `video_segment_path` payloads

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | TanStack Start (React 19, TanStack Router, TanStack Query) |
| **Backend** | PostgreSQL + Effect + Drizzle (`@effect/sql-drizzle`) |
| **Auth / Sessions** | Effect-based server auth with DB sessions + secure cookies |
| **Video Capture** | Browser MediaRecorder + Python WebSocket bridge for Intel RealSense |
| **UI** | shadcn/ui style components (Radix UI primitives) |
| **State** | Zustand |
| **Charts** | Recharts |
| **Forms** | TanStack Form with zod-based client schemas + server-side Effect schemas |
| **Tables** | TanStack Table |
| **Styling** | Tailwind CSS v4 |
| **Runtime** | Bun (recommended), Node.js compatible |
| **Linting / Formatting** | Biome |

---

## Project Structure

```
QUIS/
├── src/
│   ├── apis/                    # Server function boundaries
│   │   ├── admin/
│   │   │   ├── questionnaires.ts
│   │   │   └── responses.ts
│   │   ├── dashboard.ts
│   │   ├── questionnaire.ts
│   │   ├── segmented-upload.ts
│   │   └── user.ts
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── data-table/
│   │   ├── Auth.tsx
│   │   ├── CameraControlPanel.tsx
│   │   └── RealSenseCanvas.tsx
│   ├── features/
│   │   ├── admin/
│   │   │   ├── questionnaire/
│   │   │   └── responses/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── questionnaire/
│   │       ├── index.tsx
│   │       └── segmented/
│   ├── infrastructure/
│   │   ├── config/
│   │   ├── db/
│   │   ├── errors/
│   │   ├── runtime/
│   │   ├── schemas/
│   │   ├── layers/
│   │   └── services/
│   ├── libs/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   └── store/
│   ├── routes/
│   │   ├── api/
│   │   │   └── video/
│   │   ├── admin/
│   │   ├── questionnaire/
│   │   └── ...
│   ├── utils/
│   │   ├── session.ts
│   │   ├── csrf.ts
│   │   ├── crypto.ts
│   │   ├── seo.ts
│   │   └── utils.ts
│   ├── styles/
│   └── routeTree.gen.ts
├── docs/
├── server-camera.py             # Python RealSense WebSocket server
├── pyproject.toml               # Python dependencies for camera bridge
├── package.json
├── vite.config.ts
├── biome.json
└── tsconfig.json
```

---

## Database Schema

Core tables used by runtime:

### `users`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `email` | text | Unique email |
| `password_hash` | text | BCrypt password hash |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

### `sessions`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK to `users(id)` |
| `token` | text | Session token |
| `expires_at` | timestamptz | Expiration timestamp |
| `created_at` | timestamptz | Creation timestamp |

### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | PK, references user/session domain |
| `name` | text | Participant name |
| `email` | text | Participant email |
| `nim` | text | Student ID |
| `class` | text | Class/group |
| `semester` | text | Semester |
| `gender` | text | Gender code |
| `age` | int | Age |
| `created_at` | timestamptz | Creation timestamp |

### `questionnaires`, `questions`, `answers`
- `questionnaires`: title, description, active flag, timestamps
- `questions`: questionnaire FK + text + order
- `answers`: question FK + text + score

### `responses`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK to `profiles(id)` |
| `questionnaire_id` | uuid | FK to `questionnaires(id)` |
| `video_path` | text | Full/segmented video path(s) as JSON or folder path |
| `total_score` | int | Total response score |
| `created_at` | timestamptz | Creation timestamp |

### `response_details`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `response_id` | uuid | FK to `responses(id)` |
| `question_id` | uuid | FK to `questions(id)` |
| `answer_id` | uuid | FK to `answers(id)` |
| `score` | int | Score from selected answer |
| `video_segment_path` | jsonb | Per-question segment paths |

### `rate_limits`
- Tracks request counters for login/signup rate limiting.

> The SQL in source control / migration tooling (drizzle) is the canonical schema definition.

---

## Setup and Configuration

### Prerequisites
- **Bun** (recommended) or Node.js 18+
- **PostgreSQL** database (local, container, or hosted)
- **Python 3.10+** + `uv` (for optional RealSense bridge)
- **Intel RealSense SDK** (optional)

### Environment Variables
Create `.env` (or export env vars):

```bash
DATABASE_URL=postgresql://user:password@host:5432/quis_db
SESSION_COOKIE_NAME=quis_session
SESSION_DURATION_DAYS=7
NODE_ENV=development
BCRYPT_SALT_ROUNDS=10
RATE_LIMIT_MAX_ATTEMPTS=5
RATE_LIMIT_WINDOW_MS=900000
```

### Install Dependencies
```bash
# JavaScript dependencies
bun install

# Python dependencies (for RealSense camera)
uv sync
```

### DB setup / migrations
Use Drizzle migration tooling:

```bash
bun run db:generate
bun run db:migrate
# optional:
bun run db:push
bun run db:studio
```

---

## Usage Overview

### Development Server
```bash
bun run dev
```
This starts TanStack Start at `http://localhost:3000`.

### RealSense Camera Server (optional)
```bash
bun run camera
```
This launches `server-camera.py` (WebSocket on port 8080) for RealSense command/control.

### Workflow
1. Setup PostgreSQL + environment
2. Start app (`bun run dev`) and camera bridge if needed
3. Create questionnaires and set one as active
4. Participants open `/questionnaire` and submit responses with recordings
5. Admin reviews responses/analytics and exports reports

---

## API Routes

### Video Streaming
`GET /api/video/{path}` streams files from `video_uploads/` with correct MIME handling and traversal guard.

### Server Functions
- `getActiveQuestionnaire`
- `submitQuestionnaire`
- `uploadChunk`
- `submitSegmentedResponse`
- `getResponses` / `getResponseById`
- `deleteResponses`
- `getFilterOptions`
- Dashboard functions
- Auth helpers in `src/apis/user.ts`

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev | `bun run dev` | Start development server |
| Build | `bun run build` | Production build (`vite build && tsc --noEmit`) |
| Start | `bun run start` | Run production entry |
| Camera | `bun run camera` | Start RealSense bridge |
| Lint | `bun run lint` | Lint code |
| Lint Fix | `bun run lint:fix` | Auto-fix lint |
| Format | `bun run format` | Check formatting |
| Format Fix | `bun run format:fix` | Auto-fix format |
| Check | `bun run check` | Biome lint+format checks |

---

## Video Storage Structure

```
video_uploads/
├── full/
│   └── {userName}_{timestamp}/
│       ├── recording_main.webm
│       └── recording_realsense.avi
└── segmented/
    └── {userName}_{timestamp}/
        ├── q1/
        │   ├── {userName}_1_{questionId}_main.webm
        │   └── {userName}_1_{questionId}_sec.avi
        ├── q2/
        │   └── ...
        └── ...
```

DualCam Studio is a reusable dataset-oriented dual-camera platform for research and assessment workflows.
