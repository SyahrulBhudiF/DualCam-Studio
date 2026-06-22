import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { useQuery } from "@tanstack/react-query";
import { Activity, Loader2, Play } from "lucide-react";
import {
	MediaPlayer,
	type MediaPlayerInstance,
	MediaProvider,
} from "@vidstack/react";
import {
	DefaultVideoLayout,
	defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	getAdminVideoPrediction,
	getPublicVideoPrediction,
} from "@/apis/video-prediction";
import { Button } from "@/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/Dialog";
import { cn } from "@/utils/utils";
import { useViewerState } from "../hooks/useViewerState";
import { cutSignal, eventStep, useReplay } from "../hooks/useReplay";
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
	const inspectSeekRef = useRef<number | null>(null);
	const [mediaKey, setMediaKey] = useState(0);
	const mediaTimeStore = useMemo(
		() => createMediaTimeStore(),
		[],
	);
	const replay = useReplay();
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
			return status === "pending" || status === "running" ? 500 : false;
		},
	});
	const prediction = predictionQuery.data;

	useEffect(() => {
		if (!prediction) return;
		if (prediction.status === "failed") replay.send({ type: "fail" });
		if (prediction.status === "completed") replay.send({ type: "ready" });
	}, [prediction, replay.send]);

	const visibleEvents = useMemo(
		() =>
			(prediction?.events ?? []).filter(
				(event: Prediction["events"][number]) =>
					typeof event.onsetTimeSeconds === "number" &&
					typeof event.offsetTimeSeconds === "number" &&
					(replay.showFinal ||
						eventStep(event, replay.maxTime) !== "hide"),
			),
		[prediction?.events, replay.maxTime, replay.showFinal],
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

	const signal = useMemo(
		() => cutSignal(prediction?.spottingSignal, replay.maxTime, replay.showFinal),
		[prediction?.spottingSignal, replay.maxTime, replay.showFinal],
	);

	const sendTime = useCallback(
		(timeSeconds: number) => {
			if (replay.isLive) replay.send({ type: "time", value: timeSeconds });
		},
		[replay.isLive, replay.send],
	);

	const sendDuration = useCallback(
		(duration: number) => replay.send({ type: "duration", value: duration }),
		[replay.send],
	);

	useEffect(() => {
		const target = inspectSeekRef.current;
		const player = playerRef.current;
		if (target === null || !player) return;

		const frame = requestAnimationFrame(() => {
			seekPaused(player, target);
			mediaTimeStore.setCurrentTime(target);
			syncVideoTime(target);
			inspectSeekRef.current = null;
		});
		return () => cancelAnimationFrame(frame);
	}, [mediaKey, mediaTimeStore, syncVideoTime]);

	const startReplay = useCallback(() => {
		const player = playerRef.current;
		replay.send({ type: "start" });
		if (!player) return;
		player.currentTime = 0;
		void player.play();
	}, [replay.send]);

	const seekToEvent = useCallback(
		(event: Prediction["events"][number] | ClipEvent) => {
			const player = playerRef.current;
			if (!player) return;
			const target = seekTarget(event, player.duration);
			if (typeof target !== "number") return;

			if (replay.phase === "done") {
				replay.send({ type: "view" });
				selectEvent({ ...event, apexTimeSeconds: target });
				mediaTimeStore.setCurrentTime(target);
				syncVideoTime(target);
				inspectSeekRef.current = target;
				setMediaKey((key) => key + 1);
				return;
			}

			selectEvent({ ...event, apexTimeSeconds: target });
			markSeekPause(seekPauseRef);
			seekPaused(player, target);
		},
		[mediaTimeStore, replay.phase, replay.send, selectEvent, syncVideoTime],
	);
	if (predictionQuery.isLoading) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
				<Card className="w-full max-w-xl overflow-hidden border-border/70 bg-card shadow-sm">
					<CardContent className="p-0">
						<div className="h-1 overflow-hidden bg-muted">
							<div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
						</div>
						<div className="space-y-6 p-8">
							<div className="flex items-center gap-4">
								<div className="relative flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
									<Activity className="size-6" />
									<Loader2 className="absolute size-14 animate-spin text-primary/25" />
								</div>
								<div>
									<p className="font-semibold text-xl tracking-tight">
										Memuat prediksi video
									</p>
									<p className="mt-1 text-muted-foreground text-sm">
										Menyiapkan video, event, dan sinyal analisis.
									</p>
								</div>
							</div>

							<div className="grid gap-3">
								<div className="h-3 w-3/4 animate-pulse rounded-full bg-muted" />
								<div className="h-3 w-1/2 animate-pulse rounded-full bg-muted" />
								<div className="mt-2 h-24 animate-pulse rounded-2xl bg-muted/70" />
							</div>
						</div>
					</CardContent>
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
			<Dialog open={prediction.status === "pending" || prediction.status === "running"}>
				<DialogContent className="max-w-md rounded-3xl p-0" showCloseButton={false}>
					<div className="space-y-5 p-6">
						<div className="flex items-start gap-4">
							<div className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
								<Activity className="size-5" />
								<Loader2 className="absolute size-12 animate-spin text-primary/25" />
							</div>
							<DialogHeader className="gap-2 text-left">
								<DialogTitle>Menyiapkan hasil video</DialogTitle>
								<DialogDescription>
									File sedang disiapkan untuk halaman hasil. Tombol mulai akan
									muncul setelah data siap ditampilkan.
								</DialogDescription>
							</DialogHeader>
						</div>
						<div className="h-2 overflow-hidden rounded-full bg-muted">
							<div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
						</div>
					</div>
				</DialogContent>
			</Dialog>
			<Dialog open={prediction.status === "completed" && replay.phase === "ready"}>
				<DialogContent className="max-w-md rounded-3xl p-0" showCloseButton={false}>
					<div className="space-y-6 p-6">
						<div className="flex items-start gap-4">
							<div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
								<Play className="size-5 fill-current" />
							</div>
							<DialogHeader className="gap-2 text-left">
								<DialogTitle>Hasil siap ditampilkan</DialogTitle>
								<DialogDescription>
									Tekan mulai untuk melihat hasil muncul bertahap mengikuti video.
								</DialogDescription>
							</DialogHeader>
						</div>
						<Button className="h-11 w-full rounded-full" onClick={startReplay}>
							Mulai Analisis
						</Button>
					</div>
				</DialogContent>
			</Dialog>
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
							{headerStatus(replay.phase, prediction.status)}
						</div>
					</header>

					<Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
						<CardContent className="min-w-0 p-3">
							<MediaPlayer
								key={mediaKey}
								className="aspect-video w-full overflow-hidden rounded-md bg-black text-white [&_[data-media-provider]]:justify-center [&_[data-media-provider]>video]:!h-full [&_[data-media-provider]>video]:!w-full [&_[data-media-provider]>video]:!object-contain"
								onEnded={() => replay.send({ type: "done" })}
								onPause={() => {
									if (replay.phase === "play") replay.send({ type: "pause" });
								}}
								onPlay={() => {
									if (replay.phase === "pause") replay.send({ type: "play" });
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
									onDurationChange={sendDuration}
									onEventTimeChange={syncVideoTime}
									onTimeChange={sendTime}
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
								signal={signal}
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
				phase={replay.phase}
				prediction={{ ...prediction, events: visibleEvents }}
				showFinal={replay.showFinal}
			/>
		</main>
	);
}

function headerStatus(phase: string, status: string) {
	if (phase === "ready") return "Siap dianalisis";
	if (phase === "play") return "Memutar hasil";
	if (phase === "pause") return "Dijeda";
	if (phase === "done") return "Analisis selesai";
	if (phase === "view") return "Meninjau event";
	return status === "pending" || status === "running" ? "Menyiapkan" : status;
}
