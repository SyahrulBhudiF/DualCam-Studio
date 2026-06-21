import { memo, useMemo } from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ReferenceArea,
	ReferenceLine,
	XAxis,
	YAxis,
} from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/Chart";
import type { ChartClick, ClipEvent, PlotPoint, Signal } from "../types";

function fallbackData(events: ClipEvent[]): PlotPoint[] {
	return events
		.flatMap((event) => {
			if (
				typeof event.onsetTimeSeconds !== "number" ||
				typeof event.apexTimeSeconds !== "number" ||
				typeof event.offsetTimeSeconds !== "number"
			) {
				return [];
			}
			const peak =
				typeof event.probabilityAnxietyTinggi === "number"
					? event.probabilityAnxietyTinggi
					: 1;
			return [
				makePoint(event, event.onsetTimeSeconds, 0),
				makePoint(event, event.apexTimeSeconds, peak),
				makePoint(event, event.offsetTimeSeconds, 0),
			];
		})
		.sort((a, b) => a.timeSeconds - b.timeSeconds);
}

function makePoint(
	event: ClipEvent,
	timeSeconds: number,
	magnitude: number,
): PlotPoint {
	const frameIndex = Math.max(Math.round(timeSeconds * 30), 0);
	return {
		event,
		eventMarker: "",
		eventNo: event.eventNo,
		frameIndex,
		rawMagnitude: magnitude,
		signalIndex: frameIndex,
		smoothedMagnitude: magnitude,
		timeSeconds,
	};
}

const CHART_PLOT_RIGHT_PX = 18;

export function SpotChart({
	activeEventNo,
	currentTime,
	events,
	onSelectEvent,
	signal,
}: {
	activeEventNo: number | null;
	currentTime: number;
	events: ClipEvent[];
	onSelectEvent: (event: ClipEvent) => void;
	signal: Signal | null | undefined;
}) {
	const eventByNo = useMemo(
		() => new Map(events.map((event) => [event.eventNo, event])),
		[events],
	);
	const signalPoints = useMemo(
		() =>
			(signal?.points ?? []).map((point) => ({
				...point,
				event:
					point.eventNo > 0 ? (eventByNo.get(point.eventNo) ?? null) : null,
			})),
		[eventByNo, signal?.points],
	);
	const fallback = useMemo(() => fallbackData(events), [events]);
	const points = signalPoints.length > 0 ? signalPoints : fallback;
	const isFallback = signalPoints.length === 0;
	if (points.length === 0) {
		return (
			<div className="flex h-72 items-center justify-center rounded-2xl border bg-muted/25 text-muted-foreground text-sm">
				Belum ada event atau magnitude signal untuk chart.
			</div>
		);
	}

	return (
		<div className="rounded-2xl border bg-muted/20 p-3">
			{isFallback ? (
				<div className="mb-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 text-xs">
					Prediksi lama belum punya JSON magnitude. Chart ini fallback dari
					onset-apex-offset; rerun prediksi untuk magnitude asli.
				</div>
			) : null}
			<div className="relative h-72 w-full">
				<StaticChart
					activeEventNo={activeEventNo}
					currentTime={currentTime}
					events={events}
					isFallback={isFallback}
					onSelectEvent={onSelectEvent}
					points={points}
					signal={signal}
				/>
			</div>
		</div>
	);
}

type StaticChartProps = {
	activeEventNo: number | null;
	currentTime: number;
	events: ClipEvent[];
	isFallback: boolean;
	onSelectEvent: (event: ClipEvent) => void;
	points: PlotPoint[];
	signal: Signal | null | undefined;
};

const StaticChart = memo(function StaticChart({
	activeEventNo,
	currentTime,
	events,
	isFallback,
	onSelectEvent,
	points,
	signal,
}: StaticChartProps) {
	return (
		<ChartContainer
			className="h-full w-full"
			config={{
				rawMagnitude: { color: "#94a3b8", label: "Raw magnitude" },
				smoothedMagnitude: { color: "#06b6d4", label: "Smoothed magnitude" },
			}}
		>
			<LineChart
				data={points}
				margin={{ bottom: 8, left: 8, right: CHART_PLOT_RIGHT_PX, top: 18 }}
				onClick={(state) => {
					const event = (state as ChartClick).activePayload?.[0]?.payload?.event;
					if (event) onSelectEvent(event);
				}}
			>
				<CartesianGrid strokeDasharray="3 3" vertical={false} />
				<XAxis
					allowDecimals
					dataKey="timeSeconds"
					domain={["dataMin", "dataMax"]}
					tickFormatter={(value: number) => `${value.toFixed(1)}s`}
					type="number"
				/>
				<YAxis width={46} />
				<ChartTooltip
					content={
						<ChartTooltipContent
							label="Magnitude"
							valueFormatter={(value) => value.toFixed(4)}
						/>
					}
				/>
				{events.map((event) => {
					if (
						typeof event.onsetTimeSeconds !== "number" ||
						typeof event.offsetTimeSeconds !== "number"
					) {
						return null;
					}
					const active = event.eventNo === activeEventNo;
					return (
						<ReferenceArea
							fill={active ? "#06b6d4" : "#71717a"}
							fillOpacity={active ? 0.18 : 0.07}
							key={event.eventNo}
							x1={event.onsetTimeSeconds}
							x2={event.offsetTimeSeconds}
						/>
					);
				})}
				{events.map((event) =>
					typeof event.apexTimeSeconds === "number" ? (
						<ReferenceLine
							key={`apex-${event.eventNo}`}
							stroke={event.eventNo === activeEventNo ? "#0891b2" : "#a1a1aa"}
							strokeDasharray="2 4"
							x={event.apexTimeSeconds}
						/>
					) : null,
				)}
				{signal?.heightThreshold && !isFallback ? (
					<ReferenceLine
						stroke="#f97316"
						strokeDasharray="5 5"
						y={signal.heightThreshold}
					/>
				) : null}
				<ReferenceLine
					stroke="#71717a"
					strokeDasharray="4 4"
					strokeWidth={2}
					x={currentTime}
				/>
				{isFallback ? null : (
					<Line
						activeDot={{ r: 4, strokeWidth: 2 }}
						dataKey="rawMagnitude"
						dot={false}
						isAnimationActive={false}
						name="rawMagnitude"
						stroke="var(--color-rawMagnitude)"
						strokeOpacity={0.35}
						strokeWidth={1.5}
						type="linear"
					/>
				)}
				<Line
					activeDot={{ r: 4, strokeWidth: 2 }}
					dataKey="smoothedMagnitude"
					dot={false}
					isAnimationActive={false}
					name="smoothedMagnitude"
					stroke="var(--color-smoothedMagnitude)"
					strokeWidth={3}
					type="linear"
				/>
			</LineChart>
		</ChartContainer>
	);
});
