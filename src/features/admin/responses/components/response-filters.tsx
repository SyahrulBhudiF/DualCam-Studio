import { useMutation, useQueryClient } from"@tanstack/react-query";
import { format } from"date-fns";
import { CalendarIcon, Filter, X } from"lucide-react";
import { useCallback, useEffect, useMemo } from"react";
import { getResponsesFiltered } from"@/apis/admin/responses";
import { Button } from"@/components/ui/button";
import { Calendar } from"@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from"@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from"@/components/ui/select";
import { cn } from"@/utils/utils";
import type { FilterOptions, ResponseListItem } from"../responses.types";
import {
	ALL_FILTER_VALUE,
	useResponseFiltersState,
} from"./hooks/use-response-filters-state";

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
	const {
		questionnaireId,
		className,
		name,
		startDate,
		endDate,
		setQuestionnaireId,
		setClassName,
		setName,
		setStartDate,
		setEndDate,
		resetFilters,
	} = useResponseFiltersState();
	const queryClient = useQueryClient();

	const filterMutation = useMutation({
		mutationFn: getResponsesFiltered,
		onSuccess: (data) => {
			queryClient.setQueryData(["admin","responses","filtered"], data);
			onFilterApply(data);
		},
	});

	const filterPayload = useMemo(
		() => ({
			questionnaireId,
			className,
			startDate,
			endDate,
			name,
		}),
		[questionnaireId, className, startDate, endDate, name],
	);
	const uniqueNames = useMemo(
		() => [...new Set(filterOptions?.names ?? [])],
		[filterOptions?.names],
	);

	const handleApplyFilters = useCallback(() => {
		filterMutation.mutate({
			data: {
				questionnaireId:
					questionnaireId !== ALL_FILTER_VALUE ? questionnaireId : undefined,
				className: className !== ALL_FILTER_VALUE ? className : undefined,
				startDate: startDate ? startDate.toISOString() : undefined,
				endDate: endDate ? endDate.toISOString() : undefined,
				name: name !== ALL_FILTER_VALUE ? name : undefined,
			},
		});
	}, [filterMutation, questionnaireId, className, startDate, endDate, name]);

	useEffect(() => {
		handleApplyFilters();
	}, [filterPayload]);

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
			<div className="flex flex-wrap items-center gap-3 p-4 border bg-muted/30 animate-pulse">
				<div className="flex items-center gap-2">
					<Filter className="size-4 text-muted-foreground" />
					<span className="text-sm font-medium">Filters:</span>
				</div>
				<div className="h-10 w-[200px] bg-muted" />
				<div className="h-10 w-[150px] bg-muted" />
				<div className="h-10 w-[150px] bg-muted" />
			</div>
		);
	}

	return (
		<div className="flex flex-wrap items-center gap-3 p-4 border bg-muted/30">
			<div className="flex items-center gap-2">
				<Filter className="size-4 text-muted-foreground" />
				<span className="text-sm font-medium">Filters:</span>
			</div>

			<Select value={questionnaireId} onValueChange={setQuestionnaireId}>
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

			<Select value={name} onValueChange={setName}>
				<SelectTrigger className="w-[150px]" onBlur={handleApplyFilters}>
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

			<Select value={className} onValueChange={setClassName}>
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
						className={cn("w-[140px] justify-start text-left font-normal",
							!startDate &&"text-muted-foreground",
						)}
					>
						<CalendarIcon className="mr-2 size-4" />
						{startDate ? format(startDate,"dd/MM/yyyy") :"Start Date"}
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
						className={cn("w-[140px] justify-start text-left font-normal",
							!endDate &&"text-muted-foreground",
						)}
					>
						<CalendarIcon className="mr-2 size-4" />
						{endDate ? format(endDate,"dd/MM/yyyy") :"End Date"}
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
