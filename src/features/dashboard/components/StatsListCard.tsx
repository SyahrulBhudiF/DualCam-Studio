import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";

type StatsListItem = {
	id: string;
	primary: string;
	meta: string;
};

type StatsListCardProps = {
	className?: string;
	title: string;
	description: string;
	items: StatsListItem[];
	emptyMessage: string;
};

function StatsListItemRow({ item }: { item: StatsListItem }) {
	return (
		<div className="flex items-center justify-between border-b border-border/40 pb-2 last:border-b-0 last:pb-0">
			<div>
				<div className="text-sm font-medium">{item.primary}</div>
				<div className="text-xs text-muted-foreground">{item.meta}</div>
			</div>
		</div>
	);
}

export function StatsListCard({
	className,
	title,
	description,
	items,
	emptyMessage,
}: StatsListCardProps) {
	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				{items.length === 0 ? (
					<div className="text-sm text-muted-foreground">{emptyMessage}</div>
				) : (
					items.map((item) => <StatsListItemRow key={item.id} item={item} />)
				)}
			</CardContent>
		</Card>
	);
}
