# DualCam Studio

DualCam Studio is a TanStack Start / React application for building rich microexpression and questionnaire datasets. It combines dual‑camera video capture (Intel RealSense and standard webcam), a flexible CMS‑style questionnaire system, and an admin dashboard for analytics and management.

The system is designed for research scenarios such as anxiety and microexpression studies, but is generic enough to be used for online exams, surveys, and other assessment workflows.

---

## Core capabilities

### 1. Dual‑camera recording

- Primary camera: standard webcam (MediaRecorder in the browser).
- Secondary camera:
  - Intel RealSense via a WebSocket bridge (`server-camera.py`).
  - Or a second standard webcam.
- Supports:
  - Full‑session recording for an entire questionnaire.
  - Segmented per‑question recording with chunked uploads.
- Video files are written to disk on the server (`video_uploads/`), with JSON metadata linking recordings to responses and questions.

### 2. Flexible questionnaire CMS

- Questionnaires are stored in the database and can be changed without code changes.
- Admins can:
  - Create and activate one questionnaire at a time for participants.
  - Define ordered questions per questionnaire.
  - Attach multiple answers/options per question with their own scores.
- The same engine can be used for:
  - Anxiety or microexpression research questionnaires.
  - Online exams and quizzes.
  - Generic surveys and feedback forms.

Data model :

- `questionnaires`
  - `id`, `title`, `description`, `is_active`, `created_at`
- `questions`
  - `id`, `questionnaire_id`, `question_text`, `order_number`, `created_at`
- `answers`
  - `id`, `question_id`, `answer_text`, `score`, `created_at`

### 3. Participant profiles and responses

- Profiles are stored in `profiles`:
  - `id`, `name`, `class`, `created_at`
- Responses are stored in `responses` and `response_details`:
  - `responses`
    - `id`, `user_id` (FK to `profiles`), `questionnaire_id`, `video_path`, `total_score`, `created_at`
  - `response_details`
    - `id`, `response_id`, `question_id`, `answer_id`, `score`
- Supports:
  - Mapping each participant’s answers to exact questions and answer options.
  - Linking full‑session or segmented video paths to each response.

### 4. Admin dashboard and analytics

The admin dashboard provides:

- High‑level metrics:
  - Total questionnaires.
  - Active questionnaires.
  - Total responses.
  - Average total score.
  - Number of distinct classes.
- Breakdown analytics:
  - Responses and average score per questionnaire.
  - Responses and average score per class (using `profiles.class`).
- Question‑level analytics:
  - Average score per question.
  - Average score and counts per answer option.
- Timeline analytics:
  - Responses per day.
  - Average scores per day.
- Video analytics:
  - Count of responses with video attached.
  - Ratio of video responses to total responses.
- Basic charting using shadcn‑styled chart components with Recharts.

These analytics are powered by server functions in `src/apis/dashboard.ts` that aggregate data from Supabase and serve it to the dashboard via TanStack Query.

### 5. Dataset‑oriented design

DualCam Studio is structured to make dataset collection straightforward:

- Every response carries:
  - User profile reference.
  - Questionnaire and question references.
  - Selected answer IDs and scores.
  - Video paths for primary and optional secondary camera.
- Suitable for building datasets for:
  - Microexpression analysis.
  - Anxiety studies.
  - Examination performance and behavioral research.
- Export:
  - Dashboard includes an “Export Excel” feature that writes multiple sheets:
    - Summary metrics.
    - Per‑questionnaire breakdown.
    - Per‑class breakdown.
    - Question statistics.
    - Answer statistics.
    - Timeline data.

---

## Tech stack

- **Framework:** TanStack Start (React, TanStack Router, TanStack Query)
- **Backend integration:** Supabase (Postgres + Auth)
- **Video capture:**
  - Browser MediaRecorder for webcam.
  - Optional Python WebSocket bridge for Intel RealSense.
- **UI components:** shadcn‑style components (`src/components/ui`)
- **Charts:** Recharts wrapped by `src/components/ui/chart.tsx`
- **Schema validation:** Zod (via `libs/schemas/*`)
- **Runtime:** Bun (scripts), Node ecosystem compatible

---

## Project structure (high‑level)

