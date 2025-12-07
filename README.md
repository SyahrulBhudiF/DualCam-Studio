# DualCam Studio

DualCam Studio is a TanStack Start / React application for building rich microexpression and questionnaire datasets. It combines dual‑camera video capture (Intel RealSense and standard webcam), a flexible CMS‑style questionnaire system, and an admin dashboard for analytics and management.

The system is designed for research scenarios such as anxiety and microexpression studies, but is generic enough to be used for online exams, surveys, and other assessment workflows.

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
  - **Full‑session recording:** Records entire questionnaire session as one video
  - **Segmented per‑question recording:** Records each question separately with chunked uploads
- Video files are written to disk on the server (`video_uploads/`), with metadata linking recordings to responses and questions

### 2. Flexible Questionnaire CMS

- Questionnaires are stored in the database and can be changed without code changes
- Admin capabilities:
  - Create and activate one questionnaire at a time for participants
  - Define ordered questions per questionnaire
  - Attach multiple answers/options per question with their own scores
- Use cases:
  - Anxiety or microexpression research questionnaires
  - Online exams and quizzes
  - Generic surveys and feedback forms

### 3. Participant Profiles and Responses

- **Profile data stored:**
  - `id`, `name`, `class`, `email`, `nim`, `semester`, `gender`, `age`, `created_at`
- **Response tracking:**
  - `responses` table: links user, questionnaire, video path, and total score
  - `response_details` table: per-question answers with scores and video segment paths
- Supports:
  - Mapping each participant's answers to exact questions and answer options
  - Linking full‑session or segmented video paths to each response

### 4. Admin Dashboard and Analytics

The admin dashboard provides:

- **High‑level metrics:**
  - Total questionnaires and active questionnaires
  - Total responses and average total score
  - Number of distinct classes
- **Breakdown analytics:**
  - Responses and average score per questionnaire
  - Responses and average score per class
- **Question‑level analytics:**
  - Average score per question
  - Average score and counts per answer option
- **Timeline analytics:**
  - Responses per day
  - Average scores per day
- **Video analytics:**
  - Count of responses with video attached
  - Ratio of video responses to total responses
- **Export:** Excel export with multiple sheets (summary, breakdowns, question stats, timeline data)

### 5. Admin Response Management

- View all responses with filtering by:
  - Questionnaire
  - Class
  - Date range
- Response detail view with:
  - Profile information
  - Video playback (full-mode and segmented-mode)
  - Question-by-question answers with scores
- Bulk delete responses
- Export individual response details

### 6. Video Playback

The system includes a video streaming API that serves recorded videos:

- **Full mode:** Plays main and secondary camera recordings side by side
- **Segmented mode:** Plays per-question video segments with navigation
- **Fallback support:** Automatically builds video paths for older recordings where `video_segment_path` is null

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | TanStack Start (React 19, TanStack Router, TanStack Query) |
| **Backend Integration** | Supabase (PostgreSQL + Auth) |
| **Video Capture** | Browser MediaRecorder, Python WebSocket bridge for Intel RealSense |
| **UI Components** | shadcn/ui style components with Radix UI primitives |
| **State Management** | Zustand |
| **Charts** | Recharts |
| **Form Handling** | TanStack Form with Zod validation |
| **Data Tables** | TanStack Table |
| **Styling** | Tailwind CSS v4 |
| **Runtime** | Bun (recommended), Node.js compatible |
| **Linting/Formatting** | Biome |

---

## Project Structure

