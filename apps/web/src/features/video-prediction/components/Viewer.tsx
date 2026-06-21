import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { useQuery } from "@tanstack/react-query";
import {
	MediaPlayer,
	type MediaPlayerInstance,
	MediaProvider,
} from "@vidstack/react";
import {
	DefaultVideoLayout,
	defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import { useCallback, useMemo, useRef } from "react";
import {
	getAdminVideoPrediction,
	getPublicVideoPrediction,
} from "@/apis/video-prediction";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import { cn } from "@/utils/utils";
import { useViewerState } from "../hooks/useViewerState";
import type { ClipEvent, Prediction, ViewerMode } from "../types";
import {
	clearSeekPause,
	markSeekPause,
	stopSeekAutoplay,
} from "../hooks/playbackGuard";
import {
	seekTarget,
	seekPaused,
} from "../hooks/seek";
import {
	createMediaTimeStore,
	SpotChartWithTime,
	VidstackSync,
} from "./MediaSync";
import { ResultPanel } from "./ResultPanel";

export function Viewer({ mode }: { mode: ViewerMode }) {
	const playerRef = useRef<MediaPlayerInstance>(null);
	const seekPauseRef = useRef(false);
	const mediaTimeStore = useMemo(
		() => createMediaTimeStore(),
		[],
	);
	const predictionId = mode.predictionId;
	const token = mode.kind === "public" ? mode.token : undefined;
	const predictionQuery = useQuery({
		queryFn: () =>
			mode.kind === "public"
				? getPublicVideoPrediction({
						data: { predictionId, token: mode.token },
					})
				: getAdminVideoPrediction({ data: { predictionId } }),
		queryKey: ["video-prediction", mode.kind, predictionId, token],
		refetchInterval: (query) => {
			const status = query.state.data?.status;
			return status === "pending" || status === "running" ? 1500 : false;
		},
	});
	const prediction = predictionQuery.data;

	const visibleEvents = useMemo(
		() =>
			(prediction?.events ?? []).filter(
				(event: Prediction["events"][number]) =>
					typeof event.onsetTimeSeconds === "number" &&
					typeof event.offsetTimeSeconds === "number",
			),
		[prediction?.events],
	);
	const { currentTime, selectEvent, selectedEventNo, syncVideoTime } =
		useViewerState(visibleEvents);
	const activeEvent = useMemo(
		() =>
			visibleEvents.find(
				(event) =>
					(event.onsetTimeSeconds ?? -1) <= currentTime &&
					currentTime <= (event.offsetTimeSeconds ?? -1),
			) ?? null,
		[visibleEvents, currentTime],
	);

	const selectedEvent = useMemo(
		() =>
			prediction?.events.find(
				(event: Prediction["events"][number]) =>
					event.eventNo === selectedEventNo,
			) ?? null,
		[prediction?.events, selectedEventNo],
	);
	const displayedEvent = selectedEvent ?? activeEvent ?? null;

	const seekToEvent = useCallback(
		(event: Prediction["events"][number] | ClipEvent) => {
			const player = playerRef.current;
			if (!player) return;
			const target = seekTarget(event, player.duration);
			if (typeof target !== "number") return;

			selectEvent({ ...event, apexTimeSeconds: target });
			markSeekPause(seekPauseRef);
			seekPaused(player, target);
		},
		[selectEvent],
	);
	if (predictionQuery.isLoading) {
		return (
			<main className="min-h-screen bg-muted/40 p-6">
				<Card>
					<CardContent className="pt-6">Memuat prediksi video…</CardContent>
				</Card>
			</main>
		);
	}

	if (!prediction) {
		return (
			<main className="min-h-screen bg-muted/40 p-6">
				<Card>
					<CardContent className="pt-6">
						Prediksi tidak ditemukan atau token tidak valid.
					</CardContent>
				</Card>
			</main>
		);
	}

	return (
		<main
			className={cn(
				"flex overflow-hidden bg-muted/40",
				mode.kind === "public"
					? "fixed inset-0"
					: "h-[calc(100svh-4rem)] border-t",
			)}
		>
			<section className="h-full min-w-0 flex-1 overflow-y-auto p-4 lg:p-5">
				<div className="space-y-4">
					<header className="flex items-end justify-between gap-4">
						<div>
							<p className="text-muted-foreground text-xs">Prediksi Video</p>
							<h1 className="font-semibold text-xl tracking-tight">
								Hasil Prediksi Kecemasan
							</h1>
						</div>
						<div className="hidden rounded-full border bg-muted px-3 py-1 text-muted-foreground text-sm md:block">
							{prediction.status === "completed"
								? "Analisis selesai"
								: "Memproses"}
						</div>
					</header>

					<Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
						<CardContent className="min-w-0 p-3">
							<MediaPlayer
								className="aspect-video w-full overflow-hidden rounded-md bg-black text-white [&_[data-media-provider]]:justify-center [&_[data-media-provider]>video]:!h-full [&_[data-media-provider]>video]:!w-full [&_[data-media-provider]>video]:!object-contain"
								onPlay={() => {
									stopSeekAutoplay(
										seekPauseRef,
										playerRef.current,
									);
								}}
								onPlaying={() => {
									stopSeekAutoplay(
										seekPauseRef,
										playerRef.current,
									);
								}}
								onPointerDown={() => {
									clearSeekPause(seekPauseRef);
								}}
								playsInline
								ref={playerRef}
								src={`/api/video/${prediction.playbackVideoPath ?? prediction.videoPath}`}
							>
								<MediaProvider />
								<VidstackSync
									events={visibleEvents}
									onEventTimeChange={syncVideoTime}
									timeStore={mediaTimeStore}
								/>
								<DefaultVideoLayout icons={defaultLayoutIcons} />
							</MediaPlayer>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
						<CardHeader className="shrink-0 py-3">
							<div className="flex items-start justify-between gap-4">
								<div>
									<CardTitle className="text-base">
										Chart Magnitude Spotting
									</CardTitle>
									<CardDescription className="text-xs">
										Playhead bergerak mengikuti video. Klik spike/area event
										untuk seek.
									</CardDescription>
								</div>
								<div className="rounded-full bg-muted px-3 py-1 text-muted-foreground text-sm">
									{`${prediction.eventCount ?? prediction.events.length} event`}
								</div>
							</div>
						</CardHeader>
						<CardContent className="min-w-0 space-y-4">
							<SpotChartWithTime
								activeEventNo={displayedEvent?.eventNo ?? null}
								events={visibleEvents}
								onSelectEvent={seekToEvent}
								signal={prediction.spottingSignal}
								timeStore={mediaTimeStore}
							/>
						</CardContent>
					</Card>
				</div>
			</section>

			<ResultPanel
				activeEvent={displayedEvent}
				currentTime={currentTime}
				onSelectEvent={seekToEvent}
				prediction={prediction}
			/>
		</main>
	);
}