- `src/apis/`
  - `dashboard.ts` – analytics server functions for the admin dashboard.
  - `questionnaire.ts` – questionnaire loading and full‑session submission.
  - `segmented-upload.ts` – chunked upload and segmented submission.
  - `user.ts` – authentication and user fetch helpers.
- `src/features/questionnaire/`
  - `index.tsx` – full‑session questionnaire flow with dual‑camera recording.
  - `segmented/` – segmented per‑question recording flow.
- `src/features/dashboard/`
  - `index.tsx` – top‑level admin dashboard page.
  - `components/` - dashboard content, tabs, overview, analytics, analysis chart, types.
- `src/components/`
  - `RealSenseCanvas.tsx` – RealSense video rendering.
  - `CameraControlPanel.tsx` – camera device selection and control.
  - `layout/*` – layout primitives.
  - `ui/*` – shadcn‑style UI library.
- `video_uploads/`
  - Created at runtime to store recorded video files.

---

## Supabase schema overview

Minimum expected tables and relationships:

- `profiles`
  - `id uuid primary key references auth.users(id) on delete cascade`
  - `name text not null`
  - `class text not null`
  - `created_at timestamptz default now()`
- `questionnaires`
  - `id uuid primary key default gen_random_uuid()`
  - `title text not null`
  - `description text`
  - `is_active boolean default true`
  - `created_at timestamptz default now()`
- `questions`
  - `id uuid primary key default gen_random_uuid()`
  - `questionnaire_id uuid references questionnaires(id) on delete cascade`
  - `question_text text not null`
  - `order_number int`
  - `created_at timestamptz default now()`
- `answers`
  - `id uuid primary key default gen_random_uuid()`
  - `question_id uuid references questions(id) on delete cascade`
  - `answer_text text not null`
  - `score int not null`
  - `created_at timestamptz default now()`
- `responses`
  - `id uuid primary key default gen_random_uuid()`
  - `user_id uuid references profiles(id) on delete cascade`
  - `questionnaire_id uuid references questionnaires(id) on delete cascade`
  - `video_path text`
  - `total_score int`
  - `created_at timestamptz default now()`
- `response_details`
  - `id uuid primary key default gen_random_uuid()`
  - `response_id uuid references responses(id) on delete cascade`
  - `question_id uuid references questions(id)`
  - `answer_id uuid references answers(id)`
  - `score int`

Adjust column names if the actual database differs; ensure foreign keys and indexes match the needs of analytics queries.

---

## Setup and configuration

### Prerequisites

- Bun (recommended) or Node.js with npm/pnpm/yarn.
- Supabase project with the tables described above.
- (Optional) Intel RealSense camera and Python 3 environment for the RealSense WebSocket helper.

### Environment variables

Configure at least:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

These are used by the Supabase server client utilities in `src/utils/supabase.ts`.

### Install dependencies

Using Bun:

```bash
bun install
```

Alternatively, use npm/pnpm/yarn with the equivalent command.

### Development server

Run the Dev server:

```bash
bun run dev
```

This starts the TanStack Start dev environment.

### RealSense camera helper (optional)

If using Intel RealSense via WebSocket, run:

```bash
bun run camera
```

This uses `uv` to launch `server-camera.py`, which streams RealSense frames and exposes a WebSocket endpoint expected by the frontend.

---

## Usage overview

1. Configure Supabase schema and environment variables.
2. Start the dev server (and camera helper if using RealSense).
3. Log in via Supabase Auth (see `src/apis/user.ts` and `components/Auth.tsx`).
4. Create or seed questionnaires, questions, and answers in Supabase.
5. Set one questionnaire as active.
6. Participants open the questionnaire page:
   - Cameras are initialized (webcam and optional RealSense).
   - Recording starts automatically once both streams are ready.
   - Participants answer questions; on submit, recordings and answers are uploaded and stored.
7. Admins open the dashboard:
   - Review summary metrics and breakdowns.
   - Export the aggregated data to Excel for further analysis or offline processing.

---

## Scripts

Common scripts (see `package.json` for full list):

- Install: `bun install`
- Dev: `bun run dev`
- Build: `bun run build`
- Start: `bun run start`
- Camera helper: `bun run camera`
- Lint: `bunx biome lint .`
- Format: `bunx biome format .`

---

DualCam Studio aims to be a general‑purpose, dataset‑oriented platform for dual‑camera microexpression recording and questionnaire management, suitable both for research and for more traditional online exam and survey use cases.
