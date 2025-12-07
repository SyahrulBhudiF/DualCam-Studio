import { jsx, jsxs } from "react/jsx-runtime";
import "clsx";
import { B as Button } from "./button-CmIj-cVl.js";
import { B as Badge } from "./badge-CiJstU-m.js";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useReactTable, getPaginationRowModel, getFilteredRowModel, getSortedRowModel, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { ArrowUpDown, Video, Eye, Filter, CalendarIcon, X, Trash } from "lucide-react";
import { toast } from "sonner";
import { f as getResponsesFiltered, h as deleteResponses, R as Route } from "./router-BmiHf_ZJ.js";
import { C as Checkbox, P as Popover, a as PopoverTrigger, b as PopoverContent, D as DataTableToolbar, c as DataTablePagination, d as DataTableBulkActions } from "./checkbox-DzKehuGR.js";
import { M as Main } from "./main-CFzJm1Bk.js";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { C as Calendar, E as ExportResponsesButton } from "./calendar-D2J7gS5B.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-WKwWO3Fr.js";
import { c as cn } from "./supabase-0PR4I26a.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
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
import "next-themes";
import "@radix-ui/react-direction";
import "js-cookie";
import "node:fs";
import "node:path";
import "./questionnaire-DGzIDWUe.js";
import "zustand";
import "./command-p92Os1Jt.js";
import "@radix-ui/react-separator";
import "@radix-ui/react-tooltip";
import "cmdk";
import "./dialog-a33jwLhQ.js";
import "@radix-ui/react-dialog";
import "@radix-ui/react-icons";
import "./input-DtwcC6CR.js";
import "@radix-ui/react-popover";
import "@radix-ui/react-dropdown-menu";
import "./dropdown-menu-DNyQp_hH.js";
import "@radix-ui/react-checkbox";
import "xlsx";
import "react-day-picker";
import "@radix-ui/react-select";
import "@supabase/ssr";
import "tailwind-merge";
function getResponseColumns() {
  return [
    {
      id: "select",
      header: ({ table }) => /* @__PURE__ */ jsx(
        Checkbox,
        {
          checked: table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected() && "indeterminate",
          onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
          "aria-label": "Select all"
        }
      ),
      cell: ({ row }) => /* @__PURE__ */ jsx(
        Checkbox,
        {
          checked: row.getIsSelected(),
          onCheckedChange: (value) => row.toggleSelected(!!value),
          "aria-label": "Select row"
        }
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: "profile.name",
      id: "name",
      header: ({ column }) => /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
          className: "cursor-pointer",
          children: [
            "Name",
            /* @__PURE__ */ jsx(ArrowUpDown, { className: "ml-2 h-4 w-4" })
          ]
        }
      ),
      cell: ({ row }) => /* @__PURE__ */ jsx("div", { className: "font-medium", children: row.original.profile?.name ?? "-" })
    },
    {
      accessorKey: "profile.class",
      id: "class",
      header: ({ column }) => /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
          className: "cursor-pointer",
          children: [
            "Class",
            /* @__PURE__ */ jsx(ArrowUpDown, { className: "ml-2 h-4 w-4" })
          ]
        }
      ),
      cell: ({ row }) => /* @__PURE__ */ jsx(Badge, { variant: "outline", children: row.original.profile?.class ?? "-" })
    },
    {
      accessorKey: "profile.nim",
      id: "nim",
      header: "NIM",
      cell: ({ row }) => /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: row.original.profile?.nim ?? "-" })
    },
    {
      accessorKey: "questionnaireTitle",
      id: "questionnaire",
      header: ({ column }) => /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
          className: "cursor-pointer",
          children: [
            "Questionnaire",
            /* @__PURE__ */ jsx(ArrowUpDown, { className: "ml-2 h-4 w-4" })
          ]
        }
      ),
      cell: ({ row }) => /* @__PURE__ */ jsx("div", { className: "max-w-[200px] truncate", children: row.original.questionnaireTitle ?? "-" })
    },
    {
      accessorKey: "totalScore",
      id: "score",
      header: ({ column }) => /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
          className: "cursor-pointer",
          children: [
            "Score",
            /* @__PURE__ */ jsx(ArrowUpDown, { className: "ml-2 h-4 w-4" })
          ]
        }
      ),
      cell: ({ row }) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: row.original.totalScore })
    },
    {
      accessorKey: "videoPath",
      id: "video",
      header: "Video",
      cell: ({ row }) => {
        const hasVideo = row.original.videoPath && row.original.videoPath !== "null";
        return hasVideo ? /* @__PURE__ */ jsxs(Badge, { variant: "default", className: "gap-1", children: [
          /* @__PURE__ */ jsx(Video, { className: "h-3 w-3" }),
          "Yes"
        ] }) : /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "No" });
      }
    },
    {
      accessorKey: "createdAt",
      id: "date",
      header: ({ column }) => /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
          className: "cursor-pointer",
          children: [
            "Date",
            /* @__PURE__ */ jsx(ArrowUpDown, { className: "ml-2 h-4 w-4" })
          ]
        }
      ),
      cell: ({ row }) => /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-sm", children: format(new Date(row.original.createdAt), "dd MMM yyyy HH:mm") })
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => /* @__PURE__ */ jsx(
        Link,
        {
          to: "/admin/responses/$responseId",
          params: { responseId: row.original.id },
          children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", className: "cursor-pointer", children: [
            /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 mr-1" }),
            "View"
          ] })
        }
      )
    }
  ];
}
const ALL_VALUE = "__all__";
function ResponseFilters({
  filterOptions,
  onFilterApply,
  onFilterClear
}) {
  const [questionnaireId, setQuestionnaireId] = useState(ALL_VALUE);
  const [className, setClassName] = useState(ALL_VALUE);
  const [startDate, setStartDate] = useState(void 0);
  const [endDate, setEndDate] = useState(void 0);
  const filterMutation = useMutation({
    mutationFn: getResponsesFiltered,
    onSuccess: (data) => {
      onFilterApply(data);
    }
  });
  const handleApplyFilters = () => {
    filterMutation.mutate({
      data: {
        questionnaireId: questionnaireId !== ALL_VALUE ? questionnaireId : void 0,
        className: className !== ALL_VALUE ? className : void 0,
        startDate: startDate ? startDate.toISOString() : void 0,
        endDate: endDate ? endDate.toISOString() : void 0
      }
    });
  };
  const handleClearFilters = () => {
    setQuestionnaireId(ALL_VALUE);
    setClassName(ALL_VALUE);
    setStartDate(void 0);
    setEndDate(void 0);
    onFilterClear();
  };
  const hasActiveFilters = questionnaireId !== ALL_VALUE || className !== ALL_VALUE || startDate || endDate;
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3 p-4 border rounded-lg bg-muted/30", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Filters:" })
    ] }),
    /* @__PURE__ */ jsxs(Select, { value: questionnaireId, onValueChange: setQuestionnaireId, children: [
      /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[200px]", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "All Questionnaires" }) }),
      /* @__PURE__ */ jsxs(SelectContent, { children: [
        /* @__PURE__ */ jsx(SelectItem, { value: ALL_VALUE, children: "All Questionnaires" }),
        filterOptions.questionnaires.map((q) => /* @__PURE__ */ jsx(SelectItem, { value: q.id, children: q.title }, q.id))
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Select, { value: className, onValueChange: setClassName, children: [
      /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[150px]", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "All Classes" }) }),
      /* @__PURE__ */ jsxs(SelectContent, { children: [
        /* @__PURE__ */ jsx(SelectItem, { value: ALL_VALUE, children: "All Classes" }),
        filterOptions.classes.map((c) => /* @__PURE__ */ jsx(SelectItem, { value: c, children: c }, c))
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Popover, { children: [
      /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "outline",
          className: cn(
            "w-[140px] justify-start text-left font-normal",
            !startDate && "text-muted-foreground"
          ),
          children: [
            /* @__PURE__ */ jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }),
            startDate ? format(startDate, "dd/MM/yyyy") : "Start Date"
          ]
        }
      ) }),
      /* @__PURE__ */ jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: /* @__PURE__ */ jsx(
        Calendar,
        {
          mode: "single",
          selected: startDate,
          onSelect: setStartDate,
          initialFocus: true
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs(Popover, { children: [
      /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "outline",
          className: cn(
            "w-[140px] justify-start text-left font-normal",
            !endDate && "text-muted-foreground"
          ),
          children: [
            /* @__PURE__ */ jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }),
            endDate ? format(endDate, "dd/MM/yyyy") : "End Date"
          ]
        }
      ) }),
      /* @__PURE__ */ jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: /* @__PURE__ */ jsx(
        Calendar,
        {
          mode: "single",
          selected: endDate,
          onSelect: setEndDate,
          initialFocus: true
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx(
      Button,
      {
        onClick: handleApplyFilters,
        disabled: filterMutation.isPending,
        className: "cursor-pointer",
        children: filterMutation.isPending ? "Filtering..." : "Apply"
      }
    ),
    hasActiveFilters && /* @__PURE__ */ jsxs(
      Button,
      {
        variant: "ghost",
        size: "sm",
        onClick: handleClearFilters,
        className: "cursor-pointer",
        children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4 mr-1" }),
          "Clear"
        ]
      }
    )
  ] });
}
function ResponseList({ data, filterOptions }) {
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [filteredData, setFilteredData] = useState(
    null
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
    }
  });
  const columns = getResponseColumns();
  const tableData = filteredData ?? data;
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
    getPaginationRowModel: getPaginationRowModel()
  });
  const handleFilterApply = (filtered) => {
    setFilteredData(filtered);
    setRowSelection({});
  };
  const handleFilterClear = () => {
    setFilteredData(null);
    setRowSelection({});
  };
  return /* @__PURE__ */ jsxs(Main, { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold tracking-tight", children: "Responses" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "View and manage all questionnaire responses" })
      ] }),
      /* @__PURE__ */ jsx(ExportResponsesButton, { responses: tableData })
    ] }),
    /* @__PURE__ */ jsx(
      ResponseFilters,
      {
        filterOptions,
        onFilterApply: handleFilterApply,
        onFilterClear: handleFilterClear
      }
    ),
    /* @__PURE__ */ jsx(DataTableToolbar, { table, searchKey: "name" }),
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
      )) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: columns.length, className: "h-24 text-center", children: "No responses found." }) }) })
    ] }) }),
    /* @__PURE__ */ jsx(DataTablePagination, { table }),
    /* @__PURE__ */ jsx(DataTableBulkActions, { table, entityName: "response", children: /* @__PURE__ */ jsxs(
      Button,
      {
        variant: "destructive",
        size: "sm",
        className: "h-8 cursor-pointer",
        onClick: () => {
          const ids = table.getFilteredSelectedRowModel().rows.map((row) => row.original.id);
          deleteMutation.mutate({ data: { ids } });
        },
        disabled: deleteMutation.isPending,
        children: [
          /* @__PURE__ */ jsx(Trash, { className: "mr-2 h-4 w-4" }),
          deleteMutation.isPending ? "Deleting..." : "Delete Selected"
        ]
      }
    ) })
  ] });
}
function ResponsesPage() {
  const {
    responses,
    filterOptions
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsx(ResponseList, { data: responses, filterOptions });
}
export {
  ResponsesPage as component
};
