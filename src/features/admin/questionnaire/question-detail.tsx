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
import { ArrowLeft, MoreHorizontal, Plus, Save, Trash } from "lucide-react";
import { useState } from "react";
import {
  createAnswer,
  deleteAnswers,
  updateAnswer,
  updateQuestion,
} from "@/apis/admin/questionnaires";
import {
  DataTableBulkActions,
  DataTableColumnHeader,
  DataTablePagination,
  DataTableToolbar,
} from "@/components/data-table";
import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Answer, Question } from "./questionnaires.types";

interface QuestionDetailProps {
  question: Question;
  answers: Answer[];
}

export function QuestionDetail({ question, answers }: QuestionDetailProps) {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState<Answer | null>(null);

  const updateQuestionMutation = useMutation({
    mutationFn: updateQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "question", question.id],
      });
    },
  });

  const createAnswerMutation = useMutation({
    mutationFn: createAnswer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "answers", question.id],
      });
      setIsCreateOpen(false);
    },
  });

  const updateAnswerMutation = useMutation({
    mutationFn: updateAnswer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "answers", question.id],
      });
      setEditingAnswer(null);
    },
  });

  const deleteAnswerMutation = useMutation({
    mutationFn: deleteAnswers,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "answers", question.id],
      });
      setRowSelection({});
    },
  });

  const columns: ColumnDef<Answer>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "answer_text",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Answer" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("answer_text")}</span>
      ),
    },
    {
      accessorKey: "score",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Score" />
      ),
      cell: ({ row }) => <div>{row.getValue("score")}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditingAnswer(row.original)}>
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: answers,
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

  const handleUpdateQuestion = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateQuestionMutation.mutate({
      id: question.id,
      question_text: formData.get("question_text") as string,
      order_number: Number(formData.get("order_number")),
    });
  };

  const handleCreateAnswer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createAnswerMutation.mutate({
      question_id: question.id,
      answer_text: formData.get("answer_text") as string,
      score: Number(formData.get("score")),
    });
  };

  const handleUpdateAnswer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAnswer) return;
    const formData = new FormData(e.currentTarget);
    updateAnswerMutation.mutate({
      id: editingAnswer.id,
      answer_text: formData.get("answer_text") as string,
      score: Number(formData.get("score")),
    });
  };

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

      <form
        onSubmit={handleUpdateQuestion}
        className="space-y-4 rounded-lg border p-4 max-w-2xl"
      >
        <div className="grid gap-2">
          <Label htmlFor="order_number">Order</Label>
          <Input
            id="order_number"
            name="order_number"
            type="number"
            defaultValue={question.order_number || 0}
            className="max-w-[100px]"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="question_text">Question</Label>
          <Input
            id="question_text"
            name="question_text"
            defaultValue={question.question_text}
            required
          />
        </div>
        <Button type="submit" disabled={updateQuestionMutation.isPending}>
          <Save className="mr-2 h-4 w-4" /> Save Question
        </Button>
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Answers</h3>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Answer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Answer</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAnswer} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="answer_text">Answer Text</Label>
                  <Input id="answer_text" name="answer_text" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="score">Score</Label>
                  <Input
                    id="score"
                    name="score"
                    type="number"
                    defaultValue={0}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createAnswerMutation.isPending}
                >
                  Create
                </Button>
              </form>
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
              <form onSubmit={handleUpdateAnswer} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_answer_text">Answer Text</Label>
                  <Input
                    id="edit_answer_text"
                    name="answer_text"
                    defaultValue={editingAnswer?.answer_text}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit_score">Score</Label>
                  <Input
                    id="edit_score"
                    name="score"
                    type="number"
                    defaultValue={editingAnswer?.score}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateAnswerMutation.isPending}
                >
                  Update
                </Button>
              </form>
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
              deleteAnswerMutation.mutate({ ids });
            }}
          >
            <Trash className="mr-2 h-4 w-4" /> Delete Selected
          </Button>
        </DataTableBulkActions>
      </div>
    </Main>
  );
}
