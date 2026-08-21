# Code Context

## Files Retrieved
1. `apps/web/src/features/questionnaire/segmented/index.tsx` (lines 1-273) - segmented questionnaire UI, next-question submit/upload flow.
2. `apps/web/src/libs/hooks/use-camera-setup.ts` (lines 1-266) - browser camera/MediaRecorder lifecycle and RealSense command bridge.
3. `apps/web/src/apis/segmented-upload.ts` (lines 1-99) - server functions for per-question upload and final segmented response submit.
4. `apps/web/src/infrastructure/services/file-upload.ts` (lines 20-210) - upload path safety, base64 decode, filesystem writes, video lookup helpers.
5. `apps/web/src/components/RealSenseCanvas.tsx` (lines 1-87) - WebSocket command queue and preview frame drawing.
6. `apps/web/server-camera.py` (lines 1-139) - RealSense websocket server, segment file writing, frame broadcast loop.
7. `apps/web/src/libs/store/QuestionnaireStore.ts` (lines 1-31) - folderName, answers, prediction opt-in state.
8. `apps/web/src/infrastructure/schemas/questionnaire.ts` (lines 80-108) - UploadChunk and FinalSubmit schemas.
9. `apps/web/src/components/CameraControlPanel.tsx` (lines 1-117) - camera selector and RealSenseCanvas mounting.
10. `apps/web/src/apis/prediction.ts` (lines 160-289) - downstream segmented video path normalization and prediction input building.
11. `apps/web/src/apis/questionnaire.ts` (lines 1-130) - comparable full-session upload flow.
12. `apps/web/src/routes/api/video/$.ts` (lines 1-105) - served upload video streaming endpoint.

## Key Code

### Segmented next-question submit path
`apps/web/src/features/questionnaire/segmented/index.tsx` lines 93-148:
```ts
onSubmit: async ({ value }) => {
  setIsProcessing(true);
  realSenseRef.current?.stopRecording();
  const { blobMain } = await stopRecording();
  const base64Main = blobMain.size > 0 ? await blobToBase64(blobMain) : "";
  ...
  if (base64Main) {
    const uploadRes = await uploadMutation.mutateAsync({ data: { ... fileBase64: base64Main } });
    uploadPath = uploadRes.path;
  }
  store.addAnswer(...);
  if (currentIndex < questions.length - 1) {
    setCurrentIndex((prev) => prev + 1);
    setIsProcessing(false);
  } else {
    await submitMutation.mutateAsync({ data: finalData });
  }
}
```

Likely slowness is intentional blocking: every `Next Question` waits for:
1. RealSense STOP command send, not acked.
2. `MediaRecorder.stop()` and final chunk flush.
3. whole main blob converted to base64 in browser memory.
4. POST of base64 payload to TanStack server function.
5. server base64 decode to Buffer.
6. full file write.
7. only then UI advances and next recording starts.

### Restart delay between questions
`apps/web/src/features/questionnaire/segmented/index.tsx` lines 159-182:
```ts
if (!allReady || isProcessing || !questions) return;
const timer = setTimeout(() => {
  startRecording({ mode: "SEGMENT", folderName: store.folderName, fileName: secFileName });
}, 500);
```
There is a fixed 500ms start delay after `currentIndex` changes. Because index changes only after upload completes, upload duration directly extends dead time between questions.

### Duplicate RealSense stop
`apps/web/src/features/questionnaire/segmented/index.tsx` lines 99-100 calls:
```ts
realSenseRef.current?.stopRecording();
const { blobMain } = await stopRecording();
```
Then `useCameraSetup.stopRecording` also calls RealSense stop for `ws-realsense` at `apps/web/src/libs/hooks/use-camera-setup.ts` lines 222-229:
```ts
await stopRecorderSafe(mainRecorderRef.current);
if (deviceIdSec === "ws-realsense") {
  realSenseRef.current?.stopRecording();
}
```
This sends duplicate STOP messages. Harmless maybe, but can race/log duplicate release on Python side.

### Browser recording details
`apps/web/src/libs/hooks/use-camera-setup.ts` lines 190-217:
```ts
mainChunksRef.current = [];
mainRecorderRef.current.start(1000);
...
setTimeout(() => { isStartingRef.current = false; }, 500);
```
`start(1000)` emits chunks every second, but chunks remain in memory until stop. `stopRecorderSafe` overwrites `recorder.onstop` and resolves only on stop event (`lines 10-18`).

