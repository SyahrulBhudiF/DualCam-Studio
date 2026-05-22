import { format } from "date-fns";
import { CalendarIcon, Filter, X } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/Popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/Select";
import { ALL_FILTER_VALUE } from "@/libs/hooks/use-filters";
import { useResponseFilterStore } from "@/libs/store/ResponseFilterStore";
import { cn } from "@/utils/utils";
import type { FilterOptions } from "../responses.types";

type ResponseFiltersProps = {
	filterOptions?: FilterOptions;
	onFilterClear: () => void;
};

export function ResponseFilters({
	filterOptions,
	onFilterClear,
}: ResponseFiltersProps) {
	const {
		questionnaireId,
		className,
		name,
		startDate,
		endDate,
		setFilter,
		resetFilters,
	} = useResponseFilterStore();
	const uniqueNames = useMemo(
		() => [...new Set(filterOptions?.names ?? [])],
		[filterOptions?.names],
	);

	const handleClearFilters = () => {
		resetFilters();
		onFilterClear();
	};

	const hasActiveFilters = Boolean(
		questionnaireId !== ALL_FILTER_VALUE ||
			className !== ALL_FILTER_VALUE ||
			startDate ||
			endDate ||
			name !== ALL_FILTER_VALUE,
	);
	// Show loading skeleton if filterOptions not ready
	if (!filterOptions) {
		return (
			<div className="flex flex-wrap items-center gap-3 p-4 border rounded-lg bg-muted/30 animate-pulse">
				<div className="flex items-center gap-2">
					<Filter className="size-4 text-muted-foreground" />
					<span className="text-sm font-medium">Filters:</span>
				</div>
				<div className="h-10 w-[200px] bg-muted rounded" />
				<div className="h-10 w-[150px] bg-muted rounded" />
				<div className="h-10 w-[150px] bg-muted rounded" />
			</div>
		);
	}

	return (
		<div className="flex flex-wrap items-center gap-3 p-4 border rounded-lg bg-muted/30">
			<div className="flex items-center gap-2">
				<Filter className="size-4 text-muted-foreground" />
				<span className="text-sm font-medium">Filters:</span>
			</div>

			<Select
				value={questionnaireId}
				onValueChange={(value) => setFilter("questionnaireId", value)}
			>
				<SelectTrigger className="w-[200px]">
					<SelectValue placeholder="All Questionnaires" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ALL_FILTER_VALUE}>All Questionnaires</SelectItem>
					{filterOptions.questionnaires.map((q) => (
						<SelectItem key={q.id} value={q.id}>
							{q.title}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select value={name} onValueChange={(value) => setFilter("name", value)}>
				<SelectTrigger className="w-[150px]">
					<SelectValue placeholder="All Profiles" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ALL_FILTER_VALUE}>All Profiles</SelectItem>
					{uniqueNames.map((q) => (
						<SelectItem key={q} value={q}>
							{q}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select
				value={className}
				onValueChange={(value) => setFilter("className", value)}
			>
				<SelectTrigger className="w-[150px]">
					<SelectValue placeholder="All Classes" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ALL_FILTER_VALUE}>All Classes</SelectItem>
					{filterOptions.classes.map((c) => (
						<SelectItem key={c} value={c}>
							{c}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"w-[140px] justify-start text-left font-normal",
							!startDate && "text-muted-foreground",
						)}
					>
						<CalendarIcon className="mr-2 size-4" />
						{startDate ? format(startDate, "dd/MM/yyyy") : "Start Date"}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={startDate}
						onSelect={(date) => setFilter("startDate", date)}
						initialFocus
					/>
				</PopoverContent>
			</Popover>

			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"w-[140px] justify-start text-left font-normal",
							!endDate && "text-muted-foreground",
						)}
					>
						<CalendarIcon className="mr-2 size-4" />
						{endDate ? format(endDate, "dd/MM/yyyy") : "End Date"}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={endDate}
						onSelect={(date) => setFilter("endDate", date)}
						initialFocus
					/>
				</PopoverContent>
			</Popover>

			{hasActiveFilters && (
				<Button
					variant="ghost"
					size="sm"
					onClick={handleClearFilters}
					className="cursor-pointer"
				>
					<X className="size-4 mr-1" />
					Clear
				</Button>
			)}
		</div>
	);
}
