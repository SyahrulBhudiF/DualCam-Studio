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
import { MoreHorizontal, Plus, Trash } from "lucide-react";
import { useState } from "react";
import {
  createQuestion,
  deleteQuestions,
  updateQuestion,
} from "@/apis/admin/questionnaires";
import {
  DataTableBulkActions,
  DataTableColumnHeader,
  DataTablePagination,
  DataTableToolbar,
} from "@/components/data-table";
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
import type { Question } from "./questionnaires.types";

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

  const createMutation = useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "questions", questionnaireId],
      });
      setIsCreateOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "questions", questionnaireId],
      });
      setEditingQuestion(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuestions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "questions", questionnaireId],
      });
      setRowSelection({});
    },
  });

  const columns: ColumnDef<Question>[] = [
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
      enableHiding: false,
    },
    {
      accessorKey: "order_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order" />
      ),
      cell: ({ row }) => (
        <div className="pl-4">{row.getValue("order_number")}</div>
      ),
    },
    {
      accessorKey: "question_text",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Question" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("question_text")}</span>
      ),
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
            <DropdownMenuItem asChild>
              <Link
                to="/admin/questionnaires/$questionnaireId/$questionId"
                params={{ questionnaireId, questionId: row.original.id }}
              >
                Manage Answers
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditingQuestion(row.original)}>
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

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

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      questionnaire_id: questionnaireId,
      question_text: formData.get("question_text") as string,
      order_number: Number(formData.get("order_number")),
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingQuestion) return;
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingQuestion.id,
      question_text: formData.get("question_text") as string,
      order_number: Number(formData.get("order_number")),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Questions</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Question</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="order_number">Order</Label>
                <Input
                  id="order_number"
                  name="order_number"
                  type="number"
                  defaultValue={0}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="question_text">Question Text</Label>
                <Input id="question_text" name="question_text" required />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                Create
              </Button>
            </form>
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
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_order_number">Order</Label>
                <Input
                  id="edit_order_number"
                  name="order_number"
                  type="number"
                  defaultValue={editingQuestion?.order_number || 0}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_question_text">Question Text</Label>
                <Input
                  id="edit_question_text"
                  name="question_text"
                  defaultValue={editingQuestion?.question_text}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={updateMutation.isPending}
              >
                Update
              </Button>
            </form>
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
            deleteMutation.mutate({ ids });
          }}
        >
          <Trash className="mr-2 h-4 w-4" /> Delete Selected
        </Button>
      </DataTableBulkActions>
    </div>
  );
}
