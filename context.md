# Code Context

## Files Retrieved
1. `apps/web/src/features/video-prediction/components/VideoPredictionViewer.tsx` (lines 60-173) - viewer state, prediction query, frame-window query, derived frames/events.
2. `apps/web/src/features/video-prediction/components/VideoPredictionViewer.tsx` (lines 197-360) - main layout, timeline window, chart rendering.
3. `apps/web/src/features/video-prediction/components/VideoPredictionResultSidebar.tsx` (lines 1-191) - result sidebar props and fixed-width/height layout.
4. `apps/web/src/apis/video-prediction.ts` (lines 55-83, 97-125) - public/admin frame-window server functions.
5. `apps/web/src/infrastructure/services/video-prediction.ts` (lines 97-210) - event fetch and frame-window DB query.
6. `apps/web/src/infrastructure/services/video-prediction.ts` (lines 275-390) - writes prediction frames/events and marks prediction completed.
7. `apps/web/src/infrastructure/db/schema.ts` (lines 130-213) - prediction/frame/event table columns and nullability.
8. `apps/web/src/components/ui/Chart.tsx` (lines 25-55) - chart container wraps Recharts ResponsiveContainer.
9. `apps/web/src/routes/predict-video/result/$predictionId.tsx` (lines 1-17) - public route entry point.
10. `apps/web/src/routes/admin/video-predictions/$predictionId.tsx` (lines 1-11) - admin route entry point.
11. `apps/web/src/components/layout/AuthenticatedLayout.tsx` (lines 1-54) - admin parent layout/header wrapper.

## Key Code

`VideoPredictionViewer` computes a moving 10s frame window from playback time:

```tsx
// apps/web/src/features/video-prediction/components/VideoPredictionViewer.tsx:68-69
const windowStart = Math.max(0, Math.floor((currentTime - 5) * 10) / 10);
const windowEnd = Math.round((windowStart + 10) * 10) / 10;
```

Frame query only runs after completed status and only fetches that 10s window:

```tsx
// apps/web/src/features/video-prediction/components/VideoPredictionViewer.tsx:85-113
const frameQuery = useQuery({
  enabled: predictionQuery.data?.status === "completed",
  queryFn: () => ...get...FrameWindow({ data: { startSeconds: windowStart, endSeconds: windowEnd } }),
  queryKey: ["video-prediction", mode.kind, predictionId, "frames", windowStart, windowEnd, token],
  staleTime: 10_000,
});
const frames = (frameQuery.data?.frames ?? []) as Frame[];
```

Timeline events are not fetched by window. They come from `prediction.events`, then client filters to the same 10s window:

```tsx
// apps/web/src/features/video-prediction/components/VideoPredictionViewer.tsx:150-159
const visibleEvents = useMemo(
  () => (prediction?.events ?? []).filter(
    (event) =>
      typeof event.onsetTimeSeconds === "number" &&
      typeof event.offsetTimeSeconds === "number" &&
      event.offsetTimeSeconds >= windowStart &&
      event.onsetTimeSeconds <= windowEnd,
  ),
  [prediction?.events, windowEnd, windowStart],
);
```

Chart is suppressed unless the current window has at least 2 frames:

```tsx
// apps/web/src/features/video-prediction/components/VideoPredictionViewer.tsx:324-327
{frames.length > 1 ? (
  <ChartContainer config={chartConfig} className="h-28 w-full">
    <LineChart data={frames}>
```

Result page layout is fixed horizontal flex with fixed-width sidebar:

```tsx
// apps/web/src/features/video-prediction/components/VideoPredictionViewer.tsx:197-200
<main className="flex h-screen overflow-hidden bg-muted/40">
  <section className="min-w-0 flex-1 overflow-y-auto p-4 lg:p-5">
```

```tsx
// apps/web/src/features/video-prediction/components/VideoPredictionResultSidebar.tsx:58-59
<aside className="h-screen w-[380px] shrink-0 overflow-y-auto border-l bg-background p-4">
```

Frame-window service normalizes bounds and filters frames by `timeSeconds`:

```ts
// apps/web/src/infrastructure/services/video-prediction.ts:180-195
const safeStart = Math.max(0, Math.min(startSeconds, endSeconds));
const safeEnd = Math.max(safeStart, Math.max(startSeconds, endSeconds));
const frames = yield* db
  .select()
  .from(videoPredictionFrames)
  .where(and(
    eq(videoPredictionFrames.predictionId, predictionId),
    gte(videoPredictionFrames.timeSeconds, safeStart),
    lte(videoPredictionFrames.timeSeconds, safeEnd),
  ))
  .orderBy(asc(videoPredictionFrames.timeSeconds));
```

DB allows nullable `timeSeconds` for frames and events, though gRPC schema requires numbers:

```ts
// apps/web/src/infrastructure/db/schema.ts:167-178
frameIndex: integer("frame_index").notNull(),
signalIndex: integer("signal_index"),
timeSeconds: doublePrecision("time_seconds"),
probabilityAnxietyTinggi: doublePrecision("probability_anxiety_tinggi").notNull(),
```

