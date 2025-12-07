import {
	Bar,
	BarChart,
	CartesianGrid,
	LabelList,
	XAxis,
	YAxis,
} from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

type AnalysisPoint = {
	label: string;
	value: number;
};

type DashboardAnalysisChartProps = {
	title: string;
	subtitle?: string;
	data: AnalysisPoint[];
	maxValue?: number;
	isLoading?: boolean;
	emptyMessage?: string;
};

const chartConfig = {
	value: {
		label: "Score",
		color: "hsl(var(--primary))",
	},
} satisfies ChartConfig;

export function DashboardAnalysisChart({
	title,
	subtitle,
	data,
	maxValue,
	isLoading = false,
	emptyMessage = "No data available",
}: DashboardAnalysisChartProps) {
	const safeData = (data ?? []).map((d) => ({
		label: d.label,
		value: d.value,
	}));

	const maxVal =
		maxValue ??
		(safeData.length > 0 ? Math.max(...safeData.map((d) => d.value)) : 10);

	// Menambahkan buffer sekitar 15-20% agar angka di kanan tidak terpotong
	const domainMax = Math.ceil(maxVal * 1.2);

	return (
		<Card className="flex h-full flex-col">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{subtitle && <CardDescription>{subtitle}</CardDescription>}
			</CardHeader>
			<CardContent className="flex-1 pb-0">
				{isLoading ? (
					<div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
						Loading...
					</div>
				) : safeData.length === 0 ? (
					<div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
						{emptyMessage}
					</div>
				) : (
					<ChartContainer config={chartConfig} className="min-h-[300px] w-full">
						<BarChart
							accessibilityLayer
							data={safeData}
							layout="vertical"
							margin={{
								top: 0,
								right: 40, // Margin kanan ditambah untuk angka
								bottom: 0,
								left: 0,
							}}
						>
							<CartesianGrid horizontal={false} vertical={false} />
							<YAxis
								dataKey="label"
								type="category"
								tickLine={false}
								tickMargin={10}
								axisLine={false}
								fontSize={12}
								width={180}
							/>
							<XAxis
								type="number"
								dataKey="value"
								domain={[0, domainMax]}
								hide
							/>
							<ChartTooltip
								cursor={false}
								content={<ChartTooltipContent hideLabel />}
							/>
							<Bar
								dataKey="value"
								fill="var(--color-value)"
								radius={[0, 4, 4, 0]}
								barSize={32}
							>
								<LabelList
									dataKey="value"
									position="right"
									offset={8}
									className="fill-foreground font-medium"
									fontSize={12}
								/>
							</Bar>
						</BarChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