```
QUIS/
├── src/
│   ├── apis/                    # Server functions
│   │   ├── admin/
│   │   │   ├── questionnaires.ts  # Questionnaire CRUD
│   │   │   └── responses.ts       # Response management & filtering
│   │   ├── dashboard.ts           # Analytics server functions
│   │   ├── questionnaire.ts       # Full-session questionnaire submission
│   │   ├── segmented-upload.ts    # Chunked upload & segmented submission
│   │   └── user.ts                # Authentication helpers
│   │
│   ├── components/
│   │   ├── ui/                  # shadcn-style UI library
│   │   ├── layout/              # Layout primitives
│   │   ├── data-table/          # Reusable data table components
│   │   ├── Auth.tsx             # Authentication component
│   │   ├── CameraControlPanel.tsx # Camera device selection & control
│   │   └── RealSenseCanvas.tsx  # RealSense video rendering via WebSocket
│   │
│   ├── features/
│   │   ├── admin/
│   │   │   ├── questionnaire/   # Questionnaire management UI
│   │   │   └── responses/       # Response list & detail views
│   │   ├── dashboard/           # Admin dashboard & analytics
│   │   ├── profile/             # User profile management
│   │   └── questionnaire/
│   │       ├── index.tsx        # Full-session questionnaire flow
│   │       └── segmented/       # Segmented per-question flow
│   │
│   ├── libs/
│   │   ├── hooks/
│   │   │   └── use-camera-setup.ts  # Dual camera management hook
│   │   ├── schemas/             # Zod validation schemas
│   │   └── store/               # Zustand stores
│   │
│   ├── routes/                  # TanStack Router file-based routes
│   │   ├── api/
│   │   │   └── video/
│   │   │       └── $.ts         # Video streaming endpoint
│   │   ├── admin/               # Admin routes (dashboard, questionnaires, responses)
│   │   ├── questionnaire/       # Questionnaire routes (full & segmented)
│   │   └── ...
│   │
│   └── utils/
│       └── supabase.ts          # Supabase client utilities
│
├── video_uploads/               # Runtime storage for recorded videos
│   ├── full/                    # Full-session recordings
│   └── segmented/               # Per-question recordings
│
├── server-camera.py             # Intel RealSense WebSocket server
├── pyproject.toml               # Python dependencies for camera server
├── package.json                 # Node.js dependencies
├── vite.config.ts               # Vite configuration
├── biome.json                   # Biome linter/formatter config
└── tsconfig.json                # TypeScript configuration
```

---

## Database Schema

### Tables

#### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (references auth.users) |
| `name` | text | Participant name |
| `class` | text | Class/group identifier |
| `email` | text | Email address |
| `nim` | text | Student ID number |
| `semester` | text | Current semester |
| `gender` | text | Gender |
| `age` | int | Age |
| `created_at` | timestamptz | Creation timestamp |

#### `questionnaires`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `title` | text | Questionnaire title |
| `description` | text | Description |
| `is_active` | boolean | Whether questionnaire is active |
| `created_at` | timestamptz | Creation timestamp |

#### `questions`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `questionnaire_id` | uuid | FK to questionnaires |
| `question_text` | text | Question content |
| `order_number` | int | Display order |
| `created_at` | timestamptz | Creation timestamp |

#### `answers`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `question_id` | uuid | FK to questions |
| `answer_text` | text | Answer content |
| `score` | int | Score value for this answer |
| `created_at` | timestamptz | Creation timestamp |

#### `responses`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK to profiles |
| `questionnaire_id` | uuid | FK to questionnaires |
| `video_path` | text | JSON paths (full mode) or folder name (segmented mode) |
| `total_score` | int | Sum of all answer scores |
| `created_at` | timestamptz | Creation timestamp |

#### `response_details`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `response_id` | uuid | FK to responses |
| `question_id` | uuid | FK to questions |
| `answer_id` | uuid | FK to answers |
| `score` | int | Score for this answer |
| `video_segment_path` | text | JSON with main/secondary video paths (segmented mode) |

---

## Setup and Configuration

### Prerequisites

- **Bun** (recommended) or Node.js 18+
- **Supabase** project with tables as described above
- **Python 3.10+** with uv (optional, for Intel RealSense camera)
- **Intel RealSense SDK** (optional, for RealSense camera support)

### Environment Variables

Create a `.env` file or set these environment variables:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Install Dependencies

```bash
# JavaScript dependencies
bun install

# Python dependencies (for RealSense camera)
uv sync
```

### Database Setup

Run the following SQL to create the required tables (adjust as needed):

