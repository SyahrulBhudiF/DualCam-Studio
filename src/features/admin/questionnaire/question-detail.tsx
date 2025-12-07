import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowLeft, Plus, Save, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	createAnswer,
	deleteAnswers,
	updateAnswer,
	updateQuestion,
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
import {
	createAnswerSchema,
	createQuestionSchema,
} from "@/libs/schemas/questionnaire";
import { getAnswerColumns } from "./components/columns";
import type { Answer, Question } from "./questionnaires.types";

const questionFormSchema = createQuestionSchema.omit({
	questionnaire_id: true,
});

const answerFormSchema = createAnswerSchema.omit({
	question_id: true,
});

function UpdateQuestionForm({ question }: { question: Question }) {
	const queryClient = useQueryClient();

	const updateMutation = useMutation({
		mutationFn: updateQuestion,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["admin", "question", question.id],
			});
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
			className="space-y-4 rounded-lg border p-4 max-w-2xl"
		>
			<form.Field name="order_number">
				{(field) => (
					<div className="grid gap-2">
						<Label htmlFor="order_number">Order</Label>
						<Input
							id="order_number"
							type="number"
							className="max-w-[100px]"
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
						<Label htmlFor="question_text">Question</Label>
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
				disabled={updateMutation.isPending}
				className="cursor-pointer"
			>
				<Save className="mr-2 h-4 w-4" /> Save Question
			</Button>
		</form>
	);
}

function CreateAnswerForm({
	questionId,
	onSuccess,
}: {
	questionId: string;
	onSuccess: () => void;
}) {
	const queryClient = useQueryClient();

	const createMutation = useMutation({
		mutationFn: createAnswer,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["admin", "answers", questionId],
			});
			onSuccess();
			form.reset();
			toast.success("Answer created successfully");
		},
		onError: () => {
			toast.error("Failed to create answer");
		},
	});

	const form = useForm({
		defaultValues: {
			answer_text: "",
			score: 0,
		},
		validators: {
			onSubmit: ({ value }) => {
				const result = answerFormSchema.safeParse(value);
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
					question_id: questionId,
					answer_text: value.answer_text,
					score: Number(value.score),
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
			<form.Field name="answer_text">
				{(field) => (
					<div className="grid gap-2">
						<Label htmlFor="answer_text">Answer Text</Label>
						<Input
							id="answer_text"
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

			<form.Field name="score">
				{(field) => (
					<div className="grid gap-2">
						<Label htmlFor="score">Score</Label>
						<Input
							id="score"
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

function EditAnswerForm({
	answer,
	questionId,
	onSuccess,
}: {
	answer: Answer;
	questionId: string;
	onSuccess: () => void;
}) {
	const queryClient = useQueryClient();

	const updateMutation = useMutation({
		mutationFn: updateAnswer,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["admin", "answers", questionId],
			});
			onSuccess();
			form.reset();
			toast.success("Answer updated successfully");
		},
		onError: () => {
			toast.error("Failed to update answer");
		},
	});

	const form = useForm({
		defaultValues: {
			answer_text: answer.answer_text,
			score: answer.score,
		},
		validators: {
			onSubmit: ({ value }) => {
				const result = answerFormSchema.safeParse(value);
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
					id: answer.id,
					answer_text: value.answer_text,
					score: Number(value.score),
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
			<form.Field name="answer_text">
				{(field) => (
					<div className="grid gap-2">
						<Label htmlFor="edit_answer_text">Answer Text</Label>
						<Input
							id="edit_answer_text"
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

			<form.Field name="score">
				{(field) => (
					<div className="grid gap-2">
						<Label htmlFor="edit_score">Score</Label>
						<Input
							id="edit_score"
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

export function QuestionDetail({
	question,
	answers,
}: {
	question: Question;
	answers: Answer[];
}) {
	const queryClient = useQueryClient();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [rowSelection, setRowSelection] = useState({});
	const [globalFilter, setGlobalFilter] = useState("");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingAnswer, setEditingAnswer] = useState<Answer | null>(null);

	const deleteAnswerMutation = useMutation({
		mutationFn: deleteAnswers,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["admin", "answers", question.id],
			});
			setRowSelection({});
			toast.success("Answers deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete answers");
		},
	});

	const table = useReactTable({
		data: answers,
		columns: getAnswerColumns(setEditingAnswer),
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
		<Main className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild>
					<Link
						to="/admin/questionnaires/$questionnaireId"
						params={{ questionnaireId: question.questionnaire_id }}
					>
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<h2 className="text-2xl font-bold tracking-tight">Question Details</h2>
			</div>

			<UpdateQuestionForm question={question} />

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-medium">Answers</h3>
					<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
						<DialogTrigger asChild>
							<Button size="sm" className="cursor-pointer">
								<Plus className="mr-2 h-4 w-4" /> Add Answer
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add Answer</DialogTitle>
							</DialogHeader>
							<CreateAnswerForm
								questionId={question.id}
								onSuccess={() => setIsCreateOpen(false)}
							/>
						</DialogContent>
					</Dialog>

					<Dialog
						open={!!editingAnswer}
						onOpenChange={(open) => !open && setEditingAnswer(null)}
					>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Edit Answer</DialogTitle>
							</DialogHeader>
							{editingAnswer && (
								<EditAnswerForm
									answer={editingAnswer}
									questionId={question.id}
									onSuccess={() => setEditingAnswer(null)}
								/>
							)}
						</DialogContent>
					</Dialog>
				</div>

				<DataTableToolbar table={table} searchKey="answer_text" />
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
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<DataTablePagination table={table} />
				<DataTableBulkActions table={table} entityName="answer">
					<Button
						variant="destructive"
						size="sm"
						className="h-8"
						onClick={() => {
							const ids = table
								.getFilteredSelectedRowModel()
								.rows.map((row) => row.original.id);
							deleteAnswerMutation.mutate({ data: { ids } });
						}}
					>
						<Trash className="mr-2 h-4 w-4" /> Delete Selected
					</Button>
				</DataTableBulkActions>
			</div>
		</Main>
	);
}
