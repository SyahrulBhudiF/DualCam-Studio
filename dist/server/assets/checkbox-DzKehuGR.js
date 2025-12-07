import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { X, CheckIcon as CheckIcon$1 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { B as Badge } from "./badge-CiJstU-m.js";
import { B as Button } from "./button-CmIj-cVl.js";
import { a as Tooltip, b as TooltipTrigger, c as TooltipContent, S as Separator, j as Command, d as CommandInput, e as CommandList, f as CommandEmpty, g as CommandGroup, h as CommandItem, i as CommandSeparator } from "./command-p92Os1Jt.js";
import { c as cn, b as getPageNumbers } from "./supabase-0PR4I26a.js";
import { PlusCircledIcon, CheckIcon, DoubleArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, DoubleArrowRightIcon, MixerHorizontalIcon, Cross2Icon } from "@radix-ui/react-icons";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-WKwWO3Fr.js";
import { I as Input } from "./input-DtwcC6CR.js";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { D as DropdownMenu, b as DropdownMenuContent, c as DropdownMenuLabel, d as DropdownMenuSeparator, h as DropdownMenuCheckboxItem } from "./dropdown-menu-DNyQp_hH.js";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
function DataTableBulkActions({
  table,
  entityName,
  children
}) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const toolbarRef = useRef(null);
  const [announcement, setAnnouncement] = useState("");
  useEffect(() => {
    if (selectedCount > 0) {
      const message = `${selectedCount} ${entityName}${selectedCount > 1 ? "s" : ""} selected. Bulk actions toolbar is available.`;
      queueMicrotask(() => {
        setAnnouncement(message);
      });
      const timer = setTimeout(() => setAnnouncement(""), 3e3);
      return () => clearTimeout(timer);
    }
  }, [selectedCount, entityName]);
  const handleClearSelection = () => {
    table.resetRowSelection();
  };
  const handleKeyDown = (event) => {
    const buttons = toolbarRef.current?.querySelectorAll("button");
    if (!buttons) return;
    const currentIndex = Array.from(buttons).findIndex(
      (button) => button === document.activeElement
    );
    switch (event.key) {
      case "ArrowRight": {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % buttons.length;
        buttons[nextIndex]?.focus();
        break;
      }
      case "ArrowLeft": {
        event.preventDefault();
        const prevIndex = currentIndex === 0 ? buttons.length - 1 : currentIndex - 1;
        buttons[prevIndex]?.focus();
        break;
      }
      case "Home":
        event.preventDefault();
        buttons[0]?.focus();
        break;
      case "End":
        event.preventDefault();
        buttons[buttons.length - 1]?.focus();
        break;
      case "Escape": {
        const target = event.target;
        const activeElement = document.activeElement;
        const isFromDropdownTrigger = target?.getAttribute("data-slot") === "dropdown-menu-trigger" || activeElement?.getAttribute("data-slot") === "dropdown-menu-trigger" || target?.closest('[data-slot="dropdown-menu-trigger"]') || activeElement?.closest('[data-slot="dropdown-menu-trigger"]');
        const isFromDropdownContent = activeElement?.closest('[data-slot="dropdown-menu-content"]') || target?.closest('[data-slot="dropdown-menu-content"]');
        if (isFromDropdownTrigger || isFromDropdownContent) {
          return;
        }
        event.preventDefault();
        handleClearSelection();
        break;
      }
    }
  };
  if (selectedCount === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        "aria-live": "polite",
        "aria-atomic": "true",
        className: "sr-only",
        role: "status",
        children: announcement
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        ref: toolbarRef,
        role: "toolbar",
        "aria-label": `Bulk actions for ${selectedCount} selected ${entityName}${selectedCount > 1 ? "s" : ""}`,
        "aria-describedby": "bulk-actions-description",
        tabIndex: -1,
        onKeyDown: handleKeyDown,
        className: cn(
          "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl",
          "transition-all delay-100 duration-300 ease-out hover:scale-105",
          "focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none"
        ),
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            className: cn(
              "p-2 shadow-xl",
              "rounded-xl border",
              "bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur-lg",
              "flex items-center gap-x-2"
            ),
            children: [
              /* @__PURE__ */ jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
                  Button,
                  {
                    variant: "outline",
                    size: "icon",
                    onClick: handleClearSelection,
                    className: "size-6 rounded-full",
                    "aria-label": "Clear selection",
                    title: "Clear selection (Escape)",
                    children: [
                      /* @__PURE__ */ jsx(X, {}),
                      /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Clear selection" })
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsx(TooltipContent, { children: /* @__PURE__ */ jsx("p", { children: "Clear selection (Escape)" }) })
              ] }),
              /* @__PURE__ */ jsx(
                Separator,
                {
                  className: "h-5",
                  orientation: "vertical",
                  "aria-hidden": "true"
                }
              ),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "flex items-center gap-x-1 text-sm",
                  id: "bulk-actions-description",
                  children: [
                    /* @__PURE__ */ jsx(
                      Badge,
                      {
                        variant: "default",
                        className: "min-w-8 rounded-lg",
                        "aria-label": `${selectedCount} selected`,
                        children: selectedCount
                      }
                    ),
                    " ",
                    /* @__PURE__ */ jsxs("span", { className: "hidden sm:inline", children: [
                      entityName,
                      selectedCount > 1 ? "s" : ""
                    ] }),
                    " ",
                    "selected"
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                Separator,
                {
                  className: "h-5",
                  orientation: "vertical",
                  "aria-hidden": "true"
                }
              ),
              children
            ]
          }
        )
      }
    )
  ] });
}
function Popover({
  ...props
}) {
  return /* @__PURE__ */ jsx(PopoverPrimitive.Root, { "data-slot": "popover", ...props });
}
function PopoverTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(PopoverPrimitive.Trigger, { "data-slot": "popover-trigger", ...props });
}
function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}) {
  return /* @__PURE__ */ jsx(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx(
    PopoverPrimitive.Content,
    {
      "data-slot": "popover-content",
      align,
      sideOffset,
      className: cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
        className
      ),
      ...props
    }
  ) });
}
function DataTableFacetedFilter({
  column,
  title,
  options
}) {
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set(column?.getFilterValue());
  return /* @__PURE__ */ jsxs(Popover, { children: [
    /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "h-8 border-dashed", children: [
      /* @__PURE__ */ jsx(PlusCircledIcon, { className: "size-4" }),
      title,
      selectedValues?.size > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Separator, { orientation: "vertical", className: "mx-2 h-4" }),
        /* @__PURE__ */ jsx(
          Badge,
          {
            variant: "secondary",
            className: "rounded-sm px-1 font-normal lg:hidden",
            children: selectedValues.size
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "hidden space-x-1 lg:flex", children: selectedValues.size > 2 ? /* @__PURE__ */ jsxs(
          Badge,
          {
            variant: "secondary",
            className: "rounded-sm px-1 font-normal",
            children: [
              selectedValues.size,
              " selected"
            ]
          }
        ) : options.filter((option) => selectedValues.has(option.value)).map((option) => /* @__PURE__ */ jsx(
          Badge,
          {
            variant: "secondary",
            className: "rounded-sm px-1 font-normal",
            children: option.label
          },
          option.value
        )) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(PopoverContent, { className: "w-[200px] p-0", align: "start", children: /* @__PURE__ */ jsxs(Command, { children: [
      /* @__PURE__ */ jsx(CommandInput, { placeholder: title }),
      /* @__PURE__ */ jsxs(CommandList, { children: [
        /* @__PURE__ */ jsx(CommandEmpty, { children: "No results found." }),
        /* @__PURE__ */ jsx(CommandGroup, { children: options.map((option) => {
          const isSelected = selectedValues.has(option.value);
          return /* @__PURE__ */ jsxs(
            CommandItem,
            {
              onSelect: () => {
                if (isSelected) {
                  selectedValues.delete(option.value);
                } else {
                  selectedValues.add(option.value);
                }
                const filterValues = Array.from(selectedValues);
                column?.setFilterValue(
                  filterValues.length ? filterValues : void 0
                );
              },
              children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: cn(
                      "border-primary flex size-4 items-center justify-center rounded-sm border",
                      isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                    ),
                    children: /* @__PURE__ */ jsx(CheckIcon, { className: cn("text-background h-4 w-4") })
                  }
                ),
                option.icon && /* @__PURE__ */ jsx(option.icon, { className: "text-muted-foreground size-4" }),
                /* @__PURE__ */ jsx("span", { children: option.label }),
                facets?.get(option.value) && /* @__PURE__ */ jsx("span", { className: "ms-auto flex h-4 w-4 items-center justify-center font-mono text-xs", children: facets.get(option.value) })
              ]
            },
            option.value
          );
        }) }),
        selectedValues.size > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(CommandSeparator, {}),
          /* @__PURE__ */ jsx(CommandGroup, { children: /* @__PURE__ */ jsx(
            CommandItem,
            {
              onSelect: () => column?.setFilterValue(void 0),
              className: "justify-center text-center",
              children: "Clear filters"
            }
          ) })
        ] })
      ] })
    ] }) })
  ] });
}
function DataTablePagination({
  table,
  className
}) {
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex items-center justify-between overflow-clip px-2",
        "@max-2xl/content:flex-col-reverse @max-2xl/content:gap-4",
        className
      ),
      style: { overflowClipMargin: 1 },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex w-full items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex w-[100px] items-center justify-center text-sm font-medium @2xl/content:hidden", children: [
            "Page ",
            currentPage,
            " of ",
            totalPages
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 @max-2xl/content:flex-row-reverse", children: [
            /* @__PURE__ */ jsxs(
              Select,
              {
                value: `${table.getState().pagination.pageSize}`,
                onValueChange: (value) => {
                  table.setPageSize(Number(value));
                },
                children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { className: "h-8 w-[70px]", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: table.getState().pagination.pageSize }) }),
                  /* @__PURE__ */ jsx(SelectContent, { side: "top", children: [10, 20, 30, 40, 50].map((pageSize) => /* @__PURE__ */ jsx(SelectItem, { value: `${pageSize}`, children: pageSize }, pageSize)) })
                ]
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "hidden text-sm font-medium sm:block", children: "Rows per page" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center sm:space-x-6 lg:space-x-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex w-[100px] items-center justify-center text-sm font-medium @max-3xl/content:hidden", children: [
            "Page ",
            currentPage,
            " of ",
            totalPages
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "outline",
                className: "size-8 p-0 @max-md/content:hidden",
                onClick: () => table.setPageIndex(0),
                disabled: !table.getCanPreviousPage(),
                children: [
                  /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Go to first page" }),
                  /* @__PURE__ */ jsx(DoubleArrowLeftIcon, { className: "h-4 w-4" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "outline",
                className: "size-8 p-0",
                onClick: () => table.previousPage(),
                disabled: !table.getCanPreviousPage(),
                children: [
                  /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Go to previous page" }),
                  /* @__PURE__ */ jsx(ChevronLeftIcon, { className: "h-4 w-4" })
                ]
              }
            ),
            pageNumbers.map((pageNumber, index) => /* @__PURE__ */ jsx("div", { className: "flex items-center", children: pageNumber === "..." ? /* @__PURE__ */ jsx("span", { className: "text-muted-foreground px-1 text-sm", children: "..." }) : /* @__PURE__ */ jsxs(
              Button,
              {
                variant: currentPage === pageNumber ? "default" : "outline",
                className: "h-8 min-w-8 px-2",
                onClick: () => table.setPageIndex(pageNumber - 1),
                children: [
                  /* @__PURE__ */ jsxs("span", { className: "sr-only", children: [
                    "Go to page ",
                    pageNumber
                  ] }),
                  pageNumber
                ]
              }
            ) }, `${pageNumber}-${index}`)),
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "outline",
                className: "size-8 p-0",
                onClick: () => table.nextPage(),
                disabled: !table.getCanNextPage(),
                children: [
                  /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Go to next page" }),
                  /* @__PURE__ */ jsx(ChevronRightIcon, { className: "h-4 w-4" })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "outline",
                className: "size-8 p-0 @max-md/content:hidden",
                onClick: () => table.setPageIndex(table.getPageCount() - 1),
                disabled: !table.getCanNextPage(),
                children: [
                  /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Go to last page" }),
                  /* @__PURE__ */ jsx(DoubleArrowRightIcon, { className: "h-4 w-4" })
                ]
              }
            )
          ] })
        ] })
      ]
    }
  );
}
function DataTableViewOptions({
  table
}) {
  return /* @__PURE__ */ jsxs(DropdownMenu, { modal: false, children: [
    /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      Button,
      {
        variant: "outline",
        size: "sm",
        className: "ms-auto hidden h-8 lg:flex",
        children: [
          /* @__PURE__ */ jsx(MixerHorizontalIcon, { className: "size-4" }),
          "View"
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", className: "w-[150px]", children: [
      /* @__PURE__ */ jsx(DropdownMenuLabel, { children: "Toggle columns" }),
      /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
      table.getAllColumns().filter(
        (column) => typeof column.accessorFn !== "undefined" && column.getCanHide()
      ).map((column) => {
        return /* @__PURE__ */ jsx(
          DropdownMenuCheckboxItem,
          {
            className: "capitalize",
            checked: column.getIsVisible(),
            onCheckedChange: (value) => column.toggleVisibility(!!value),
            children: column.id
          },
          column.id
        );
      })
    ] })
  ] });
}
function DataTableToolbar({
  table,
  searchPlaceholder = "Filter...",
  searchKey,
  filters = []
}) {
  const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter;
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2", children: [
      searchKey ? /* @__PURE__ */ jsx(
        Input,
        {
          placeholder: searchPlaceholder,
          value: table.getColumn(searchKey)?.getFilterValue() ?? "",
          onChange: (event) => table.getColumn(searchKey)?.setFilterValue(event.target.value),
          className: "h-8 w-[150px] lg:w-[250px]"
        }
      ) : /* @__PURE__ */ jsx(
        Input,
        {
          placeholder: searchPlaceholder,
          value: table.getState().globalFilter ?? "",
          onChange: (event) => table.setGlobalFilter(event.target.value),
          className: "h-8 w-[150px] lg:w-[250px]"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "flex gap-x-2", children: filters.map((filter) => {
        const column = table.getColumn(filter.columnId);
        if (!column) return null;
        return /* @__PURE__ */ jsx(
          DataTableFacetedFilter,
          {
            column,
            title: filter.title,
            options: filter.options
          },
          filter.columnId
        );
      }) }),
      isFiltered && /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "ghost",
          onClick: () => {
            table.resetColumnFilters();
            table.setGlobalFilter("");
          },
          className: "h-8 px-2 lg:px-3",
          children: [
            "Reset",
            /* @__PURE__ */ jsx(Cross2Icon, { className: "ms-2 h-4 w-4" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx(DataTableViewOptions, { table })
  ] });
}
function Checkbox({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    CheckboxPrimitive.Root,
    {
      "data-slot": "checkbox",
      className: cn(
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        CheckboxPrimitive.Indicator,
        {
          "data-slot": "checkbox-indicator",
          className: "grid place-content-center text-current transition-none",
          children: /* @__PURE__ */ jsx(CheckIcon$1, { className: "size-3.5" })
        }
      )
    }
  );
}
export {
  Checkbox as C,
  DataTableToolbar as D,
  Popover as P,
  PopoverTrigger as a,
  PopoverContent as b,
  DataTablePagination as c,
  DataTableBulkActions as d
};
