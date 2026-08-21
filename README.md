# Anxiety-Classification

Anxiety-Classification is a full-stack anxiety-classification platform built for research datasets and structured behavioral assessment. It combines questionnaire responses, participant metadata, dual-camera facial-video capture, micro-expression motion analysis, and machine-learning inference in one Moonrepo monorepo.

The system is designed to classify anxiety-related signals from facial video while preserving the questionnaire, participant, recording, feature, event, and prediction data needed for inspection and dataset-oriented research. It can support research studies as well as online examinations, surveys, and other controlled assessment workflows.

## What it does

### Participant workflows

- Participant registration and profile capture.
- Configurable questionnaires with questions, answer choices, ordering, and scores.
- Browser-based questionnaire completion.
- Optional analysis after submission.
- Public, token-protected access to prediction results without requiring an administrator account.

### Camera and recording workflows

- Standard webcam recording through the browser.
- Optional Intel RealSense camera integration through the Python camera bridge.
- Dual-camera capture for facial and secondary-camera data.
- Full-session recording.
- Per-question segmented recording.
- Browser previews and server-side video playback.
- Chunked and resumable uploads for large video files.
- Automatic playback conversion for formats that browsers cannot play directly.

### Administration

- Authentication-protected admin area.
- Questionnaire, question, answer, and scoring management.
- Participant profile and response management.
- Response detail views with questionnaire answers, scores, profile information, and associated recordings.
- Video playback for submitted recordings.
- Standalone video-prediction management, separate from questionnaire responses.
- Prediction status, result, model, error, frame, and event inspection.
- Filtering and summary analytics.
- Excel response export.
- Ability to run or re-run video predictions from the admin interface.

### Anxiety classification

Anxiety-Classification supports two analysis flows:

1. **Questionnaire-based analysis** — a participant completes a questionnaire while facial video is recorded. The submitted answers, calculated score, profile, video references, extracted features, detected events, and prediction metadata are associated with the response.
2. **Standalone video analysis** — an authorized user uploads a facial video without completing a questionnaire. The system stores the video, processes it asynchronously, and exposes the result through a token-protected result page.

The analysis pipeline processes facial regions across video frames, estimates local motion, builds a temporal motion signal, detects candidate events, extracts event-level features, validates the feature schema, and sends the resulting tabular data to the classifier. Results include processing status, final anxiety classification, probability, model metadata, frame-level predictions, spotting signals, detected events, synchronized video playback, and failure details when processing cannot be completed.

## Research and method context

The predictor uses a POC-ABS-based motion-estimation approach for facial micro-expression analysis. POC-ABS (Phase-Only Correlation with All Block Search) is used to estimate localized motion between facial-region frames. The implementation divides regions into blocks, applies phase-only correlation, derives motion vectors and quadrant features, aggregates motion magnitudes into a temporal signal, and identifies candidate facial-motion events before feature extraction.

The resulting event and questionnaire features are passed to **TabR (Tabular Deep Learning Meets Nearest Neighbors)** for tabular anxiety classification. The repository includes the TabR implementation/artifacts and the experiment-specific feature schema used by the predictor.

### Related research

- [A Novel Approach on Motion Estimation for Micro-Expression Recognition Using Phase Only Correlation with All Block Search (POC-ABS)](https://www.researchgate.net/publication/349585407_A_Novel_Approach_on_Motion_Estimation_for_Micro-Expression_Recognition_Using_Phase_Only_Correlation_with_All_Block_Search_POC-ABS)
- [TabR: Tabular Deep Learning Meets Nearest Neighbors in 2023](https://arxiv.org/abs/2307.14338)

## Architecture

This repository is a Moonrepo monorepo. Moon manages the web application and predictor as separate projects, while the root project coordinates development, builds, checks, database tasks, and shared workflow commands.

```text
Browser
  -> apps/web (TanStack Start / React)
  -> PostgreSQL through Drizzle ORM and Effect services
  -> local video storage
  -> apps/predictor (Python gRPC service)
  -> prediction and response records
```

## Moon projects

```text
.               root Moon project and workspace orchestration
apps/web        TypeScript frontend, server functions, admin dashboard, DB/API layer
apps/predictor  Python gRPC predictor and Intel RealSense camera server
proto           shared gRPC contract
video_uploads   local runtime video storage
```

Projects are declared in `.moon/workspace.yml` and configured through each project's `moon.yml`.

## Technology

| Area | Technology |
| --- | --- |
| Web app | TanStack Start, React 19, TanStack Router |
| Runtime | Bun, TanStack server functions |
| Services | Effect |
| Database | PostgreSQL, Drizzle ORM |
| Authentication | Database-backed sessions, secure cookies, bcrypt |
| UI | Tailwind CSS, Radix-style components |
| Data UI | TanStack Query, TanStack Table, TanStack Form, Recharts |
| Video | Browser MediaRecorder, FFmpeg, Intel RealSense |
| Predictor | Python, gRPC, OpenCV, dlib, PyTorch, TABR |
| Validation | Effect Schema / Pydantic |
| Quality | Biome, Vitest, Ruff, Pyright, Pytest |

## Requirements

- Bun
- PostgreSQL
- Python 3.11+
- `uv`
- FFmpeg for non-browser-playable video conversion
- Intel RealSense SDK for RealSense capture

## Setup

Install the workspace dependencies and configure the environment from the repository root:

```bash
bun install
uv sync
cp .env.example .env
```

Configure the database and application settings in `.env`. Run database migrations through Moon:

```bash
moon run web:db-generate
moon run web:db-migrate
```

## Development

Run the web app and predictor together through the root Moon project:

```bash
moon run root:dev
```

Run individual projects when needed:

```bash
moon run web:dev
moon run predictor:dev
moon run predictor:camera
```

## Moon commands

```bash
# Workspace
moon run root:dev
moon run root:build --log warn
moon run root:check

# Web project
moon run web:build
moon run web:lint
moon run web:format
moon run web:check
moon run web:test
moon run web:db-generate
moon run web:db-migrate
moon run web:db-studio

# Predictor project
moon run predictor:sync
moon run predictor:test
moon run predictor:lint
moon run predictor:type
moon run predictor:proto
```

The underlying project commands can also be run from `apps/web` or `apps/predictor`, but Moon commands are the standard workspace interface.

## Prediction model

The predictor uses vendored TABR artifacts and feature-parity sources:

```text
apps/predictor/vendor/tabular-dl-tabr-official
apps/predictor/vendor/convat
```

The default experiment is configured through environment variables, including the experiment name, evaluation seed, checkpoint, threshold, aggregation method, and execution device. See `apps/predictor/README.md` and the predictor settings for details.

## Runtime video storage

Uploaded media is stored locally under `video_uploads/` and is intentionally ignored by Git:

```text
video_uploads/
├── full/{participant}_{timestamp}/
│   ├── recording_main.webm
│   └── recording_realsense.avi
├── segmented/{participant}_{timestamp}/q{n}/
└── predict-video/{prediction-id}/
```
