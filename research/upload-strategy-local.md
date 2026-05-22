# Code Context

## Files Retrieved
1. `apps/web/src/apis/segmented-upload.ts` (lines 1-99) - segmented upload serverFns; current base64 chunk + final submit flow.
2. `apps/web/src/apis/questionnaire.ts` (lines 46-145) - older full-questionnaire submit path; also base64 save path.
3. `apps/web/src/infrastructure/services/file-upload.ts` (lines 20-206) - all upload filesystem logic; path safety + base64 decode + public path mapping.
4. `apps/web/src/infrastructure/schemas/questionnaire.ts` (lines 67-108) - upload/request payload shapes; current contract for serverFns.
5. `apps/web/src/routes/api/video/$.ts` (lines 1-104) - TanStack Start server route for video serving; range streaming + path guard.
6. `apps/web/src/features/questionnaire/segmented/index.tsx` (lines 60-176) - client-side upload orchestration; base64 generation + per-question chunk upload.
7. `apps/web/src/features/admin/responses/video-manifest.ts` (lines 41-160) - URL/path normalization for playback; defines route expectations.
8. `apps/web/src/features/admin/responses/ResponseDetail.tsx` (lines 24-180) - fallback path construction for segmented mode; mirrors upload naming scheme.
9. `apps/web/src/apis/prediction.ts` (lines 240-289) - prediction path normalization; consumes same `/video_uploads/...` layout.
10. `apps/web/src/infrastructure/config/index.ts` (lines 40-42) - upload root config env; single storage root source.

## Key Code
- `uploadVideoChunk` is a POST `createServerFn` taking `folderName`, `fileName`, `fileBase64`, then calling `FileUploadService.uploadChunk` after CSRF.
- `FileUploadService.uploadChunk`:
  - resolves within `UPLOAD_ROOT`
  - blocks absolute / escaping paths
  - base64-decodes in memory via `Buffer.from(base64Data, "base64")`
  - writes file with `fs.writeFile`
  - returns public path `/video_uploads/...`
- `submitQuestionnaire` still uses the same service for base64 main/secondary videos.
- `routes/api/video/$` is already streaming-friendly on download side:
  - `fs.createReadStream`
  - `Range` handling with `206`
  - `Accept-Ranges: bytes`
  - public path root is `UPLOAD_ROOT`
- Client segmented upload currently:
  - `blobToBase64(blobMain)` in browser
  - uploads one base64 blob per question
  - stores returned main path plus precomputed secondary path string
  - final submit only persists metadata, not blobs.
- Playback code expects relative paths under `/video_uploads/` and filters by extension; segmented mode is path-driven, not content-driven.

## Architecture
- Storage model is file-system backed, not object-storage backed.
- `UPLOAD_ROOT` is the authoritative root for both saving and serving.
- Write path:
  1. UI captures Blob
  2. browser converts to base64
  3. serverFn validates schema
  4. Effect service decodes base64 and writes file
  5. DB stores public path / JSON path manifest
- Read path:
  1. admin/player code normalizes stored paths
  2. UI builds `/api/video/{relative-path}` URLs
  3. TanStack Start route streams video with Range support
- Segmented mode is not a separate transport layer yet; it is only a naming/layout convention plus serverFn upload.

## Start Here
- `apps/web/src/apis/segmented-upload.ts` first. It is the exact entry point deciding whether segmented upload remains base64 serverFn or moves to a route.

## Integration points
- Best current integration seam for a multipart/chunk route: keep `FileUploadService` as the filesystem writer, add a new route layer in front of it.
- Keep `routes/api/video/$.ts` unchanged for serving; it already solves streaming reads.
- Update `features/questionnaire/segmented/index.tsx` to send `FormData`/chunks directly if transport changes.
- Keep `features/admin/responses/video-manifest.ts` and `ResponseDetail.tsx` aligned with any path shape changes; they assume `/video_uploads/...`.
- If introducing chunk assembly, `FileUploadService` needs new methods for session init/append/finalize, not just `uploadChunk`.

## Migration scope
- Minimal if staying base64 serverFn:
  - no route changes
  - maybe only raise payload discipline / schema constraints
  - still limited by request size and memory copy cost
- Moderate if moving to multipart/stream route:
  - add `routes/api/upload/...` route(s)
  - add multipart/FormData parsing or raw stream handling
  - keep `FileUploadService` for path safety/write logic
  - change client mutation from `createServerFn` to `fetch`
  - preserve public path contract for downstream playback/prediction
- Larger if moving to real chunked resumable upload:
  - schema for upload session IDs + part indexes + checksum
  - temp-file staging + merge logic
  - cleanup/GC for abandoned sessions
  - response DB schema likely unchanged, but upload metadata storage may be needed.

## Risks
- `uploadChunk` decodes whole base64 payload in memory; bad for large video segments and doubles transfer overhead.
- `createServerFn` JSON body path likely less suitable for large binary uploads than multipart/stream.
- Current client does `Blob -> base64`, so browser RAM cost also scales with video size.
- Current file naming is tightly coupled to playback fallbacks (`segmented/{user}_{ts}/qN/...`); path contract changes will break admin playback unless normalized carefully.
- `routes/api/video/$` uses `process.env.UPLOAD_ROOT` fallback separate from Effect `StorageConfig`; config drift risk if env default changes.
- No visible body-size or upload-limit config found in repo; transport choice must assume host/proxy limits are unknown and potentially low.
- No resumable/chunk session cleanup exists today.

## Recommended decision
- Do **not** keep segmented upload as base64 serverFn if segments can become non-trivial video lengths or if mobile/unreliable networks are expected.
- Prefer a dedicated upload route using multipart or streamed body, but keep `FileUploadService` as the write/safety layer and keep `/api/video/*` as the serving path.
- If the goal is only a short-term local prototype, base64 serverFn is acceptable; otherwise migration is justified now.

## Open questions
1. What are the expected per-segment sizes and total questionnaire length?
2. Is resumable upload required, or is single-request multipart enough?
3. Should secondary video remain server-side generated/placeholder, or also be uploaded?
4. Should upload auth/CSRF stay browser-cookie based, or use signed upload tokens?
5. Do we need a temp-staging directory + cleanup job for interrupted sessions?
