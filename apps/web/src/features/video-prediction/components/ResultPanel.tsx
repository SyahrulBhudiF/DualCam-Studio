import { Card, CardContent } from "@/components/ui/Card";
import type { FullEvent } from "../types";

type ResultPanelProps = {
	activeEvent: FullEvent | null;
	currentTime: number;
	onSelectEvent: (event: FullEvent) => void;
	prediction: {
		status: string;
		label: string | null;
		probabilityAnxietyTinggi: number | null;
		threshold: number | null;
		frameCount: number | null;
		eventCount: number | null;
		errorMessage: string | null;
		events: FullEvent[];
	};
};

const statusLabels: Record<string, string> = {
	completed: "Selesai",
	failed: "Gagal",
	pending: "Menunggu",
	running: "Dianalisis",
};

const anxietyLabels: Record<string, string> = {
	anxiety_rendah: "Kecemasan Rendah",
	anxiety_tinggi: "Kecemasan Tinggi",
};

export function ResultPanel({
	activeEvent,
	currentTime,
	onSelectEvent,
	prediction,
}: ResultPanelProps) {
	const finalProbability =
		typeof prediction.probabilityAnxietyTinggi === "number"
			? `${(prediction.probabilityAnxietyTinggi * 100).toFixed(1)}%`
			: "-";
	const finalLabel = prediction.label
		? (anxietyLabels[prediction.label] ?? prediction.label)
		: "-";

	return (
		<aside className="h-full w-[380px] shrink-0 overflow-y-auto border-l bg-zinc-950 p-4 text-zinc-50">
			<div className="space-y-4">
				<section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/25">
					<div className="flex items-start justify-between gap-3">
						<div>
							<p className="text-zinc-400 text-xs">Hasil final</p>
							<h2 className="mt-1 font-semibold text-2xl tracking-tight">
								{finalLabel}
							</h2>
						</div>
						<span className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-300">
							{statusLabels[prediction.status] ?? prediction.status}
						</span>
					</div>

					<div className="mt-8">
						<div className="font-semibold text-6xl tracking-[-0.06em] tabular-nums">
							{finalProbability}
						</div>
						<p className="mt-2 text-sm text-zinc-400">
							Probabilitas kecemasan tinggi
						</p>
					</div>

					<div className="mt-5 grid grid-cols-3 gap-2">
						<Metric label="Threshold" value={formatPercent(prediction.threshold)} />
						<Metric label="Frame" value={prediction.frameCount ?? "-"} />
						<Metric label="Event" value={prediction.eventCount ?? prediction.events.length} />
					</div>
				</section>

				<section className="rounded-3xl border border-white/10 bg-zinc-900 p-4">
					<div className="flex items-center justify-between gap-3">
						<div>
							<p className="font-semibold">Event dipilih</p>
							<p className="text-zinc-500 text-xs">Waktu video {currentTime.toFixed(2)}s</p>
						</div>
						<div className="rounded-2xl bg-cyan-300 px-3 py-2 font-semibold text-zinc-950 text-sm">
							E{activeEvent?.eventNo ?? "-"}
						</div>
					</div>

					<div className="mt-4 grid grid-cols-3 gap-2">
						<Marker label="Onset" frame={activeEvent?.onsetFrame} time={activeEvent?.onsetTimeSeconds} />
						<Marker label="Apex" frame={activeEvent?.apexFrame} time={activeEvent?.apexTimeSeconds} accent />
						<Marker label="Offset" frame={activeEvent?.offsetFrame} time={activeEvent?.offsetTimeSeconds} />
					</div>

					<div className="mt-3 rounded-2xl bg-white/[0.06] p-3">
						<p className="text-zinc-500 text-xs">Label event</p>
						<p className="mt-1 font-medium">
							{activeEvent?.label ? (anxietyLabels[activeEvent.label] ?? activeEvent.label) : "-"}
						</p>
						<p className="mt-1 text-zinc-400 text-xs">
							Prob. tinggi {formatPercent(activeEvent?.probabilityAnxietyTinggi)}
						</p>
					</div>
				</section>

				<section className="rounded-3xl border border-white/10 bg-zinc-900 p-4">
					<div className="mb-3 flex items-center justify-between">
						<p className="font-semibold">Daftar event</p>
						<span className="text-zinc-500 text-xs">klik untuk seek</span>
					</div>
					<div className="space-y-2">
						{prediction.events.map((event) => {
							const selected = activeEvent?.eventNo === event.eventNo;
							return (
								<button
									className={`grid w-full grid-cols-[44px_1fr_auto] items-center gap-3 rounded-2xl p-3 text-left transition ${
										selected
											? "bg-cyan-300 text-zinc-950"
											: "bg-white/[0.06] text-zinc-100 hover:bg-white/[0.1]"
									}`}
									key={event.eventNo}
									onClick={() => onSelectEvent(event)}
									type="button"
								>
									<span className="font-semibold tabular-nums">E{event.eventNo}</span>
									<span className="min-w-0">
										<span className="block truncate font-medium text-sm">
											{formatRange(event.onsetTimeSeconds, event.offsetTimeSeconds)}
										</span>
										<span className={selected ? "text-zinc-700 text-xs" : "text-zinc-500 text-xs"}>
											Apex {formatTime(event.apexTimeSeconds)}
										</span>
									</span>
									<span className="font-semibold text-sm tabular-nums">
										{formatPercent(event.probabilityAnxietyTinggi)}
									</span>
								</button>
							);
						})}
					</div>
				</section>

				{prediction.errorMessage ? (
					<Card className="border-red-400/30 bg-red-950/40 text-red-100 shadow-sm">
						<CardContent className="p-4 text-sm">
							<p className="font-medium">Error</p>
							<p className="mt-1 text-red-100/75">{prediction.errorMessage}</p>
						</CardContent>
					</Card>
				) : null}
			</div>
		</aside>
	);
}

function Metric({ label, value }: { label: string; value: number | string }) {
	return (
		<div className="rounded-2xl bg-white/[0.08] p-3">
			<p className="text-zinc-500 text-xs">{label}</p>
			<p className="mt-1 font-semibold tabular-nums">{value}</p>
		</div>
	);
}

function Marker({
	accent,
	frame,
	label,
	time,
}: {
	accent?: boolean;
	frame?: number;
	label: string;
	time?: number | null;
}) {
	return (
		<div className={accent ? "rounded-2xl bg-cyan-300 p-3 text-zinc-950" : "rounded-2xl bg-white/[0.06] p-3"}>
			<p className={accent ? "text-zinc-700 text-xs" : "text-zinc-500 text-xs"}>{label}</p>
			<p className="mt-1 font-semibold tabular-nums">F{frame ?? "-"}</p>
			<p className={accent ? "text-zinc-700 text-xs" : "text-zinc-400 text-xs"}>{formatTime(time)}</p>
		</div>
	);
}

function formatPercent(value?: number | null) {
	return typeof value === "number" ? `${(value * 100).toFixed(1)}%` : "-";
}

function formatTime(value?: number | null) {
	return typeof value === "number" ? `${value.toFixed(2)}s` : "-";
}

function formatRange(start?: number | null, end?: number | null) {
	return `${formatTime(start)} – ${formatTime(end)}`;
}
