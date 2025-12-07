import { jsxs, jsx } from "react/jsx-runtime";
import { useQueryClient, useMutation, useQuery, useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { t as deleteQuestions, v as createQuestion, w as updateQuestion, x as getResponsesByQuestionnaireId, k as updateQuestionnaire, y as Route, z as getQuestionnaireById, A as getQuestionsByQuestionnaireId } from "./router-BmiHf_ZJ.js";
import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Plus, Trash, ArrowLeft, Save, Video, Eye } from "lucide-react";
import { toast } from "sonner";
import { M as Main } from "./main-CFzJm1Bk.js";
import { B as Badge } from "./badge-CiJstU-m.js";
import { B as Button } from "./button-CmIj-cVl.js";
import { I as Input } from "./input-DtwcC6CR.js";
import { L as Label } from "./label-Bk8qxaEw.js";
import { T as Textarea, S as Switch } from "./textarea-BymfnIK1.js";
import { f as Tabs, g as TabsList, h as TabsTrigger, i as TabsContent, T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./tabs-S5ZPqgFb.js";
import { f as createQuestionSchema, c as createQuestionnaireSchema } from "./questionnaire-DGzIDWUe.js";
import { useReactTable, getPaginationRowModel, getFilteredRowModel, getSortedRowModel, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { useState } from "react";
import { D as DataTableToolbar, c as DataTablePagination, d as DataTableBulkActions } from "./checkbox-DzKehuGR.js";
import "clsx";
import { D as Dialog, f as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-a33jwLhQ.js";
import { a as getQuestionColumns } from "./columns-C4dU6pNa.js";
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
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-switch";
import "@radix-ui/react-tabs";
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
import "@radix-ui/react-dialog";
const questionFormSchema = createQuestionSchema.omit({
  questionnaire_id: true
});
function CreateQuestionForm({
  questionnaireId,
  onSuccess
}) {
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "questions", questionnaireId]
      });
      onSuccess();
      form.reset();
      toast.success("Question created successfully");
    },
    onError: () => {
      toast.error("Failed to create question");
    }
  });
  const form = useForm({
    defaultValues: {
      question_text: "",
      order_number: 0
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
      await createMutation.mutateAsync({
        data: {
          questionnaire_id: questionnaireId,
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
      className: "space-y-4",
      children: [
        /* @__PURE__ */ jsx(form.Field, { name: "order_number", children: (field) => /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "order_number", children: "Order" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "order_number",
              type: "number",
              value: field.state.value,
              onBlur: field.handleBlur,
              onChange: (e) => field.handleChange(Number(e.target.value))
            }
          ),
          field.state.meta.errors ? /* @__PURE__ */ jsx("p", { className: "text-sm text-red-500", children: field.state.meta.errors.join(", ") }) : null
        ] }) }),
        /* @__PURE__ */ jsx(form.Field, { name: "question_text", children: (field) => /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "question_text", children: "Question Text" }),
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
function EditQuestionForm({
  question,
  questionnaireId,
  onSuccess
}) {
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: updateQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "questions", questionnaireId]
      });
      onSuccess();
      form.reset();
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
      className: "space-y-4",
      children: [
        /* @__PURE__ */ jsx(form.Field, { name: "order_number", children: (field) => /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "edit_order_number", children: "Order" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "edit_order_number",
              type: "number",
              value: String(field.state.value),
              onBlur: field.handleBlur,
              onChange: (e) => field.handleChange(Number(e.target.value))
            }
          ),
          field.state.meta.errors ? /* @__PURE__ */ jsx("p", { className: "text-sm text-red-500", children: field.state.meta.errors.join(", ") }) : null
        ] }) }),
        /* @__PURE__ */ jsx(form.Field, { name: "question_text", children: (field) => /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "edit_question_text", children: "Question Text" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "edit_question_text",
              value: field.state.value,
              onBlur: field.handleBlur,
              onChange: (e) => field.handleChange(e.target.value)
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
function QuestionTable({
  data,
  questionnaireId
}) {
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: deleteQuestions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "questions", questionnaireId]
      });
      setRowSelection({});
      toast.success("Question deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete question");
    }
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
    getPaginationRowModel: getPaginationRowModel()
  });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: "Questions" }),
      /* @__PURE__ */ jsxs(Dialog, { open: isCreateOpen, onOpenChange: setIsCreateOpen, children: [
        /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "cursor-pointer", children: [
          /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
          " Add Question"
        ] }) }),
        /* @__PURE__ */ jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Add Question" }) }),
          /* @__PURE__ */ jsx(
            CreateQuestionForm,
            {
              questionnaireId,
              onSuccess: () => setIsCreateOpen(false)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        Dialog,
        {
          open: !!editingQuestion,
          onOpenChange: (open) => !open && setEditingQuestion(null),
          children: /* @__PURE__ */ jsxs(DialogContent, { children: [
            /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Edit Question" }) }),
            editingQuestion && /* @__PURE__ */ jsx(
              EditQuestionForm,
              {
                question: editingQuestion,
                questionnaireId,
                onSuccess: () => setEditingQuestion(null)
              }
            )
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsx(DataTableToolbar, { table, searchKey: "question_text" }),
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
          children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx("td", { className: "p-4 align-middle", children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))
        },
        row.id
      )) })
    ] }) }),
    /* @__PURE__ */ jsx(DataTablePagination, { table }),
    /* @__PURE__ */ jsx(DataTableBulkActions, { table, entityName: "question", children: /* @__PURE__ */ jsxs(
      Button,
      {
        variant: "destructive",
        size: "sm",
        className: "h-8",
        onClick: () => {
          const ids = table.getFilteredSelectedRowModel().rows.map((row) => row.original.id);
          deleteMutation.mutate({ data: { ids } });
        },
        children: [
          /* @__PURE__ */ jsx(Trash, { className: "mr-2 h-4 w-4" }),
          " Delete Selected"
        ]
      }
    ) })
  ] });
}
function QuestionnaireDetail({
  questionnaire,
  questions
}) {
  const queryClient = useQueryClient();
  const responsesQuery = useQuery({
    queryKey: ["admin", "questionnaire", questionnaire.id, "responses"],
    queryFn: () => getResponsesByQuestionnaireId({ data: questionnaire.id })
  });
  const updateMutation = useMutation({
    mutationFn: updateQuestionnaire,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "questionnaires"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "questionnaire", questionnaire.id]
      });
      toast.success("Questionnaire updated successfully");
      form.reset();
    },
    onError: () => {
      toast.error("Failed to update questionnaire");
    }
  });
  const form = useForm({
    defaultValues: {
      title: questionnaire.title,
      description: questionnaire.description || "",
      is_active: questionnaire.is_active
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = createQuestionnaireSchema.safeParse(value);
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
          id: questionnaire.id,
          title: value.title,
          description: value.description || null,
          is_active: value.is_active
        }
      });
    }
  });
  const responses = responsesQuery.data ?? [];
  return /* @__PURE__ */ jsxs(Main, { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/admin/questionnaires", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold tracking-tight", children: "Questionnaire Details" })
    ] }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "details", className: "space-y-4", children: [
      /* @__PURE__ */ jsxs(TabsList, { children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "details", children: "Details" }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "questions", children: [
          "Questions (",
          questions.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "responses", children: [
          "Responses (",
          responses.length,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "details", className: "space-y-4", children: /* @__PURE__ */ jsx("div", { className: "grid gap-6 md:grid-cols-2", children: /* @__PURE__ */ jsxs(
        "form",
        {
          onSubmit: (e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          },
          className: "space-y-4 rounded-lg border p-4",
          children: [
            /* @__PURE__ */ jsx(form.Field, { name: "title", children: (field) => /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "title", children: "Title" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "title",
                  value: field.state.value,
                  onBlur: field.handleBlur,
                  onChange: (e) => field.handleChange(e.target.value),
                  required: true
                }
              ),
              field.state.meta.errors ? /* @__PURE__ */ jsx("p", { className: "text-sm text-red-500", children: field.state.meta.errors.join(", ") }) : null
            ] }) }),
            /* @__PURE__ */ jsx(form.Field, { name: "description", children: (field) => /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "description", children: "Description" }),
              /* @__PURE__ */ jsx(
                Textarea,
                {
                  id: "description",
                  value: field.state.value,
                  onBlur: field.handleBlur,
                  onChange: (e) => field.handleChange(e.target.value)
                }
              ),
              field.state.meta.errors ? /* @__PURE__ */ jsx("p", { className: "text-sm text-red-500", children: field.state.meta.errors.join(", ") }) : null
            ] }) }),
            /* @__PURE__ */ jsx(form.Field, { name: "is_active", children: (field) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                Switch,
                {
                  id: "is_active",
                  checked: field.state.value,
                  onCheckedChange: field.handleChange
                }
              ),
              /* @__PURE__ */ jsx(Label, { htmlFor: "is_active", children: "Active" }),
              field.state.meta.errors ? /* @__PURE__ */ jsx("p", { className: "text-sm text-red-500", children: field.state.meta.errors.join(", ") }) : null
            ] }) }),
            /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: updateMutation.isPending, children: [
              /* @__PURE__ */ jsx(Save, { className: "mr-2 h-4 w-4" }),
              " Save Changes"
            ] })
          ]
        }
      ) }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "questions", className: "space-y-4", children: /* @__PURE__ */ jsx("div", { className: "rounded-lg border p-4", children: /* @__PURE__ */ jsx(
        QuestionTable,
        {
          data: questions,
          questionnaireId: questionnaire.id
        }
      ) }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "responses", className: "space-y-4", children: /* @__PURE__ */ jsx("div", { className: "rounded-lg border", children: responsesQuery.isLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-32", children: /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Loading responses..." }) }) : responses.length === 0 ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-32", children: /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "No responses yet for this questionnaire" }) }) : /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Name" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Class" }),
          /* @__PURE__ */ jsx(TableHead, { children: "NIM" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Score" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Video" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Date" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: responses.map((response) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: response.profile?.name ?? "-" }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: "outline", children: response.profile?.class ?? "-" }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-muted-foreground", children: response.profile?.nim ?? "-" }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: response.totalScore }) }),
          /* @__PURE__ */ jsx(TableCell, { children: response.videoPath && response.videoPath !== "null" ? /* @__PURE__ */ jsxs(Badge, { variant: "default", className: "gap-1", children: [
            /* @__PURE__ */ jsx(Video, { className: "h-3 w-3" }),
            "Yes"
          ] }) : /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "No" }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-muted-foreground text-sm", children: format(
            new Date(response.createdAt),
            "dd MMM yyyy HH:mm"
          ) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(
            Link,
            {
              to: "/admin/responses/$responseId",
              params: { responseId: response.id },
              children: /* @__PURE__ */ jsxs(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  className: "cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 mr-1" }),
                    "View"
                  ]
                }
              )
            }
          ) })
        ] }, response.id)) })
      ] }) }) })
    ] })
  ] });
}
function QuestionnaireDetailRouteComponent() {
  const params = Route.useParams();
  const questionnaireQuery = useSuspenseQuery(queryOptions({
    queryKey: ["admin", "questionnaire", params.questionnaireId],
    queryFn: () => getQuestionnaireById({
      data: params.questionnaireId
    })
  }));
  const questionsQuery = useSuspenseQuery(queryOptions({
    queryKey: ["admin", "questions", params.questionnaireId],
    queryFn: () => getQuestionsByQuestionnaireId({
      data: params.questionnaireId
    })
  }));
  return /* @__PURE__ */ jsx(QuestionnaireDetail, { questionnaire: questionnaireQuery.data, questions: questionsQuery.data });
}
export {
  QuestionnaireDetailRouteComponent as component
};
