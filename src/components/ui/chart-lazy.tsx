import * as React from "react";
import { cn } from "@/utils/utils";
import type { ChartConfig } from "./chart";

const THEMES = { light: "", dark: ".dark" } as const;

type RechartsModule = typeof import("recharts");
type ResponsiveContainerProps = React.ComponentProps<
	RechartsModule["ResponsiveContainer"]
>;
type TooltipProps = React.ComponentProps<RechartsModule["Tooltip"]>;

type ChartContextProps = {
	config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);
const ResponsiveContainer = React.lazy(async () => {
	const mod = await import("recharts");
	return { default: mod.ResponsiveContainer };
});
const Tooltip = React.lazy(async () => {
	const mod = await import("recharts");
	return { default: mod.Tooltip };
});

function useChart() {
	const context = React.use(ChartContext);

	if (!context) {
		throw new Error("useChart must be used within a <ChartContainer />");
	}

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
	children: ResponsiveContainerProps["children"];
}) {
	const uniqueId = React.useId();
	const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

	return (
		<ChartContext.Provider value={{ config }}>
			<div
				data-slot="chart"
				data-chart={chartId}
				className={cn(
					"[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
					className,
				)}
				{...props}
			>
				<ChartStyle id={chartId} config={config} />
				<ResponsiveContainer>{children}</ResponsiveContainer>
			</div>
		</ChartContext.Provider>
	);
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
	const css = Object.entries(THEMES).reduce((themeCss, [theme, prefix]) => {
		const declarations = Object.entries(config).reduce<string[]>(
			(acc, [key, itemConfig]) => {
				const color =
					itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
					itemConfig.color;

				if (color) acc.push(`  --color-${key}: ${color};`);
				return acc;
			},
			[],
		);

		if (declarations.length === 0) return themeCss;

		return `${themeCss}${prefix} [data-chart=${id}] {\n${declarations.join("\n")}\n}\n`;
	}, "");

	if (!css) {
		return null;
	}

	return <style>{css}</style>;
};

function ChartTooltip(props: TooltipProps) {
	return <Tooltip {...props} />;
}

function ChartTooltipContent({
	active,
	payload,
	className,
	indicator = "dot",
	hideLabel = false,
	hideIndicator = false,
	label,
	labelFormatter,
	labelClassName,
	formatter,
	color,
	nameKey,
	labelKey,
}: TooltipProps &
	React.ComponentProps<"div"> & {
		hideLabel?: boolean;
		hideIndicator?: boolean;
		indicator?: "line" | "dot" | "dashed";
		nameKey?: string;
		labelKey?: string;
	}) {
	const { config } = useChart();

	if (!active || !payload?.length) {
		return null;
	}

	const [firstItem] = payload;
	const labelConfigKey = `${labelKey || firstItem?.dataKey || firstItem?.name || "value"}`;
	const labelItemConfig = getPayloadConfigFromPayload(
		config,
		firstItem,
		labelConfigKey,
	);
	const labelValue =
		!labelKey && typeof label === "string"
			? config[label as keyof typeof config]?.label || label
			: labelItemConfig?.label;
	const tooltipLabel =
		hideLabel || !labelValue ? null : labelFormatter ? (
			<div className={cn("font-medium", labelClassName)}>
				{labelFormatter(labelValue, payload)}
			</div>
		) : (
			<div className={cn("font-medium", labelClassName)}>{labelValue}</div>
		);

	const nestLabel = payload.length === 1 && indicator !== "dot";

	return (
		<div
			className={cn(
				"border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
				className,
			)}
		>
			{!nestLabel ? tooltipLabel : null}
			<div className="grid gap-1.5">
				{payload.reduce<React.ReactNode[]>((items, item, index) => {
					if (item.type === "none") return items;
					const key = `${nameKey || item.name || item.dataKey || "value"}`;
					const itemConfig = getPayloadConfigFromPayload(config, item, key);
					const indicatorColor = color || item.payload.fill || item.color;

					items.push(
						<div
							key={item.dataKey}
							className={cn(
								"[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
								indicator === "dot" && "items-center",
							)}
						>
							{formatter && item?.value !== undefined && item.name ? (
								formatter(item.value, item.name, item, index, item.payload)
							) : (
								<>
									{itemConfig?.icon ? (
										<itemConfig.icon />
									) : (
										!hideIndicator && (
											<div
												className={cn(
													"shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
													{
														"h-2.5 w-2.5": indicator === "dot",
														"w-1": indicator === "line",
														"w-0 border-[1.5px] border-dashed bg-transparent":
															indicator === "dashed",
														"my-0.5": nestLabel && indicator === "dashed",
													},
												)}
												style={
													{
														"--color-bg": indicatorColor,
														"--color-border": indicatorColor,
													} as React.CSSProperties
												}
											/>
										)
									)}
									<div
										className={cn(
											"flex flex-1 justify-between leading-none",
											nestLabel ? "items-end" : "items-center",
										)}
									>
										<div className="grid gap-1.5">
											{nestLabel ? tooltipLabel : null}
											<span className="text-muted-foreground">
												{itemConfig?.label || item.name}
											</span>
										</div>
										{item.value && (
											<span className="text-foreground font-mono font-medium tabular-nums">
												{item.value.toLocaleString()}
											</span>
										)}
									</div>
								</>
							)}
						</div>,
					);
					return items;
				}, [])}
			</div>
		</div>
	);
}

function getPayloadConfigFromPayload(
	config: ChartConfig,
	payload: unknown,
	key: string,
) {
	if (typeof payload !== "object" || payload === null) {
		return undefined;
	}

	const payloadPayload =
		"payload" in payload &&
		typeof payload.payload === "object" &&
		payload.payload !== null
			? payload.payload
			: undefined;

	let configLabelKey: string = key;

	if (
		key in payload &&
		typeof payload[key as keyof typeof payload] === "string"
	) {
		configLabelKey = payload[key as keyof typeof payload] as string;
	} else if (
		payloadPayload &&
		key in payloadPayload &&
		typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
	) {
		configLabelKey = payloadPayload[
			key as keyof typeof payloadPayload
		] as string;
	}

	return configLabelKey in config
		? config[configLabelKey]
		: config[key as keyof typeof config];
}

export { ChartContainer, ChartTooltip, ChartTooltipContent };
