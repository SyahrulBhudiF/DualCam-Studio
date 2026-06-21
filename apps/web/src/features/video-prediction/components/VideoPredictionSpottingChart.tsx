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

type SpottingSignalPoint = {
	frameIndex: number;
	signalIndex: number;
	timeSeconds: number;
	rawMagnitude: number;
	smoothedMagnitude: number;
	eventNo: number;
	eventMarker: string;
};

type SpottingSignal = {
	fps: number;
	heightThreshold: number;
	points: ReadonlyArray<SpottingSignalPoint>;
};

type VideoPredictionEvent = {
	eventNo: number;
	onsetTimeSeconds: number | null;
	apexTimeSeconds: number | null;
	offsetTimeSeconds: number | null;
	[key: string]: unknown;
};

type ChartPoint = SpottingSignalPoint & {
	event: VideoPredictionEvent | null;
};

function fallbackSpikePoints(events: VideoPredictionEvent[]): ChartPoint[] {
	return events.flatMap((event) => {
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
			makeFallbackPoint(event, event.onsetTimeSeconds, 0),
			makeFallbackPoint(event, event.apexTimeSeconds, peak),
			makeFallbackPoint(event, event.offsetTimeSeconds, 0),
		];
	}).sort((a, b) => a.timeSeconds - b.timeSeconds);
}

function makeFallbackPoint(
	event: VideoPredictionEvent,
	timeSeconds: number,
	magnitude: number,
): ChartPoint {
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

type ChartClickState = {
	activePayload?: Array<{ payload?: ChartPoint }>;
};

export function VideoPredictionSpottingChart({
	activeEventNo,
	currentTime,
	events,
	onSelectEvent,
	signal,
}: {
	activeEventNo: number | null;
	currentTime: number;
	events: VideoPredictionEvent[];
	onSelectEvent: (event: VideoPredictionEvent) => void;
	signal: SpottingSignal | null | undefined;
}) {
	const eventByNo = new Map(events.map((event) => [event.eventNo, event]));
	const signalPoints = (signal?.points ?? []).map((point) => ({
		...point,
		event: point.eventNo > 0 ? eventByNo.get(point.eventNo) ?? null : null,
	}));
	const points = signalPoints.length > 0 ? signalPoints : fallbackSpikePoints(events);
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
					Prediksi lama belum punya JSON magnitude. Chart ini fallback dari onset-apex-offset; rerun prediksi untuk magnitude asli.
				</div>
			) : null}
			<ChartContainer
				className="h-72 w-full"
				config={{
					rawMagnitude: { color: "#94a3b8", label: "Raw magnitude" },
					smoothedMagnitude: { color: "#06b6d4", label: "Smoothed magnitude" },
				}}
			>
				<LineChart
					data={points}
					margin={{ bottom: 8, left: 8, right: 18, top: 18 }}
					onClick={(state) => {
						const event = (state as ChartClickState).activePayload?.[0]?.payload?.event;
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
					<ReferenceLine stroke="#18181b" strokeDasharray="4 4" x={currentTime} />
					{isFallback ? null : (
						<Line
							dataKey="rawMagnitude"
							dot={false}
							name="rawMagnitude"
							stroke="var(--color-rawMagnitude)"
							strokeOpacity={0.35}
							strokeWidth={1.5}
							type="linear"
						/>
					)}
					<Line
						activeDot={{ r: 5 }}
						dataKey="smoothedMagnitude"
						dot={isFallback ? { r: 3 } : false}
						name="smoothedMagnitude"
						stroke="var(--color-smoothedMagnitude)"
						strokeWidth={3}
						type="linear"
					/>
				</LineChart>
			</ChartContainer>
		</div>
	);
}
