import * as React from "react";

export type ChartConfig = {
	[k in string]: {
		label?: React.ReactNode;
		icon?: React.ComponentType;
	} & (
		| { color?: string; theme?: never }
		| { color?: never; theme: Record<"light" | "dark", string> }
	);
};

export const ChartContainer = React.lazy(async () => {
	const mod = await import("./chart-lazy");
	return { default: mod.ChartContainer };
});

export const ChartTooltip = React.lazy(async () => {
	const mod = await import("./chart-lazy");
	return { default: mod.ChartTooltip };
});

export const ChartTooltipContent = React.lazy(async () => {
	const mod = await import("./chart-lazy");
	return { default: mod.ChartTooltipContent };
});
