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
	createQuestion,
	deleteQuestions,
	updateQuestion,
} from "@/apis/admin/questionnaires";
import {
	DataTableBulkActions,
	DataTablePagination,
	DataTableToolbar,
} from "@/components/data-table";
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
import { createQuestionSchema } from "@/libs/schemas/questionnaire";
import { getQuestionColumns } from "./components/columns";
import type { Question } from "./questionnaires.types";

const questionFormSchema = createQuestionSchema.omit({
	questionnaire_id: true,
});

function CreateQuestionForm({
	questionnaireId,
	onSuccess,
}: {
	questionnaireId: string;
	onSuccess: () => void;
}) {
	const queryClient = useQueryClient();

	const createMutation = useMutation({
		mutationFn: createQuestion,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["admin", "questions", questionnaireId],
			});
			onSuccess();

			form.reset();
			toast.success("Question created successfully");
		},
		onError: () => {
			toast.error("Failed to create question");
		},
	});

	const form = useForm({
		defaultValues: {
			question_text: "",
			order_number: 0,
		},
		validators: {
			onSubmit: ({ value }) => {
				const result = questionFormSchema.safeParse(value);
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
					questionnaire_id: questionnaireId,
					question_text: value.question_text,
					order_number: Number(value.order_number),
				},
			});
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<form.Field name="order_number">
				{(field) => (
					<div className="grid gap-2">
						<Label htmlFor="order_number">Order</Label>
						<Input
							id="order_number"
							type="number"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(Number(e.target.value))}
						/>
						{field.state.meta.errors ? (
							<p className="text-sm text-red-500">
								{field.state.meta.errors.join(", ")}
							</p>
						) : null}
					</div>
				)}
			</form.Field>

			<form.Field name="question_text">
				{(field) => (
					<div className="grid gap-2">
						<Label htmlFor="question_text">Question Text</Label>
						<Input
							id="question_text"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{field.state.meta.errors ? (
							<p className="text-sm text-red-500">
								{field.state.meta.errors.join(", ")}
							</p>
						) : null}
					</div>
				)}
			</form.Field>

			<Button
				type="submit"
				className="w-full cursor-pointer"
				disabled={createMutation.isPending}
			>
				Create
			</Button>
		</form>
	);
}

function EditQuestionForm({
	question,
	questionnaireId,
	onSuccess,
}: {
	question: Question;
	questionnaireId: string;
	onSuccess: () => void;
}) {
	const queryClient = useQueryClient();

	const updateMutation = useMutation({
		mutationFn: updateQuestion,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["admin", "questions", questionnaireId],
			});
			onSuccess();

			form.reset();
			toast.success("Question updated successfully");
		},
		onError: () => {
			toast.error("Failed to update question");
		},
	});

	const form = useForm({
		defaultValues: {
			question_text: question.question_text,
			order_number: question.order_number,
		},
		validators: {
			onSubmit: ({ value }) => {
				const result = questionFormSchema.safeParse(value);
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
			await updateMutation.mutateAsync({
				data: {
					id: question.id,
					question_text: value.question_text,
					order_number: Number(value.order_number),
				},
			});
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<form.Field name="order_number">
				{(field) => (
					<div className="grid gap-2">
						<Label htmlFor="edit_order_number">Order</Label>
						<Input
							id="edit_order_number"
							type="number"
							value={String(field.state.value)}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(Number(e.target.value))}
						/>
						{field.state.meta.errors ? (
							<p className="text-sm text-red-500">
								{field.state.meta.errors.join(", ")}
							</p>
						) : null}
					</div>
				)}
			</form.Field>

			<form.Field name="question_text">
				{(field) => (
					<div className="grid gap-2">
						<Label htmlFor="edit_question_text">Question Text</Label>
						<Input
							id="edit_question_text"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{field.state.meta.errors ? (
							<p className="text-sm text-red-500">
								{field.state.meta.errors.join(", ")}
							</p>
						) : null}
					</div>
				)}
			</form.Field>

			<Button
				type="submit"
				className="w-full cursor-pointer"
				disabled={updateMutation.isPending}
			>
				Update
			</Button>
		</form>
	);
}

export function QuestionTable({
	data,
	questionnaireId,
}: {
	data: Question[];
	questionnaireId: string;
}) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [rowSelection, setRowSelection] = useState({});
	const [globalFilter, setGlobalFilter] = useState("");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

	const queryClient = useQueryClient();

	const deleteMutation = useMutation({
		mutationFn: deleteQuestions,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["admin", "questions", questionnaireId],
			});
			setRowSelection({});

			toast.success("Question deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete question");
		},
	});

	const table = useReactTable({
		data,
		columns: getQuestionColumns(questionnaireId, setEditingQuestion),
		state: { sorting, rowSelection, globalFilter },
		onSortingChange: setSorting,
		onRowSelectionChange: setRowSelection,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-medium">Questions</h3>
				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<DialogTrigger asChild>
						<Button size="sm" className="cursor-pointer">
							<Plus className="mr-2 h-4 w-4" /> Add Question
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add Question</DialogTitle>
						</DialogHeader>
						<CreateQuestionForm
							questionnaireId={questionnaireId}
							onSuccess={() => setIsCreateOpen(false)}
						/>
					</DialogContent>
				</Dialog>

				<Dialog
					open={!!editingQuestion}
					onOpenChange={(open) => !open && setEditingQuestion(null)}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Edit Question</DialogTitle>
						</DialogHeader>
						{editingQuestion && (
							<EditQuestionForm
								question={editingQuestion}
								questionnaireId={questionnaireId}
								onSuccess={() => setEditingQuestion(null)}
							/>
						)}
					</DialogContent>
				</Dialog>
			</div>

			<DataTableToolbar table={table} searchKey="question_text" />
			<div className="rounded-md border">
				<table className="w-full caption-bottom text-sm">
					<thead className="[&_tr]:border-b">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr
								key={headerGroup.id}
								className="border-b transition-colors hover:bg-muted/50"
							>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
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
						{table.getRowModel().rows.map((row) => (
							<tr
								key={row.id}
								className="border-b transition-colors hover:bg-muted/50"
							>
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id} className="p-4 align-middle">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<DataTablePagination table={table} />
			<DataTableBulkActions table={table} entityName="question">
				<Button
					variant="destructive"
					size="sm"
					className="h-8"
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
		</div>
	);
}
