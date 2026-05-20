import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DataTableFacetedFilter } from "./FacetedFilter";
import { DataTableViewOptions } from "./ViewOptions";

type DataTableToolbarProps<TData> = {
	table: Table<TData>;
	searchPlaceholder?: string;
	searchKey?: string;
	filters?: DataTableToolbarFilter[];
};

type DataTableToolbarFilter = {
	columnId: string;
	title: string;
	options: {
		label: string;
		value: string;
		icon?: React.ComponentType<{ className?: string }>;
	}[];
};

const EMPTY_FILTERS: DataTableToolbarFilter[] = [];

export function DataTableToolbar<TData>({
	table,
	searchPlaceholder = "Filter...",
	searchKey,
	filters = EMPTY_FILTERS,
}: DataTableToolbarProps<TData>) {
	const activeSearchValue = searchKey
		? ((table.getColumn(searchKey)?.getFilterValue() as string) ?? "")
		: (table.getState().globalFilter ?? "");
	const [searchValue, setSearchValue] = useState(activeSearchValue);
	const isFiltered =
		table.getState().columnFilters.length > 0 || table.getState().globalFilter;

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			if (searchKey) {
				table.getColumn(searchKey)?.setFilterValue(searchValue);
				return;
			}
			table.setGlobalFilter(searchValue);
		}, 300);

		return () => window.clearTimeout(timeoutId);
	}, [searchValue, searchKey, table]);

	const applySearch = () => {
		if (searchKey) {
			table.getColumn(searchKey)?.setFilterValue(searchValue);
			return;
		}
		table.setGlobalFilter(searchValue);
	};

	return (
		<div className="flex items-center justify-between">
			<div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:gap-x-2">
				<div className="relative">
					<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder={searchPlaceholder}
						value={searchValue}
						onChange={(event) => setSearchValue(event.target.value)}
						onBlur={applySearch}
						className="h-8 w-[180px] pl-9 lg:w-[280px]"
					/>
				</div>
				<div className="flex gap-x-2">
					{filters.map((filter) => {
						const column = table.getColumn(filter.columnId);
						if (!column) return null;
						return (
							<DataTableFacetedFilter
								key={filter.columnId}
								column={column}
								title={filter.title}
								options={filter.options}
							/>
						);
					})}
				</div>
				{isFiltered && (
					<Button
						variant="ghost"
						onClick={() => {
							table.resetColumnFilters();
							table.setGlobalFilter("");
							setSearchValue("");
						}}
						className="h-8 px-2 lg:px-3"
					>
						Reset
						<Cross2Icon className="ms-2 size-4" />
					</Button>
				)}
			</div>
			<DataTableViewOptions table={table} />
		</div>
	);
}
