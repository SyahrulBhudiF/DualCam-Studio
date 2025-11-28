# QUIS

A client-first React application for administering questionnaires while recording video responses. Built with TanStack Start / TanStack Router and Supabase; supports full-session and per-question (segmented) recording, including optional RealSense secondary capture.

## Key features
- Student profile and mode selection (full or segmented recording).
- Full-session recording or per-question segmented recording with incremental uploads.
- Secondary camera support: standard webcam (MediaRecorder) or RealSense via WebSocket.
- Server-side handlers persist profiles, answers, and metadata to Supabase and save video files to disk.

## Quick start
1. Install dependencies:
   - Using Bun: `bun install`
   - (Alternatively) npm / yarn / pnpm may be used if preferred.
2. Provide required environment variables (server-side):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. Run development server:
   - `bun run dev`
4. Optional: start the camera helper (if using the bundled Python WebSocket camera server):
   - `bun run camera` (this runs `server-camera.py` via `uv`)

## Important paths & endpoints
- Local video storage: `video_uploads/` (created at runtime by server handlers).
- RealSense WebSocket (client expects): `ws://localhost:8080`
- Server functions are defined under `src/apis/*`:
  - Auth and user: `src/apis/user.ts`
  - Questionnaire and submission: `src/apis/questionnaire.ts`
  - Chunked upload and segmented submission: `src/apis/segmented-upload.ts`

## Database tables (expected)
The application interacts with these tables in Supabase:
- `questionnaires`
- `questions` (with nested `answers`)
- `answers`
- `profiles`
- `responses`
- `response_details`

Ensure appropriate schema and permissions are configured in your Supabase project.

## Notes & troubleshooting
- Grant camera and microphone permissions in the browser before starting.
- If using RealSense, ensure the WebSocket camera server is running and reachable at `ws://localhost:8080`.
- Server writes files to disk; confirm permissions and available disk space for `video_uploads/`.
- Authentication relies on Supabase Auth; verify cookies and server/client configuration match your deployment.

## Development
- Install (if needed): `bun install`
- Dev: `bun run dev`
- Build: `bun run build`
- Start: `bun run start`
- Camera helper: `bun run camera` (uses `uv` to run `server-camera.py`)
- Lint / format: `bunx biome lint .`, `bunx biome format .` (see `package.json` scripts for full list)

---
Keep configuration and credentials out of source control. If you want, I can add a `.env.example` and a simple database migration outline.