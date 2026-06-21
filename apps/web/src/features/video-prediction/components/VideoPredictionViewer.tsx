import { useQuery } from "@tanstack/react-query";
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
import {
	type VideoPredictionTimelineEvent,
	useVideoPredictionViewerMachine,
} from "../hooks/useVideoPredictionViewerMachine";
import { VideoPredictionResultSidebar } from "./VideoPredictionResultSidebar";
import { VideoPredictionSpottingChart } from "./VideoPredictionSpottingChart";

type ViewerMode =
	| { kind: "public"; predictionId: string; token: string }
	| { kind: "admin"; predictionId: string };

type Prediction = NonNullable<
	Awaited<ReturnType<typeof getPublicVideoPrediction>>
>;

export function VideoPredictionViewer({ mode }: { mode: ViewerMode }) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const eventListRef = useRef<HTMLDivElement>(null);
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
		useVideoPredictionViewerMachine(visibleEvents);
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
				(event: Prediction["events"][number]) => event.eventNo === selectedEventNo,
			) ?? null,
		[prediction?.events, selectedEventNo],
	);
	const displayedEvent = selectedEvent ?? activeEvent ?? prediction?.events[0] ?? null;

	const seekToEvent = useCallback(
		(event: Prediction["events"][number] | VideoPredictionTimelineEvent) => {
			const target = selectEvent(event);
			if (typeof target === "number" && videoRef.current) {
				videoRef.current.currentTime = target;
			}
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
		<main className="fixed inset-0 flex overflow-hidden bg-muted/40">
			<section className="h-full min-w-0 flex-1 overflow-y-auto p-4 lg:p-5">
				<div className="space-y-4">
					<header className="flex items-end justify-between gap-4">
						<div className="space-y-1">
							<p className="text-muted-foreground text-sm">Prediksi Video</p>
							<h1 className="font-semibold text-2xl tracking-tight">
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
						<CardHeader className="pb-2">
							<CardTitle>Video Analisis</CardTitle>
							<CardDescription>
								Putar video untuk mencocokkan event spotting dengan hasil final.
							</CardDescription>
						</CardHeader>
						<CardContent className="min-w-0">
							<video
								ref={videoRef}
								className="aspect-video max-h-[46vh] w-full rounded-md bg-black object-contain"
								controls
								src={`/api/video/${prediction.playbackVideoPath ?? prediction.videoPath}`}
								onSeeked={(event) => syncVideoTime(event.currentTarget.currentTime)}
								onTimeUpdate={(event) =>
									syncVideoTime(event.currentTarget.currentTime)
								}
							>
								<track kind="captions" label="Tidak ada caption" />
							</video>
						</CardContent>
					</Card>

					<Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
						<CardHeader className="pb-2">
							<div className="flex items-start justify-between gap-4">
								<div>
											<CardTitle>Chart Magnitude Spotting</CardTitle>
									<CardDescription>
										Magnitude per frame dari Python spotting. Klik spike/area event untuk seek video dan sync sidebar.
									</CardDescription>
								</div>
								<div className="rounded-full bg-muted px-3 py-1 text-muted-foreground text-sm">
									{`${prediction.eventCount ?? prediction.events.length} event`}
								</div>
							</div>
						</CardHeader>
						<CardContent className="min-w-0 space-y-4">
							<VideoPredictionSpottingChart
								activeEventNo={displayedEvent?.eventNo ?? null}
								currentTime={currentTime}
								events={visibleEvents}
								onSelectEvent={seekToEvent}
								signal={prediction.spottingSignal}
							/>
						</CardContent>
					</Card>

					{mode.kind === "admin" ? (
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-base">Daftar Event</CardTitle>
								<CardDescription>
									Ringkasan onset, apex, offset. Tidak menampilkan prediksi per-frame.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div ref={eventListRef} className="max-h-80 space-y-2 overflow-auto">
									{prediction.events.map((event) => (
										<button
											className="grid w-full grid-cols-[80px_1fr] gap-3 rounded-xl border bg-background p-3 text-left transition-colors hover:bg-muted/50"
											key={event.eventNo}
											onClick={() => seekToEvent(event)}
											type="button"
										>
											<div>
												<div className="font-semibold text-sm">Event {event.eventNo}</div>
												<div className="text-muted-foreground text-xs">
													{typeof event.probabilityAnxietyTinggi === "number"
														? `${(event.probabilityAnxietyTinggi * 100).toFixed(1)}%`
														: "-"}
												</div>
											</div>
											<div className="grid grid-cols-3 gap-2 text-sm">
												<EventPoint label="Onset" frame={event.onsetFrame} time={event.onsetTimeSeconds} />
												<EventPoint label="Apex" frame={event.apexFrame} time={event.apexTimeSeconds} />
												<EventPoint label="Offset" frame={event.offsetFrame} time={event.offsetTimeSeconds} />
											</div>
										</button>
									))}
								</div>
							</CardContent>
						</Card>
					) : null}
				</div>
			</section>

			<VideoPredictionResultSidebar
				activeEvent={displayedEvent}
				currentTime={currentTime}
				onSelectEvent={seekToEvent}
				prediction={prediction}
			/>
		</main>
	);
}

function EventMini({ label, time }: { label: string; time: number | null }) {
	return (
		<div className="rounded-lg bg-muted/70 px-2 py-1.5">
			<div className="text-muted-foreground">{label}</div>
			<div className="font-semibold tabular-nums">
				{typeof time === "number" ? `${time.toFixed(2)}s` : "-"}
			</div>
		</div>
	);
}

function EventPoint({
	frame,
	label,
	time,
}: {
	frame: number | null;
	label: string;
	time: number | null;
}) {
	return (
		<div className="rounded-lg bg-muted/60 px-3 py-2">
			<div className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
				{label}
			</div>
			<div className="mt-1 font-semibold">
				F{typeof frame === "number" ? frame : "-"}
			</div>
			<div className="text-muted-foreground text-xs">
				{typeof time === "number" ? `${time.toFixed(2)}s` : "-"}
			</div>
		</div>
	);
}

export type { ViewerMode };
