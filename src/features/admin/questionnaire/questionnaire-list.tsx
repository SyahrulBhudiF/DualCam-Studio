import { useForm } from "@tanstack/react-form";
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
import { Plus, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	createQuestionnaire,
	deleteQuestionnaires,
	updateQuestionnaire,
} from "@/apis/admin/questionnaires";
import {
	DataTableBulkActions,
	DataTablePagination,
	DataTableToolbar,
} from "@/components/data-table";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createQuestionnaireSchema } from "@/libs/schemas/questionnaire";
import { getQuestionnaireColumns } from "./components/columns";
import type { Questionnaire } from "./questionnaires.types";

export function QuestionnaireList({ data }: { data: Questionnaire[] }) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
	const [globalFilter, setGlobalFilter] = useState<string>("");
	const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

	const queryClient = useQueryClient();

	const createMutation = useMutation({
		mutationFn: createQuestionnaire,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "questionnaires"] });
			setIsCreateOpen(false);

			form.reset();
			toast.success("Questionnaire created successfully");
		},
		onError: () => {
			toast.error("Failed to create questionnaire");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteQuestionnaires,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "questionnaires"] });
			setRowSelection({});
			toast.success("Questionnaire deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete questionnaire");
		},
	});

	const updateMutation = useMutation({
		mutationFn: updateQuestionnaire,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "questionnaires"] });

			form.reset();
			toast.success("Questionnaire updated successfully");
		},
		onError: () => {
			toast.error("Failed to update questionnaire");
		},
	});

	const columns = getQuestionnaireColumns(
		() => {},
		(item) =>
			updateMutation.mutate({
				data: {
					id: item.id,
					is_active: !item.is_active,
				},
			}),
	);

	const table = useReactTable({
		data,
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

	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
			is_active: false,
		},
		validators: {
			onSubmit: ({ value }) => {
				const result = createQuestionnaireSchema.safeParse(value);
				if (!result.success) {
					return result.error.issues.reduce(
						(acc, issue) => {
							const path = issue.path[0] as string;
							acc[path] = issue.message;
							return acc;
						},
						{} as Record<string, string>,
					);
				}
				return undefined;
			},
		},
		onSubmit: async ({ value }) => {
			await createMutation.mutateAsync({
				data: {
					title: value.title,
					description: value.description || null,
					is_active: value.is_active,
				},
			});
		},
	});

	return (
		<Main className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold tracking-tight">Questionnaires</h2>
				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<DialogTrigger asChild>
						<Button size="sm" className="cursor-pointer">
							<Plus className="mr-2 h-4 w-4" /> Add Questionnaire
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create Questionnaire</DialogTitle>
						</DialogHeader>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								form.handleSubmit();
							}}
							className="space-y-4"
						>
							<form.Field name="title">
								{(field) => (
									<div className="grid gap-2">
										<Label htmlFor={field.name}>Title</Label>
										<Input
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										{field.state.meta.errors ? (
											<p className="text-destructive text-sm">
												{field.state.meta.errors.join(", ")}
											</p>
										) : null}
									</div>
								)}
							</form.Field>
							<form.Field name="description">
								{(field) => (
									<div className="grid gap-2">
										<Label htmlFor={field.name}>Description</Label>
										<Textarea
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
									</div>
								)}
							</form.Field>
							<form.Field name="is_active">
								{(field) => (
									<div className="flex items-center gap-2">
										<Switch
											id={field.name}
											checked={field.state.value}
											onCheckedChange={field.handleChange}
										/>
										<Label htmlFor={field.name}>Set as Active</Label>
									</div>
								)}
							</form.Field>
							<Button
								type="submit"
								className="w-full cursor-pointer"
								disabled={createMutation.isPending}
							>
								{createMutation.isPending ? "Creating..." : "Create"}
							</Button>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<DataTableToolbar table={table} searchKey="title" />
			<div className="rounded-md border">
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
									No results.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			<DataTablePagination table={table} />
			<DataTableBulkActions table={table} entityName="questionnaire">
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
				>
					<Trash className="mr-2 h-4 w-4" /> Delete Selected
				</Button>
			</DataTableBulkActions>
		</Main>
	);
}
