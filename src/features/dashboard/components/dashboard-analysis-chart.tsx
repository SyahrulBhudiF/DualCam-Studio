import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from"@/components/ui/card";


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

function formatValue(value: number) {
	return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

export function DashboardAnalysisChart({
	title,
	subtitle,
	data,
	maxValue,
	isLoading = false,
	emptyMessage ="No data available",
}: DashboardAnalysisChartProps) {
	const safeData = (data ?? []).map((d) => ({
		label: d.label,
		value: d.value,
	}));
	const maxVal =
		maxValue ??
		(safeData.length > 0 ? Math.max(...safeData.map((d) => d.value)) : 10);

	return (
		<Card className="flex h-full flex-col">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{subtitle && <CardDescription>{subtitle}</CardDescription>}
			</CardHeader>
			<CardContent className="flex-1">
				{isLoading ? (
					<div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
						Loading…
					</div>
				) : safeData.length === 0 ? (
					<div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
						{emptyMessage}
					</div>
				) : (
					<div className="min-h-[300px] space-y-3">
						{safeData.map((item) => {
							const percentage = Math.max(
								0,
								Math.min(100, maxVal > 0 ? (item.value / maxVal) * 100 : 0),
							);

							return (
								<div key={item.label} className="grid gap-1.5">
									<div className="flex items-start justify-between gap-4 text-sm">
										<span className="line-clamp-2 text-muted-foreground">
											{item.label}
										</span>
										<span className="shrink-0 font-medium tabular-nums text-foreground">
											{formatValue(item.value)}
										</span>
									</div>
									<div className="h-2.5 overflow-hidden bg-muted">
										<div
											className="h-full bg-primary transition-[width] duration-500 ease-out"
											style={{ width: `${percentage}%` }}
										/>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