Admin route nests viewer below authenticated header:

```tsx
// apps/web/src/components/layout/AuthenticatedLayout.tsx:35-50
<SidebarInset ...>
  <div>
    <Header>...</Header>
    {children ?? <Outlet />}
  </div>
</SidebarInset>
```

## Architecture

- Public page: `/predict-video/result/$predictionId?token=...` renders `VideoPredictionViewer` in public mode.
- Admin page: `/admin/video-predictions/$predictionId` renders the same viewer inside `AuthenticatedLayout` with app sidebar + header.
- `VideoPredictionViewer` first fetches prediction detail (`video_predictions` row + all `video_prediction_events`).
- After `prediction.status === "completed"`, viewer fetches a frame window for `[windowStart, windowEnd]` based on current video time.
- Chart and current-frame sidebar use only `frameQuery.data.frames`, so they only know about the current 10s window.
- Timeline event blocks use all prediction events, but only render events intersecting current 10s window.
- Backend writes frames/events in `applyPredictVideoResponse()` before setting prediction status to completed, then frame-window APIs read `video_prediction_frames` by `time_seconds` range.

## Findings / Bugs

### 1. Sidebar can appear below content / layout breaks on constrained widths

Current viewer assumes desktop horizontal layout at all widths: `main flex h-screen`, content `flex-1`, sidebar `w-[380px] shrink-0 h-screen`. There is no responsive breakpoint or fallback. On narrow viewports or inside the admin shell (app sidebar + header reducing available width), the fixed 380px aside competes with the content area. Because the viewer is nested under an admin header but still uses `h-screen`, admin mode also creates a viewport-height child below an existing header, causing overflow/clipping pressure.

Concrete layout fixes:
- Make viewer responsive explicitly: e.g. `main` use `flex-col xl:flex-row min-h-svh xl:h-[calc(100svh-var(--header-height))]` or a known admin-content height.
- Sidebar use `w-full xl:w-[380px] shrink-0 h-auto xl:h-full overflow-y-visible xl:overflow-y-auto border-t xl:border-t-0 xl:border-l`.
- For desktop-only fixed sidebar, keep row only at `lg/xl`; below that stack intentionally, not accidentally.
- In admin route/layout, avoid child `h-screen` below `Header`; use available-height calculation or make `SidebarInset`/content own the scroll.

### 2. Chart can be empty because it is windowed and hidden for <=1 frame

Chart renders only when `frames.length > 1`. Initial `currentTime` is 0, so first request is `[0, 10]`. If frame timestamps do not fall in that range, frame rows have null/invalid `timeSeconds`, or the current window has <=1 frame, the chart disappears completely. The UI then only shows the frame-count text (`0 frame`) and no chart/empty-state.

Concrete fixes:
- Add explicit chart empty/loading/error states instead of returning `null` when `frames.length <= 1`.
- Consider fetching downsampled/full-series data for the chart separately from current-frame details. A moving 10s frame window is fine for sidebar/current frame, but a timeline/chart usually needs full-duration or downsampled global data.
- If keeping windowed chart, show window range and empty-window copy so users know they are looking at `[windowStart, windowEnd]`, not all results.
- Backend: consider making `video_prediction_frames.timeSeconds` not-null if every model frame must have it, or add fallback query by `frameIndex` when timestamps are missing.

### 3. Timeline can look empty by design because it only shows events in current 10s window

`prediction.events` may contain events, but `visibleEvents` filters only events intersecting `[windowStart, windowEnd]`. At `currentTime=0`, page shows no event if first event starts after 10s. Copy says "Tidak ada event pada jendela waktu ini", but users may interpret the whole timeline as empty. The chart is also hidden if no frames, making the whole result area look blank.

Concrete fixes:
- Add full-video event overview or minimap, not only current 10s window.
- Or auto-seek/initialize near first event when there are events and current window has none.
- Display total events and current window range near the timeline.
- Keep the current 10s zoom, but add an empty-state action: "Lompat ke event pertama".

### 4. Active/current frame sidebar can be blank even after successful prediction

`nearestFrame` reduces over only the current frame window. If the frame window is empty, sidebar `Frame Saat Ini` shows `-` even though `prediction.frameCount` may be nonzero. This is the same root as chart empty: current-window data is the only frame source.

Concrete fixes:
- Same as chart: separate current frame lookup from chart data, or fetch a slightly wider/nearest-frame query.
- Add backend endpoint for nearest frame by `currentTime` if needed.

### 5. APIs/services are simple; no server-side event-window endpoint currently

APIs expose only frame windows (`getPublicVideoPredictionFrameWindow`, `getAdminVideoPredictionFrameWindow`). Event data is always loaded as all events with prediction detail. There is no server-side event window. For large event counts, this may become heavy, but it is not the cause of empty current-window timeline.

## Start Here

Start with `apps/web/src/features/video-prediction/components/VideoPredictionViewer.tsx`. It owns both problem areas: fixed horizontal layout (`main` + sidebar placement) and the windowed frame/event rendering that makes chart/timeline appear empty.
