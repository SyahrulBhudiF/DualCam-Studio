import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";

type ScoreBarPoint = {
	label: string;
	value: number;
};

type ScoreBarListProps = {
	title: string;
	subtitle?: string;
	data: ScoreBarPoint[];
	maxValue?: number;
	emptyMessage?: string;
};

function formatValue(value: number) {
	return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

export function ScoreBarList({
	title,
	subtitle,
	data,
	maxValue,
	emptyMessage = "No data available",
}: ScoreBarListProps) {
	const maxVal =
		maxValue ?? (data.length > 0 ? Math.max(...data.map((d) => d.value)) : 10);

	return (
		<Card className="flex h-full flex-col">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{subtitle && <CardDescription>{subtitle}</CardDescription>}
			</CardHeader>
			<CardContent className="flex-1">
				{data.length === 0 ? (
					<div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
						{emptyMessage}
					</div>
				) : (
					<div className="min-h-[300px] space-y-3">
						{data.map((item) => {
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
									<div className="h-2.5 overflow-hidden rounded-full bg-muted">
										<div
											className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
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
