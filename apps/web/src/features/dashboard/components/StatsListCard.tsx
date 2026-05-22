import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/Tooltip";

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
	pageSize?: number;
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
	pageSize,
}: StatsListCardProps) {
	const [page, setPage] = useState(0);
	const totalPages = pageSize ? Math.ceil(items.length / pageSize) : 1;
	const visibleItems = pageSize
		? items.slice(page * pageSize, page * pageSize + pageSize)
		: items;

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
					visibleItems.map((item) => (
						<StatsListItemRow key={item.id} item={item} />
					))
				)}
				{pageSize && items.length > pageSize && (
					<div className="flex items-center justify-between pt-1">
						<div className="text-xs text-muted-foreground">
							Page {page + 1} of {totalPages}
						</div>
						<div className="flex gap-2">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPage((current) => current - 1)}
										disabled={page === 0}
										className="cursor-pointer"
									>
										<ChevronLeft className="size-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Previous page</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPage((current) => current + 1)}
										disabled={page >= totalPages - 1}
										className="cursor-pointer"
									>
										<ChevronRight className="size-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Next page</TooltipContent>
							</Tooltip>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
