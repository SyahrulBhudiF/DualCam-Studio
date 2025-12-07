import { jsxs, jsx } from "react/jsx-runtime";
import { format } from "date-fns";
import { Download, FileSpreadsheet, ChevronLeft, ChevronRight } from "lucide-react";
import * as XLSX from "xlsx";
import { B as Button, b as buttonVariants } from "./button-CmIj-cVl.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, e as DropdownMenuItem } from "./dropdown-menu-DNyQp_hH.js";
import { DayPicker } from "react-day-picker";
import { c as cn } from "./supabase-0PR4I26a.js";
function exportResponsesToExcel(responses) {
  const data = responses.map((r) => ({
    Name: r.profile?.name ?? "-",
    Email: r.profile?.email ?? "-",
    NIM: r.profile?.nim ?? "-",
    Class: r.profile?.class ?? "-",
    Semester: r.profile?.semester ?? "-",
    Gender: r.profile?.gender ?? "-",
    Age: r.profile?.age ?? "-",
    Questionnaire: r.questionnaireTitle ?? "-",
    "Total Score": r.totalScore,
    "Has Video": r.videoPath && r.videoPath !== "null" ? "Yes" : "No",
    "Submitted At": format(new Date(r.createdAt), "dd/MM/yyyy HH:mm:ss")
  }));
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");
  const colWidths = [
    { wch: 25 },
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 10 },
    { wch: 8 },
    { wch: 30 },
    { wch: 12 },
    { wch: 10 },
    { wch: 20 }
  ];
  worksheet["!cols"] = colWidths;
  const filename = `responses_${format(/* @__PURE__ */ new Date(), "yyyyMMdd_HHmmss")}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
function exportResponseDetailToExcel(response) {
  const profileData = [
    {
      Field: "Name",
      Value: response.profile?.name ?? "-"
    },
    {
      Field: "Email",
      Value: response.profile?.email ?? "-"
    },
    {
      Field: "NIM",
      Value: response.profile?.nim ?? "-"
    },
    {
      Field: "Class",
      Value: response.profile?.class ?? "-"
    },
    {
      Field: "Semester",
      Value: response.profile?.semester ?? "-"
    },
    {
      Field: "Gender",
      Value: response.profile?.gender ?? "-"
    },
    {
      Field: "Age",
      Value: response.profile?.age ?? "-"
    },
    {
      Field: "Questionnaire",
      Value: response.questionnaire?.title ?? "-"
    },
    {
      Field: "Total Score",
      Value: response.totalScore
    },
    {
      Field: "Submitted At",
      Value: format(new Date(response.createdAt), "dd/MM/yyyy HH:mm:ss")
    }
  ];
  const sortedDetails = [...response.details].sort(
    (a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0)
  );
  const answersData = sortedDetails.map((d, index) => ({
    "#": d.orderNumber ?? index + 1,
    Question: d.questionText ?? "-",
    Answer: d.answerText ?? "-",
    Score: d.score
  }));
  const workbook = XLSX.utils.book_new();
  const profileSheet = XLSX.utils.json_to_sheet(profileData);
  profileSheet["!cols"] = [{ wch: 15 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(workbook, profileSheet, "Profile");
  const answersSheet = XLSX.utils.json_to_sheet(answersData);
  answersSheet["!cols"] = [{ wch: 5 }, { wch: 50 }, { wch: 40 }, { wch: 8 }];
  XLSX.utils.book_append_sheet(workbook, answersSheet, "Answers");
  const safeName = (response.profile?.name ?? "unknown").replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const filename = `response_${safeName}_${format(/* @__PURE__ */ new Date(), "yyyyMMdd_HHmmss")}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
function ExportResponsesButton({ responses }) {
  return /* @__PURE__ */ jsxs(
    Button,
    {
      onClick: () => exportResponsesToExcel(responses),
      className: "cursor-pointer",
      children: [
        /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-4 w-4 mr-2" }),
        "Export Excel"
      ]
    }
  );
}
function ExportResponseDetailButton({ response }) {
  return /* @__PURE__ */ jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "cursor-pointer", children: [
      /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-2" }),
      "Export"
    ] }) }),
    /* @__PURE__ */ jsx(DropdownMenuContent, { align: "end", children: /* @__PURE__ */ jsxs(
      DropdownMenuItem,
      {
        onClick: () => exportResponseDetailToExcel(response),
        className: "cursor-pointer",
        children: [
          /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-4 w-4 mr-2" }),
          "Export as Excel"
        ]
      }
    ) })
  ] });
}
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DayPicker,
    {
      showOutsideDays,
      className: cn("p-3", className),
      classNames: {
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        range_end: "day-range-end",
        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside: "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames
      },
      components: {
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" });
        }
      },
      ...props
    }
  );
}
Calendar.displayName = "Calendar";
export {
  Calendar as C,
  ExportResponsesButton as E,
  ExportResponseDetailButton as a
};