`allReady` ignores secondary readiness: `apps/web/src/libs/hooks/use-camera-setup.ts` line 243:
```ts
const allReady = mainReady;
```
So segmented flow can begin even if RealSense websocket/server is not actually ready. `secReady` exists and is set by RealSense open, but not used for gating.

### Upload API and filesystem write
`apps/web/src/apis/segmented-upload.ts` lines 15-30:
```ts
export const uploadVideoChunk = createServerFn({ method: "POST" })
  .inputValidator(inputValidator(UploadChunkSchema))
  .handler(async ({ data }) => runEffect(... service.uploadChunk(...)));
```
`apps/web/src/infrastructure/services/file-upload.ts` lines 117-147:
```ts
const base64Data = data.fileBase64.includes(",")
  ? data.fileBase64.split(",")[1]
  : data.fileBase64;
const buffer = Buffer.from(base64Data, "base64");
yield* saveFile(filePath, buffer);
```
This is not chunked despite name. It sends/decodes/writes entire video per question. Base64 adds ~33% transfer size and duplicates memory client + server.

### Path safety and schema gaps
Path traversal is checked in service (`file-upload.ts` lines 28-57). But schemas accept arbitrary strings (`questionnaire.ts` lines 83-87, 89-108); constraints are enforced late and only for uploaded main files. Final submit accepts arbitrary `videoMainPath`/`videoSecPath` strings.

### RealSense server flow
`apps/web/server-camera.py` lines 35-72 handles START/STOP. In SEGMENT, `fileName` comes from client; it validates absolute/`..`, creates parent dir, opens MJPG AVI writer. Lines 90-108 continuously read frames, write if recording, JPEG-encode and broadcast to clients.

No client ack exists for START/STOP. Browser assumes secondary saved at:
`/video_uploads/${store.folderName}/${secFileName}` (`segmented/index.tsx` lines 119-126), regardless of whether Python accepted/wrote/released the file.

### Prediction downstream
`apps/web/src/apis/prediction.ts` lines 168-176 prefer per-detail `videoSegmentPath`. Lines 224-248 normalize and verify existence under upload root before sending to predictor. Missing files are silently skipped.

## Architecture

Segmented flow:
1. `SegmentedPage` loads questionnaire/questions from route loader.
2. `useCameraSetup` initializes browser main camera and secondary source. Default secondary is `ws-realsense`.
3. `CameraControlPanel` always mounts previews. If secondary is RealSense, it mounts `RealSenseCanvas`, opens WebSocket to `VITE_REALSENSE_WS_URL` or `ws://localhost:8080`, and exposes imperative `startRecording/stopRecording`.
4. On mount/user, `SegmentedPage` sets `store.folderName = segmented/<safe_user>_<Date.now()>`.
5. For each question, an effect starts recording after 500ms with `folderName` and `qN/..._sec.avi` for RealSense.
6. On next/finish, UI blocks via `isProcessing`, stops recording, converts main camera blob to base64, uploads whole main file via `uploadVideoChunk`, records expected secondary path in Zustand, and advances or final-submits.
7. Final submit upserts profile, computes score, creates response with `videoPath = folderName`, and creates response details with JSON `{ main, secondary }` in `videoSegmentPath`.
8. Prediction later parses each detail video JSON, normalizes `/video_uploads/...` to upload-root relative path, checks files exist, and sends refs.

## Bottlenecks

1. **Synchronous per-question full-video upload before navigation.** `Next Question` cannot advance until `blobToBase64` + upload + disk write complete (`segmented/index.tsx` lines 99-132). This is likely the primary slowness.
2. **Base64 conversion and payload bloat.** FileReader `readAsDataURL` (`segmented/index.tsx` lines 19-24) copies whole blob into JS string and increases size. Server copies again via `Buffer.from` (`file-upload.ts` lines 134-139).
3. **Not really chunked.** API/function names say chunk but data model is one base64 string (`UploadChunkSchema`, lines 83-87). Large per-question videos hit request/body/memory limits.
4. **Fixed 500ms delay before restart.** Adds minimum gap, but larger gap is upload time because index changes after upload (`segmented/index.tsx` lines 130-132, 159-172).
5. **MediaRecorder chunks retained in memory.** `mainChunksRef` accumulates chunks until stop (`use-camera-setup.ts` lines 112-117, 195-200). Fine for short segments; bad for long answers.
6. **RealSense STOP is fire-and-forget.** No confirmation file was flushed before app stores secondary path. If final submit/prediction happens immediately, secondary AVI may still be finalizing or may not exist.
7. **RealSense broadcast loop does JPEG encode at 60 FPS while also writing AVI.** `server-camera.py` lines 98-106. CPU pressure here can affect recording or websocket responsiveness.
8. **Duplicate STOP command.** Could create extra release/log churn and masks precise state transitions.

