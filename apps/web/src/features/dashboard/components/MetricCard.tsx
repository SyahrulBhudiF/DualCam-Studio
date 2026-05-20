import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

type MetricCardProps = {
	title: string;
	value: string | number;
	description: string;
};

export function MetricCard({ title, value, description }: MetricCardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				<p className="text-muted-foreground text-xs">{description}</p>
			</CardContent>
		</Card>
	);
}
