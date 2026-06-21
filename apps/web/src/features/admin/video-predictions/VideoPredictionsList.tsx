import { Link } from "@tanstack/react-router";
import { Calendar, Eye, Search, SlidersHorizontal, Video } from "lucide-react";
import { useMemo, useState } from "react";
import { Main } from "@/components/layout/Main";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import type { VideoPrediction } from "@/infrastructure/db/types";
import { cn } from "@/utils/utils";

type VideoPredictionsListProps = {
	predictions: VideoPrediction[];
};

const anxietyLabels: Record<string, string> = {
	anxiety_rendah: "Kecemasan Rendah",
	anxiety_tinggi: "Kecemasan Tinggi",
};

export function VideoPredictionsList({
	predictions,
}: VideoPredictionsListProps) {
	const [query, setQuery] = useState("");
	const filtered = useMemo(() => {
		const keyword = query.trim().toLowerCase();
		if (!keyword) return predictions;
		return predictions.filter((prediction) =>
			[
				prediction.status,
				prediction.videoPath,
				prediction.label,
				prediction.modelVersion,
				prediction.modelExpName,
			]
				.filter(Boolean)
				.some((value) => `${value}`.toLowerCase().includes(keyword)),
		);
	}, [predictions, query]);

	return (
		<Main className="space-y-4">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h2 className="font-semibold text-2xl tracking-tight">
						Video predictions
					</h2>
					<p className="text-muted-foreground">
						View video analysis runs and inspect spotting details
					</p>
				</div>
				<div className="rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground text-sm">
					{predictions.length} runs
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/35 p-4">
				<div className="flex items-center gap-2 font-medium text-sm">
					<SlidersHorizontal className="size-4" />
					Filters:
				</div>
				<div className="flex h-9 min-w-40 items-center gap-2 rounded-md border bg-background px-3 text-muted-foreground text-sm shadow-xs">
					<Video className="size-4" />
					All videos
				</div>
				<div className="flex h-9 min-w-40 items-center gap-2 rounded-md border bg-background px-3 text-muted-foreground text-sm shadow-xs">
					<Calendar className="size-4" />
					All dates
				</div>
				<div className="flex h-9 min-w-40 items-center rounded-md border bg-background px-3 text-muted-foreground text-sm shadow-xs">
					All statuses
				</div>
			</div>

			<div className="flex items-center justify-between gap-3">
				<div className="relative w-full max-w-sm">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
					<Input
						className="pl-9"
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search video predictions…"
						value={query}
					/>
				</div>
				<Button variant="outline" className="gap-2">
					<SlidersHorizontal className="size-4" />
					View
				</Button>
			</div>

			<div className="overflow-hidden rounded-md border">
				<table className="w-full caption-bottom text-sm">
					<thead className="[&_tr]:border-b">
						<tr className="border-b transition-colors hover:bg-muted/50">
							<th className="h-12 w-12 px-4 text-left align-middle font-medium text-muted-foreground">
								<Checkbox />
							</th>
							<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
								Date
							</th>
							<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
								Video
							</th>
							<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
								Status
							</th>
							<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
								Label
							</th>
							<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
								Probability
							</th>
							<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
								Frames
							</th>
							<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
								Events
							</th>
							<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
								Duration
							</th>
							<th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="[&_tr:last-child]:border-0">
						{filtered.length > 0 ? (
							filtered.map((prediction) => (
								<tr
									key={prediction.id}
									className="border-b transition-colors hover:bg-muted/50"
								>
									<td className="p-4 align-middle">
										<Checkbox />
									</td>
									<td className="p-4 align-middle text-muted-foreground tabular-nums">
										{formatDate(prediction.createdAt)}
									</td>
									<td className="p-4 align-middle">
										<div className="max-w-80 truncate font-medium">
											{prediction.videoPath}
										</div>
										<div className="mt-1 max-w-80 truncate text-muted-foreground text-xs">
											{prediction.modelVersion ?? prediction.modelExpName ?? "No model"}
										</div>
									</td>
									<td className="p-4 align-middle">
										<StatusBadge status={prediction.status} />
									</td>
									<td className="p-4 align-middle">
										{prediction.label
											? (anxietyLabels[prediction.label] ?? prediction.label)
											: "-"}
									</td>
									<td className="p-4 align-middle">
										<span className="rounded-full bg-cyan-300 px-2.5 py-1 font-semibold text-xs text-zinc-950 tabular-nums">
											{formatPercent(prediction.probabilityAnxietyTinggi)}
										</span>
									</td>
									<td className="p-4 align-middle text-muted-foreground tabular-nums">
										{prediction.frameCount ?? "-"}
									</td>
									<td className="p-4 align-middle text-muted-foreground tabular-nums">
										{prediction.eventCount ?? "-"}
									</td>
									<td className="p-4 align-middle text-muted-foreground tabular-nums">
										{formatDuration(prediction.durationSeconds)}
									</td>
									<td className="p-4 align-middle">
										<Button asChild variant="ghost" size="sm" className="gap-2">
											<Link
												params={{ predictionId: prediction.id }}
												to="/admin/video-predictions/$predictionId"
											>
												<Eye className="size-4" />
												View
											</Link>
										</Button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={10} className="h-24 text-center text-muted-foreground">
									No video predictions found.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</Main>
	);
}

function StatusBadge({ status }: { status: string }) {
	return (
		<span
			className={cn(
				"rounded-full px-2.5 py-1 font-medium text-xs capitalize",
				status === "completed"
					? "bg-emerald-100 text-emerald-700"
					: "bg-muted text-muted-foreground",
			)}
		>
			{status}
		</span>
	);
}

function formatPercent(value: number | null) {
	return typeof value === "number" ? `${(value * 100).toFixed(1)}%` : "-";
}

function formatDuration(value: number | null) {
	return typeof value === "number" ? `${value.toFixed(1)}s` : "-";
}

function formatDate(value: string | Date) {
	return new Date(value).toLocaleString("id-ID", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}