## Integration Points

- `apps/web/src/features/questionnaire/segmented/index.tsx`: best place to decouple UI advance from upload, add upload queue/status, reduce blocking, or await secondary ack if protocol changes.
- `apps/web/src/libs/hooks/use-camera-setup.ts`: browser recording lifecycle; can expose stop result sooner/later, include secondary readiness in `allReady`, or support streaming/chunk callbacks.
- `apps/web/src/apis/segmented-upload.ts` + `FileUploadService.uploadChunk`: upload contract and write path. Any true chunking/multipart/direct Blob upload lands here.
- `apps/web/src/components/RealSenseCanvas.tsx` + `apps/web/server-camera.py`: protocol boundary for START/STOP ack, file path confirmation, errors, and ready state.
- `apps/web/src/libs/store/QuestionnaireStore.ts`: per-question answer/video state. If background uploads are introduced, store may need upload statuses/temp local ids.
- `apps/web/src/apis/prediction.ts`: validates existence later; if uploads become async, prediction must wait for all expected paths.

## Risks

- **Data integrity:** current finalData builds answers from Zustand immediately after `store.addAnswer`. Zustand `set` is synchronous in practice, but using `useQuestionnaireStore.getState().answers` after `store.addAnswer` on last question is an implicit assumption (`segmented/index.tsx` lines 121-145).
- **Secondary missing:** app records RealSense path without verifying Python wrote it (`segmented/index.tsx` lines 119-126). Prediction silently skips missing files (`prediction.ts` lines 234-236).
- **Folder may be empty at first start:** recording effect only checks `allReady`; if `store.folderName` has not been set yet, START can be sent with empty folderName (`segmented/index.tsx` lines 159-171). Python accepts empty non-abs folder? `Path("").parts` is empty, full path becomes upload root + fileName. FileUploadService would reject empty only when resolving folder as root, but RealSense server separate.
- **Secondary readiness ignored:** `allReady = mainReady`; RealSense connection failure still lets user proceed and records expected secondary paths.
- **Client/server memory spikes:** base64 full videos may crash tab or server for long recordings/many questions.
- **Filename hygiene:** main file includes raw `user?.name` (`segmented/index.tsx` line 105), not sanitized like folderName. Path traversal unlikely through filename? Name is part of a segment and service rejects path escapes only if `..` or absolute through path resolution. Slashes in user name could create subdirectories. Weird chars may affect portability.
- **Protocol concurrency:** `server-camera.py` has global `is_recording` and `video_writer`. Multiple clients or duplicate START can overwrite writer without releasing old one.
- **Non-Realsense secondary not uploaded in segmented flow:** `stopRecording` can return `blobSec`, but segmented page ignores it and always stores `.avi` RealSense-style path. If user selects normal secondary camera, secondary video is lost/wrong path.

## Validation Ideas

1. Add browser timings around submit steps: `stopRecording`, `blobToBase64`, `uploadMutation.mutateAsync`, `store.addAnswer`, index advance. Use `performance.now()` and log question index/file size.
2. Log server timings in `uploadVideoChunk`/`FileUploadService.uploadChunk`: base64 string length, decoded bytes, decode time, write time.
3. Inspect Network tab for server function request size and duration per question. Compare blob size vs base64 payload size.
4. Verify RealSense lifecycle with Python logs: START/STOP timestamps, output file exists and stable size before final submit/prediction.
5. Test long answer segment (e.g. 60s+) and note tab memory, request duration, server memory, body-size failures.
6. Test RealSense server down: page should currently proceed after main ready; confirm secondary path is still saved and prediction skips it.
7. Test normal webcam as secondary in segmented mode; confirm `blobSec` ignored and path points to missing `.avi`.
8. Test user names with spaces/slashes/unicode to validate generated main file path and server safety.
9. Run prediction opt-in immediately after finishing segmented questionnaire; check whether all secondary AVI files exist before `buildPredictionVideos`.
10. Compare CPU load of `server-camera.py` at 60 FPS broadcast/write. Lower preview FPS/JPEG quality only after measuring.

## Start Here

Open `apps/web/src/features/questionnaire/segmented/index.tsx` first. The next-question slowness is centered in `onSubmit` lines 93-148: it serially stops recording, base64-encodes the full main video, uploads/writes it, then advances. Any UX/perf fix must decide whether to keep blocking there or move upload/finalization into a background queue with explicit validation before final submit/prediction.
