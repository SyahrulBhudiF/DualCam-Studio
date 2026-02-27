import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { Trash } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { deleteResponses } from "@/apis/admin/responses";
import {
	DataTableBulkActions,
	DataTablePagination,
	DataTableToolbar,
} from "@/components/data-table";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import { getResponseColumns } from "./components/columns";
import { ExportResponsesButton } from "./components/response-export";
import { ResponseFilters } from "./components/response-filters";
import type { FilterOptions, ResponseListItem } from "./responses.types";

type ResponseListProps = {
	data?: ResponseListItem[];
	filterOptions?: FilterOptions;
	isLoading?: boolean;
};

export function ResponseList({
	data,
	filterOptions,
	isLoading = false,
}: ResponseListProps) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
	const [globalFilter, setGlobalFilter] = useState<string>("");
	const [filteredData, setFilteredData] = useState<ResponseListItem[] | null>(
		null,
	);

	const queryClient = useQueryClient();

	const deleteMutation = useMutation({
		mutationFn: deleteResponses,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "responses"] });
			setRowSelection({});
			toast.success("Responses deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete responses");
		},
	});

	const columns = useMemo(() => getResponseColumns(), []);

	const tableData = filteredData ?? data ?? [];

	const table = useReactTable({
		data: tableData,
		columns,
		state: { sorting, rowSelection, globalFilter },
		onSortingChange: setSorting,
		onRowSelectionChange: setRowSelection,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	const handleFilterApply = (filtered: ResponseListItem[]) => {
		setFilteredData(filtered);
		setRowSelection({});
	};

	const handleFilterClear = () => {
		setFilteredData(null);
		setRowSelection({});
	};

	return (
		<Main className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Responses</h2>
					<p className="text-muted-foreground">
						View and manage all questionnaire responses
					</p>
				</div>
				<ExportResponsesButton responses={tableData} />
			</div>

			<ResponseFilters
				filterOptions={filterOptions}
				onFilterApply={handleFilterApply}
				onFilterClear={handleFilterClear}
			/>

			<DataTableToolbar table={table} searchKey="name" />

			<div className="rounded-md border overflow-auto">
				<table className="w-full caption-bottom text-sm">
					<thead className="[&_tr]:border-b">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr
								key={headerGroup.id}
								className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
							>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody className="[&_tr:last-child]:border-0">
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<tr
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
								>
									{row.getVisibleCells().map((cell) => (
										<td
											key={cell.id}
											className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</td>
									))}
								</tr>
							))
						) : (
							<tr>
								<td colSpan={columns.length} className="h-24 text-center">
									No responses found.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			<DataTablePagination table={table} />

			<DataTableBulkActions table={table} entityName="response">
				<Button
					variant="destructive"
					size="sm"
					className="h-8 cursor-pointer"
					onClick={() => {
						const ids = table
							.getFilteredSelectedRowModel()
							.rows.map((row) => row.original.id);
						deleteMutation.mutate({ data: { ids } });
					}}
					disabled={deleteMutation.isPending}
				>
					<Trash className="mr-2 h-4 w-4" />
					{deleteMutation.isPending ? "Deleting..." : "Delete Selected"}
				</Button>
			</DataTableBulkActions>
		</Main>
	);
}
