import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/utils/utils";

export type ChartConfig = Record<
	string,
	{
		label?: React.ReactNode;
		color?: string;
	}
>;

type ChartContextProps = {
	config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
	const context = React.useContext(ChartContext);
	if (!context) throw new Error("useChart must be used within ChartContainer");
	return context;
}

function ChartContainer({
	id,
	className,
	children,
	config,
	...props
}: React.ComponentProps<"div"> & {
	config: ChartConfig;
	children: React.ComponentProps<
		typeof RechartsPrimitive.ResponsiveContainer
	>["children"];
}) {
	const uniqueId = React.useId();
	const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

	return (
		<ChartContext.Provider value={{ config }}>
			<div
				data-chart={chartId}
				className={cn(
					"flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-grid_line]:stroke-border/50 [&_.recharts-tooltip-cursor]:stroke-border",
					className,
				)}
				{...props}
			>
				<ChartStyle id={chartId} config={config} />
				<RechartsPrimitive.ResponsiveContainer>
					{children}
				</RechartsPrimitive.ResponsiveContainer>
			</div>
		</ChartContext.Provider>
	);
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
	const colorConfig = Object.entries(config).filter(([, item]) => item.color);
	if (!colorConfig.length) return null;

	return (
		<style
			dangerouslySetInnerHTML={{
				__html: colorConfig
					.map(([key, item]) => `[data-chart=${id}] { --color-${key}: ${item.color}; }`)
					.join("\n"),
			}}
		/>
	);
}

const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
	active,
	payload,
	label,
	className,
	valueFormatter,
}: {
	active?: boolean;
	payload?: Array<{
		color?: string;
		dataKey?: string | number;
		name?: string | number;
		value?: string | number;
	}>;
	label?: React.ReactNode;
	className?: string;
	valueFormatter?: (value: number) => React.ReactNode;
}) {
	const { config } = useChart();
	if (!active || !payload?.length) return null;

	return (
		<div
			className={cn(
				"grid min-w-32 gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs shadow-xl",
				className,
			)}
		>
			{label ? <div className="font-medium">{label}</div> : null}
			{payload.map((item) => {
				const key = `${item.dataKey ?? item.name ?? "value"}`;
				const itemConfig = config[key];
				return (
					<div key={key} className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-2">
							<span
								className="size-2 rounded-full"
								style={{ backgroundColor: item.color }}
							/>
							<span className="text-muted-foreground">
								{itemConfig?.label ?? item.name ?? key}
							</span>
						</div>
						<span className="font-mono font-medium">
							{typeof item.value === "number"
								? (valueFormatter?.(item.value) ?? item.value.toFixed(3))
								: item.value}
						</span>
					</div>
				);
			})}
		</div>
	);
}

export { ChartContainer, ChartTooltip, ChartTooltipContent };
