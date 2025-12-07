import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import "react";
import { B as Badge } from "./badge-CiJstU-m.js";
import { B as Button } from "./button-CmIj-cVl.js";
import "clsx";
import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon, EyeNoneIcon } from "@radix-ui/react-icons";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, e as DropdownMenuItem, d as DropdownMenuSeparator } from "./dropdown-menu-DNyQp_hH.js";
import { c as cn } from "./supabase-0PR4I26a.js";
import { C as Checkbox } from "./checkbox-DzKehuGR.js";
function DataTableColumnHeader({
  column,
  title,
  className
}) {
  if (!column.getCanSort()) {
    return /* @__PURE__ */ jsx("div", { className: cn(className), children: title });
  }
  return /* @__PURE__ */ jsx("div", { className: cn("flex items-center space-x-2", className), children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      Button,
      {
        variant: "ghost",
        size: "sm",
        className: "data-[state=open]:bg-accent h-8",
        children: [
          /* @__PURE__ */ jsx("span", { children: title }),
          column.getIsSorted() === "desc" ? /* @__PURE__ */ jsx(ArrowDownIcon, { className: "ms-2 h-4 w-4" }) : column.getIsSorted() === "asc" ? /* @__PURE__ */ jsx(ArrowUpIcon, { className: "ms-2 h-4 w-4" }) : /* @__PURE__ */ jsx(CaretSortIcon, { className: "ms-2 h-4 w-4" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "start", children: [
      /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => column.toggleSorting(false), children: [
        /* @__PURE__ */ jsx(ArrowUpIcon, { className: "text-muted-foreground/70 size-3.5" }),
        "Asc"
      ] }),
      /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => column.toggleSorting(true), children: [
        /* @__PURE__ */ jsx(ArrowDownIcon, { className: "text-muted-foreground/70 size-3.5" }),
        "Desc"
      ] }),
      column.getCanHide() && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
        /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => column.toggleVisibility(false), children: [
          /* @__PURE__ */ jsx(EyeNoneIcon, { className: "text-muted-foreground/70 size-3.5" }),
          "Hide"
        ] })
      ] })
    ] })
  ] }) });
}
const getQuestionnaireColumns = (onEdit, onToggleStatus) => [
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
    accessorKey: "title",
    header: ({ column }) => /* @__PURE__ */ jsx(DataTableColumnHeader, { column, title: "Title" }),
    cell: ({ row }) => /* @__PURE__ */ jsx("span", { className: "font-medium", children: row.getValue("title") })
  },
  {
    accessorKey: "description",
    header: ({ column }) => /* @__PURE__ */ jsx(DataTableColumnHeader, { column, title: "Description" }),
    cell: ({ row }) => /* @__PURE__ */ jsx("span", { className: "text-muted-foreground truncate max-w-[300px] block", children: row.getValue("description") })
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => /* @__PURE__ */ jsx(DataTableColumnHeader, { column, title: "Status" }),
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");
      return /* @__PURE__ */ jsx(Badge, { variant: isActive ? "default" : "secondary", children: isActive ? "Active" : "Inactive" });
    }
  },
  {
    id: "actions",
    cell: ({ row }) => /* @__PURE__ */ jsxs(DropdownMenu, { children: [
      /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", className: "h-8 w-8 p-0", children: [
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Open menu" }),
        /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" })
      ] }) }),
      /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
        /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsx(
          Link,
          {
            to: "/admin/questionnaires/$questionnaireId",
            params: { questionnaireId: row.original.id },
            children: "View Details"
          }
        ) }),
        /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => onToggleStatus(row.original), children: row.original.is_active ? "Set Inactive" : "Set Active" })
      ] })
    ] })
  }
];
const getQuestionColumns = (questionnaireId, onEdit) => [
  {
    id: "select",
    header: ({ table }) => /* @__PURE__ */ jsx(
      Checkbox,
      {
        checked: table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected() && "indeterminate",
        onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value)
      }
    ),
    cell: ({ row }) => /* @__PURE__ */ jsx(
      Checkbox,
      {
        checked: row.getIsSelected(),
        onCheckedChange: (value) => row.toggleSelected(!!value)
      }
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "order_number",
    header: ({ column }) => /* @__PURE__ */ jsx(DataTableColumnHeader, { column, title: "Order" }),
    cell: ({ row }) => /* @__PURE__ */ jsx("div", { className: "pl-4", children: row.getValue("order_number") })
  },
  {
    accessorKey: "question_text",
    header: ({ column }) => /* @__PURE__ */ jsx(DataTableColumnHeader, { column, title: "Question" }),
    cell: ({ row }) => /* @__PURE__ */ jsx("span", { className: "font-medium", children: row.getValue("question_text") })
  },
  {
    id: "actions",
    cell: ({ row }) => /* @__PURE__ */ jsxs(DropdownMenu, { children: [
      /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "h-8 w-8 p-0", children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
        /* @__PURE__ */ jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsx(
          Link,
          {
            to: "/admin/questionnaires/$questionnaireId/$questionId",
            params: { questionnaireId, questionId: row.original.id },
            children: "Manage Answers"
          }
        ) }),
        /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => onEdit(row.original), children: "Edit" })
      ] })
    ] })
  }
];
const getAnswerColumns = (onEdit) => [
  {
    id: "select",
    header: ({ table }) => /* @__PURE__ */ jsx(
      Checkbox,
      {
        checked: table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected() && "indeterminate",
        onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value)
      }
    ),
    cell: ({ row }) => /* @__PURE__ */ jsx(
      Checkbox,
      {
        checked: row.getIsSelected(),
        onCheckedChange: (value) => row.toggleSelected(!!value)
      }
    ),
    enableSorting: false
  },
  {
    accessorKey: "answer_text",
    header: ({ column }) => /* @__PURE__ */ jsx(DataTableColumnHeader, { column, title: "Answer" }),
    cell: ({ row }) => /* @__PURE__ */ jsx("span", { className: "font-medium", children: row.getValue("answer_text") })
  },
  {
    accessorKey: "score",
    header: ({ column }) => /* @__PURE__ */ jsx(DataTableColumnHeader, { column, title: "Score" }),
    cell: ({ row }) => /* @__PURE__ */ jsx("div", { children: row.getValue("score") })
  },
  {
    id: "actions",
    cell: ({ row }) => /* @__PURE__ */ jsxs(DropdownMenu, { children: [
      /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "h-8 w-8 p-0", children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx(DropdownMenuContent, { align: "end", children: /* @__PURE__ */ jsx(DropdownMenuItem, { onClick: () => onEdit(row.original), children: "Edit" }) })
    ] })
  }
];
export {
  getQuestionColumns as a,
  getAnswerColumns as b,
  getQuestionnaireColumns as g
};