```sql
-- Profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  class text,
  email text,
  nim text,
  semester text,
  gender text,
  age int,
  created_at timestamptz DEFAULT now()
);

-- Questionnaires table
CREATE TABLE questionnaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Questions table
CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id uuid REFERENCES questionnaires(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  order_number int,
  created_at timestamptz DEFAULT now()
);

-- Answers table
CREATE TABLE answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  answer_text text NOT NULL,
  score int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Responses table
CREATE TABLE responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  questionnaire_id uuid REFERENCES questionnaires(id) ON DELETE CASCADE,
  video_path text,
  total_score int,
  created_at timestamptz DEFAULT now()
);

-- Response details table
CREATE TABLE response_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid REFERENCES responses(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id),
  answer_id uuid REFERENCES answers(id),
  score int,
  video_segment_path text
);
```

---

## Usage Overview

### Development Server

```bash
bun run dev
```

This starts the TanStack Start dev environment at `http://localhost:3000`.

### RealSense Camera Server (Optional)

If using Intel RealSense via WebSocket:

```bash
bun run camera
```

This launches `server-camera.py` which:
- Streams RealSense frames to connected clients via WebSocket on port 8080
- Handles START/STOP recording commands
- Saves recordings directly to `video_uploads/`

### Workflow

1. **Setup:** Configure Supabase and environment variables
2. **Start servers:** Run dev server (and camera helper if using RealSense)
3. **Create questionnaire:** Use admin dashboard to create questionnaires, questions, and answers
4. **Activate questionnaire:** Set one questionnaire as active
5. **Participants answer:**
   - Open questionnaire page
   - Cameras initialize automatically
   - Recording starts when both cameras are ready
   - Submit answers when done
6. **Review responses:** Use admin dashboard to:
   - View summary metrics and analytics
   - Browse individual responses with video playback
   - Export data to Excel

---

## API Routes

### Video Streaming

**`GET /api/video/{path}`**

Streams video files from `video_uploads/` directory.

- Supports: `.webm`, `.mp4`, `.avi`, `.mov`, `.mkv`
- Returns appropriate Content-Type headers
- Includes security against directory traversal

Example:
```
GET /api/video/full/john_123456/recording_main.webm
GET /api/video/segmented/john_123456/q1/john_1_uuid_main.webm
```

### Server Functions

All data operations use TanStack Start server functions:

- `getActiveQuestionnaire` - Get currently active questionnaire with questions
- `submitQuestionnaire` - Submit full-session response with video
- `uploadVideoChunk` - Upload segmented video chunk
- `submitSegmentedResponse` - Submit segmented response with answers
- `getResponses` / `getResponseById` - Fetch response data
- `deleteResponses` - Bulk delete responses
- `getFilterOptions` - Get available filter options
- Dashboard analytics functions for metrics and breakdowns

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev | `bun run dev` | Start development server |
| Build | `bun run build` | Build for production |
| Start | `bun run start` | Start production server |
| Camera | `bun run camera` | Start RealSense WebSocket server |
| Lint | `bun run lint` | Run Biome linter |
| Lint Fix | `bun run lint:fix` | Auto-fix lint issues |
| Format | `bun run format` | Check formatting |
| Format Fix | `bun run format:fix` | Auto-fix formatting |
| Check | `bun run check` | Run all Biome checks |

---

## Video Storage Structure

```
video_uploads/
├── full/
│   └── {userName}_{timestamp}/
│       ├── recording_main.webm       # Primary camera (browser)
│       └── recording_realsense.avi   # Secondary camera (RealSense)
│
└── segmented/
    └── {userName}_{timestamp}/
        ├── q1/
        │   ├── {userName}_1_{questionId}_main.webm
        │   └── {userName}_1_{questionId}_sec.avi
        ├── q2/
        │   └── ...
        └── ...
```

---

## License

ISC

---

DualCam Studio aims to be a general‑purpose, dataset‑oriented platform for dual‑camera microexpression recording and questionnaire management, suitable both for research and for more traditional online exam and survey use cases.