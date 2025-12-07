import { jsxs, jsx } from "react/jsx-runtime";
import { useQueryClient, useMutation, useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { B as deleteAnswers, w as updateQuestion, C as createAnswer, D as updateAnswer, E as Route, F as getQuestionById, G as getAnswersByQuestionId } from "./router-BmiHf_ZJ.js";
import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { useReactTable, getPaginationRowModel, getFilteredRowModel, getSortedRowModel, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { ArrowLeft, Plus, Trash, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { D as DataTableToolbar, c as DataTablePagination, d as DataTableBulkActions } from "./checkbox-DzKehuGR.js";
import { B as Button } from "./button-CmIj-cVl.js";
import "clsx";
import "./badge-CiJstU-m.js";
import { D as Dialog, f as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-a33jwLhQ.js";
import { M as Main } from "./main-CFzJm1Bk.js";
import { I as Input } from "./input-DtwcC6CR.js";
import { L as Label } from "./label-Bk8qxaEw.js";
import { f as createQuestionSchema, d as createAnswerSchema } from "./questionnaire-DGzIDWUe.js";
import { b as getAnswerColumns } from "./columns-C4dU6pNa.js";
import "@tanstack/react-router-ssr-query";
import "@tanstack/react-router-devtools";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "./user-B3mpcRFy.js";
import "zod";
import "./supabase-0PR4I26a.js";
import "@supabase/ssr";
import "tailwind-merge";
import "next-themes";
import "@radix-ui/react-direction";
import "js-cookie";
import "node:fs";
import "node:path";
import "zustand";
import "./command-p92Os1Jt.js";
import "@radix-ui/react-separator";
import "@radix-ui/react-tooltip";
import "cmdk";
import "@radix-ui/react-icons";
import "./select-WKwWO3Fr.js";
import "@radix-ui/react-select";
import "@radix-ui/react-popover";
import "@radix-ui/react-dropdown-menu";
import "./dropdown-menu-DNyQp_hH.js";
import "@radix-ui/react-checkbox";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-dialog";
import "@radix-ui/react-label";
const questionFormSchema = createQuestionSchema.omit({
  questionnaire_id: true
});
const answerFormSchema = createAnswerSchema.omit({
  question_id: true
});
function UpdateQuestionForm({ question }) {
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: updateQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "question", question.id]
      });
      toast.success("Question updated successfully");
    },
    onError: () => {
      toast.error("Failed to update question");
    }
  });
  const form = useForm({
    defaultValues: {
      question_text: question.question_text,
      order_number: question.order_number
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = questionFormSchema.safeParse(value);
        if (!result.success) {
          return result.error.issues.reduce(
            (acc, issue) => {
              const path = issue.path[0];
              acc[path] = issue.message;
              return acc;
            },
            {}
          );
        }
        return void 0;
      }
    },
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync({
        data: {
          id: question.id,
          question_text: value.question_text,
          order_number: Number(value.order_number)
        }
      });
    }
  });
  return /* @__PURE__ */ jsxs(
    "form",
    {
      onSubmit: (e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      },
      className: "space-y-4 rounded-lg border p-4 max-w-2xl",
      children: [
        /* @__PURE__ */ jsx(form.Field, { name: "order_number", children: (field) => /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "order_number", children: "Order" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "order_number",
              type: "number",
              className: "max-w-[100px]",
              value: String(field.state.value),
              onBlur: field.handleBlur,
              onChange: (e) => field.handleChange(Number(e.target.value))
            }
          ),
          field.state.meta.errors ? /* @__PURE__ */ jsx("p", { className: "text-sm text-red-500", children: field.state.meta.errors.join(", ") }) : null
        ] }) }),
        /* @__PURE__ */ jsx(form.Field, { name: "question_text", children: (field) => /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "question_text", children: "Question" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "question_text",
              value: field.state.value,
              onBlur: field.handleBlur,
              onChange: (e) => field.handleChange(e.target.value)
            }
          ),
          field.state.meta.errors ? /* @__PURE__ */ jsx("p", { className: "text-sm text-red-500", children: field.state.meta.errors.join(", ") }) : null
        ] }) }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            type: "submit",
            disabled: updateMutation.isPending,
            className: "cursor-pointer",
            children: [
              /* @__PURE__ */ jsx(Save, { className: "mr-2 h-4 w-4" }),
              " Save Question"
            ]
          }
        )
      ]
    }
  );
}
function CreateAnswerForm({
  questionId,
  onSuccess
}) {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: createAnswer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "answers", questionId]
      });
      onSuccess();
      form.reset();
      toast.success("Answer created successfully");
    },
    onError: () => {
      toast.error("Failed to create answer");
    }
  });
  const form = useForm({
    defaultValues: {
      answer_text: "",
      score: 0
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = answerFormSchema.safeParse(value);
        if (!result.success) {
          return result.error.issues.reduce(
            (acc, issue) => {
              const path = issue.path[0];
              acc[path] = issue.message;
              return acc;
            },
            {}
          );
        }
        return void 0;
      }
    },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync({
        data: {
          question_id: questionId,
          answer_text: value.answer_text,
          score: Number(value.score)
        }
      });
    }
  });
  return /* @__PURE__ */ jsxs(
    "form",
    {
      onSubmit: (e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      },
      className: "space-y-4",
      children: [
        /* @__PURE__ */ jsx(form.Field, { name: "answer_text", children: (field) => /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "answer_text", children: "Answer Text" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "answer_text",
              value: field.state.value,
              onBlur: field.handleBlur,
              onChange: (e) => field.handleChange(e.target.value)
            }
          ),
          field.state.meta.errors ? /* @__PURE__ */ jsx("p", { className: "text-sm text-red-500", children: field.state.meta.errors.join(", ") }) : null
        ] }) }),
        /* @__PURE__ */ jsx(form.Field, { name: "score", children: (field) => /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "score", children: "Score" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "score",
              type: "number",
              value: String(field.state.value),
              onBlur: field.handleBlur,
              onChange: (e) => field.handleChange(Number(e.target.value))
            }
          ),
          field.state.meta.errors ? /* @__PURE__ */ jsx("p", { className: "text-sm text-red-500", children: field.state.meta.errors.join(", ") }) : null
        ] }) }),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            className: "w-full cursor-pointer",
            disabled: createMutation.isPending,
            children: "Create"
          }
        )
      ]
    }
  );
}
function EditAnswerForm({
  answer,
  questionId,
  onSuccess
}) {
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: updateAnswer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "answers", questionId]
      });
      onSuccess();
      form.reset();
      toast.success("Answer updated successfully");
    },
    onError: () => {
      toast.error("Failed to update answer");
    }
  });
  const form = useForm({
    defaultValues: {
      answer_text: answer.answer_text,
      score: answer.score
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = answerFormSchema.safeParse(value);
        if (!result.success) {
          return result.error.issues.reduce(
            (acc, issue) => {
              const path = issue.path[0];
              acc[path] = issue.message;
              return acc;
            },
            {}
          );
        }
        return void 0;
      }
    },
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync({
        data: {
          id: answer.id,
          answer_text: value.answer_text,
          score: Number(value.score)
        }
      });
    }
  });
  return /* @__PURE__ */ jsxs(
    "form",
    {
      onSubmit: (e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      },
      className: "space-y-4",
      children: [
        /* @__PURE__ */ jsx(form.Field, { name: "answer_text", children: (field) => /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "edit_answer_text", children: "Answer Text" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "edit_answer_text",
              value: field.state.value,
              onBlur: field.handleBlur,
              onChange: (e) => field.handleChange(e.target.value)
            }
          ),
          field.state.meta.errors ? /* @__PURE__ */ jsx("p", { className: "text-sm text-red-500", children: field.state.meta.errors.join(", ") }) : null
        ] }) }),
        /* @__PURE__ */ jsx(form.Field, { name: "score", children: (field) => /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "edit_score", children: "Score" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "edit_score",
              type: "number",
              value: String(field.state.value),
              onBlur: field.handleBlur,
              onChange: (e) => field.handleChange(Number(e.target.value))
            }
          ),
          field.state.meta.errors ? /* @__PURE__ */ jsx("p", { className: "text-sm text-red-500", children: field.state.meta.errors.join(", ") }) : null
        ] }) }),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            className: "w-full cursor-pointer",
            disabled: updateMutation.isPending,
            children: "Update"
          }
        )
      ]
    }
  );
}
function QuestionDetail({
  question,
  answers
}) {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState(null);
  const deleteAnswerMutation = useMutation({
    mutationFn: deleteAnswers,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "answers", question.id]
      });
      setRowSelection({});
      toast.success("Answers deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete answers");
    }
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
    getPaginationRowModel: getPaginationRowModel()
  });
  return /* @__PURE__ */ jsxs(Main, { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", asChild: true, children: /* @__PURE__ */ jsx(
        Link,
        {
          to: "/admin/questionnaires/$questionnaireId",
          params: { questionnaireId: question.questionnaire_id },
          children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" })
        }
      ) }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold tracking-tight", children: "Question Details" })
    ] }),
    /* @__PURE__ */ jsx(UpdateQuestionForm, { question }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: "Answers" }),
        /* @__PURE__ */ jsxs(Dialog, { open: isCreateOpen, onOpenChange: setIsCreateOpen, children: [
          /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "cursor-pointer", children: [
            /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
            " Add Answer"
          ] }) }),
          /* @__PURE__ */ jsxs(DialogContent, { children: [
            /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Add Answer" }) }),
            /* @__PURE__ */ jsx(
              CreateAnswerForm,
              {
                questionId: question.id,
                onSuccess: () => setIsCreateOpen(false)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          Dialog,
          {
            open: !!editingAnswer,
            onOpenChange: (open) => !open && setEditingAnswer(null),
            children: /* @__PURE__ */ jsxs(DialogContent, { children: [
              /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Edit Answer" }) }),
              editingAnswer && /* @__PURE__ */ jsx(
                EditAnswerForm,
                {
                  answer: editingAnswer,
                  questionId: question.id,
                  onSuccess: () => setEditingAnswer(null)
                }
              )
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsx(DataTableToolbar, { table, searchKey: "answer_text" }),
      /* @__PURE__ */ jsx("div", { className: "rounded-md border", children: /* @__PURE__ */ jsxs("table", { className: "w-full caption-bottom text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "[&_tr]:border-b", children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsx(
          "tr",
          {
            className: "border-b transition-colors hover:bg-muted/50",
            children: headerGroup.headers.map((header) => /* @__PURE__ */ jsx(
              "th",
              {
                className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
                children: header.isPlaceholder ? null : flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )
              },
              header.id
            ))
          },
          headerGroup.id
        )) }),
        /* @__PURE__ */ jsx("tbody", { className: "[&_tr:last-child]:border-0", children: table.getRowModel().rows.map((row) => /* @__PURE__ */ jsx(
          "tr",
          {
            className: "border-b transition-colors hover:bg-muted/50",
            children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx("td", { className: "p-4 align-middle", children: flexRender(
              cell.column.columnDef.cell,
              cell.getContext()
            ) }, cell.id))
          },
          row.id
        )) })
      ] }) }),
      /* @__PURE__ */ jsx(DataTablePagination, { table }),
      /* @__PURE__ */ jsx(DataTableBulkActions, { table, entityName: "answer", children: /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "destructive",
          size: "sm",
          className: "h-8",
          onClick: () => {
            const ids = table.getFilteredSelectedRowModel().rows.map((row) => row.original.id);
            deleteAnswerMutation.mutate({ data: { ids } });
          },
          children: [
            /* @__PURE__ */ jsx(Trash, { className: "mr-2 h-4 w-4" }),
            " Delete Selected"
          ]
        }
      ) })
    ] })
  ] });
}
function QuestionDetailRouteComponent() {
  const params = Route.useParams();
  const questionQuery = useSuspenseQuery(queryOptions({
    queryKey: ["admin", "question", params.questionId],
    queryFn: () => getQuestionById({
      data: params.questionId
    })
  }));
  const answersQuery = useSuspenseQuery(queryOptions({
    queryKey: ["admin", "answers", params.questionId],
    queryFn: () => getAnswersByQuestionId({
      data: params.questionId
    })
  }));
  return /* @__PURE__ */ jsx(QuestionDetail, { question: questionQuery.data, answers: answersQuery.data });
}
export {
  QuestionDetailRouteComponent as component
};
