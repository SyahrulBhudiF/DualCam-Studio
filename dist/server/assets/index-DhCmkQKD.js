import { jsxs, jsx } from "react/jsx-runtime";
import { useQueryClient, useMutation, useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { i as createQuestionnaire, j as deleteQuestionnaires, k as updateQuestionnaire, m as getQuestionnaires } from "./router-BmiHf_ZJ.js";
import { useForm } from "@tanstack/react-form";
import { useReactTable, getPaginationRowModel, getFilteredRowModel, getSortedRowModel, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { Plus, Trash } from "lucide-react";
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
import { T as Textarea, S as Switch } from "./textarea-BymfnIK1.js";
import { c as createQuestionnaireSchema } from "./questionnaire-DGzIDWUe.js";
import { g as getQuestionnaireColumns } from "./columns-C4dU6pNa.js";
import "@tanstack/react-router";
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
import "@radix-ui/react-switch";
function QuestionnaireList({ data }) {
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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
    }
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
    }
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
    }
  });
  const columns = getQuestionnaireColumns(
    () => {
    },
    (item) => updateMutation.mutate({
      data: {
        id: item.id,
        is_active: !item.is_active
      }
    })
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
    getPaginationRowModel: getPaginationRowModel()
  });
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      is_active: false
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
      await createMutation.mutateAsync({
        data: {
          title: value.title,
          description: value.description || null,
          is_active: value.is_active
        }
      });
    }
  });
  return /* @__PURE__ */ jsxs(Main, { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold tracking-tight", children: "Questionnaires" }),
      /* @__PURE__ */ jsxs(Dialog, { open: isCreateOpen, onOpenChange: setIsCreateOpen, children: [
        /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "cursor-pointer", children: [
          /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
          " Add Questionnaire"
        ] }) }),
        /* @__PURE__ */ jsxs(DialogContent, { children: [
          /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Create Questionnaire" }) }),
          /* @__PURE__ */ jsxs(
            "form",
            {
              onSubmit: (e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              },
              className: "space-y-4",
              children: [
                /* @__PURE__ */ jsx(form.Field, { name: "title", children: (field) => /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: field.name, children: "Title" }),
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      id: field.name,
                      value: field.state.value,
                      onBlur: field.handleBlur,
                      onChange: (e) => field.handleChange(e.target.value)
                    }
                  ),
                  field.state.meta.errors ? /* @__PURE__ */ jsx("p", { className: "text-destructive text-sm", children: field.state.meta.errors.join(", ") }) : null
                ] }) }),
                /* @__PURE__ */ jsx(form.Field, { name: "description", children: (field) => /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
                  /* @__PURE__ */ jsx(Label, { htmlFor: field.name, children: "Description" }),
                  /* @__PURE__ */ jsx(
                    Textarea,
                    {
                      id: field.name,
                      value: field.state.value,
                      onBlur: field.handleBlur,
                      onChange: (e) => field.handleChange(e.target.value)
                    }
                  )
                ] }) }),
                /* @__PURE__ */ jsx(form.Field, { name: "is_active", children: (field) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(
                    Switch,
                    {
                      id: field.name,
                      checked: field.state.value,
                      onCheckedChange: field.handleChange
                    }
                  ),
                  /* @__PURE__ */ jsx(Label, { htmlFor: field.name, children: "Set as Active" })
                ] }) }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    type: "submit",
                    className: "w-full cursor-pointer",
                    disabled: createMutation.isPending,
                    children: createMutation.isPending ? "Creating..." : "Create"
                  }
                )
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(DataTableToolbar, { table, searchKey: "title" }),
    /* @__PURE__ */ jsx("div", { className: "rounded-md border", children: /* @__PURE__ */ jsxs("table", { className: "w-full caption-bottom text-sm", children: [
      /* @__PURE__ */ jsx("thead", { className: "[&_tr]:border-b", children: table.getHeaderGroups().map((headerGroup) => /* @__PURE__ */ jsx(
        "tr",
        {
          className: "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
          children: headerGroup.headers.map((header) => /* @__PURE__ */ jsx(
            "th",
            {
              className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
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
      /* @__PURE__ */ jsx("tbody", { className: "[&_tr:last-child]:border-0", children: table.getRowModel().rows?.length ? table.getRowModel().rows.map((row) => /* @__PURE__ */ jsx(
        "tr",
        {
          "data-state": row.getIsSelected() && "selected",
          className: "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
          children: row.getVisibleCells().map((cell) => /* @__PURE__ */ jsx(
            "td",
            {
              className: "p-4 align-middle [&:has([role=checkbox])]:pr-0",
              children: flexRender(
                cell.column.columnDef.cell,
                cell.getContext()
              )
            },
            cell.id
          ))
        },
        row.id
      )) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: columns.length, className: "h-24 text-center", children: "No results." }) }) })
    ] }) }),
    /* @__PURE__ */ jsx(DataTablePagination, { table }),
    /* @__PURE__ */ jsx(DataTableBulkActions, { table, entityName: "questionnaire", children: /* @__PURE__ */ jsxs(
      Button,
      {
        variant: "destructive",
        size: "sm",
        className: "h-8 cursor-pointer",
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
const questionnairesQueryOptions = queryOptions({
  queryKey: ["admin", "questionnaires"],
  queryFn: () => getQuestionnaires()
});
function QuestionnairesRouteComponent() {
  const query = useSuspenseQuery(questionnairesQueryOptions);
  return /* @__PURE__ */ jsx(QuestionnaireList, { data: query.data });
}
export {
  QuestionnairesRouteComponent as component
};
