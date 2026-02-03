import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Filter, X } from "lucide-react";
import { useState } from "react";
import { getResponsesFiltered } from "@/apis/admin/responses";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/utils/utils";
import type { FilterOptions, ResponseListItem } from "../responses.types";

const ALL_VALUE = "__all__";

type ResponseFiltersProps = {
	filterOptions?: FilterOptions;
	onFilterApply: (data: ResponseListItem[]) => void;
	onFilterClear: () => void;
};

export function ResponseFilters({
	filterOptions,
	onFilterApply,
	onFilterClear,
}: ResponseFiltersProps) {
	const [questionnaireId, setQuestionnaireId] = useState<string>(ALL_VALUE);
	const [className, setClassName] = useState<string>(ALL_VALUE);
	const [name, setName] = useState<string>(ALL_VALUE);
	const [startDate, setStartDate] = useState<Date | undefined>(undefined);
	const [endDate, setEndDate] = useState<Date | undefined>(undefined);

	const filterMutation = useMutation({
		mutationFn: getResponsesFiltered,
		onSuccess: (data) => {
			onFilterApply(data);
		},
	});

	const handleApplyFilters = () => {
		filterMutation.mutate({
			data: {
				questionnaireId:
					questionnaireId !== ALL_VALUE ? questionnaireId : undefined,
				className: className !== ALL_VALUE ? className : undefined,
				startDate: startDate ? startDate.toISOString() : undefined,
				endDate: endDate ? endDate.toISOString() : undefined,
				name: name !== ALL_VALUE ? name : undefined,
			},
		});
	};

	const handleClearFilters = () => {
		setQuestionnaireId(ALL_VALUE);
		setClassName(ALL_VALUE);
		setStartDate(undefined);
		setEndDate(undefined);
		setName(ALL_VALUE);
		onFilterClear();
	};

	const hasActiveFilters =
		questionnaireId !== ALL_VALUE ||
		className !== ALL_VALUE ||
		startDate ||
		endDate ||
		name;

	// Show loading skeleton if filterOptions not ready
	if (!filterOptions) {
		return (
			<div className="flex flex-wrap items-center gap-3 p-4 border rounded-lg bg-muted/30 animate-pulse">
				<div className="flex items-center gap-2">
					<Filter className="h-4 w-4 text-muted-foreground" />
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
				<Filter className="h-4 w-4 text-muted-foreground" />
				<span className="text-sm font-medium">Filters:</span>
			</div>

			<Select value={questionnaireId} onValueChange={setQuestionnaireId}>
				<SelectTrigger className="w-[200px]">
					<SelectValue placeholder="All Questionnaires" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ALL_VALUE}>All Questionnaires</SelectItem>
					{filterOptions.questionnaires.map((q) => (
						<SelectItem key={q.id} value={q.id}>
							{q.title}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select value={name} onValueChange={setName}>
				<SelectTrigger className="w-[150px]">
					<SelectValue placeholder="All Profiles" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ALL_VALUE}>All Profiles</SelectItem>
					{filterOptions.names.map((q) => (
						<SelectItem key={q} value={q}>
							{q}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select value={className} onValueChange={setClassName}>
				<SelectTrigger className="w-[150px]">
					<SelectValue placeholder="All Classes" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={ALL_VALUE}>All Classes</SelectItem>
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
						<CalendarIcon className="mr-2 h-4 w-4" />
						{startDate ? format(startDate, "dd/MM/yyyy") : "Start Date"}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={startDate}
						onSelect={setStartDate}
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
						<CalendarIcon className="mr-2 h-4 w-4" />
						{endDate ? format(endDate, "dd/MM/yyyy") : "End Date"}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={endDate}
						onSelect={setEndDate}
						initialFocus
					/>
				</PopoverContent>
			</Popover>

			<Button
				onClick={handleApplyFilters}
				disabled={filterMutation.isPending}
				className="cursor-pointer"
			>
				{filterMutation.isPending ? "Filtering..." : "Apply"}
			</Button>

			{hasActiveFilters && (
				<Button
					variant="ghost"
					size="sm"
					onClick={handleClearFilters}
					className="cursor-pointer"
				>
					<X className="h-4 w-4 mr-1" />
					Clear
				</Button>
			)}
		</div>
	);
}
