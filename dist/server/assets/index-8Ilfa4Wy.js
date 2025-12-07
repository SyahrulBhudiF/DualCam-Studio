import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useQuery, useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { n as getResponses, o as getDashboardSummary, p as getDashboardBreakdown, q as getAnalyticsDetails } from "./router-BmiHf_ZJ.js";
import { M as Main } from "./main-CFzJm1Bk.js";
import { B as Button } from "./button-CmIj-cVl.js";
import * as XLSX from "xlsx";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell, f as Tabs, g as TabsList, h as TabsTrigger, i as TabsContent } from "./tabs-S5ZPqgFb.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from "./card-BHTzFMfN.js";
import * as RechartsPrimitive from "recharts";
import { BarChart, CartesianGrid, YAxis, XAxis, Bar, LabelList } from "recharts";
import * as React from "react";
import { c as cn } from "./supabase-0PR4I26a.js";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Video, Eye } from "lucide-react";
import { B as Badge } from "./badge-CiJstU-m.js";
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
import "sonner";
import "@radix-ui/react-direction";
import "js-cookie";
import "node:fs";
import "node:path";
import "./questionnaire-DGzIDWUe.js";
import "zustand";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-tabs";
import "@supabase/ssr";
import "clsx";
import "tailwind-merge";
function exportDashboardToExcel({
  summary,
  breakdown,
  analytics
}) {
  const summarySheetData = [
    ["Metric", "Value"],
    ["Total Questionnaires", summary?.totalQuestionnaires ?? 0],
    ["Active Questionnaires", summary?.activeQuestionnaires ?? 0],
    ["Total Responses", summary?.totalResponses ?? 0],
    ["Average Score", summary?.averageScore ?? 0],
    ["Total Classes", summary?.totalClasses ?? 0]
  ];
  const questionnaireSheetData = [
    ["Questionnaire", "Total Responses", "Average Score"],
    ...(breakdown?.questionnaires ?? []).map((q) => [
      q.title,
      q.totalResponses,
      q.averageScore
    ])
  ];
  const classSheetData = [
    ["Class", "Total Responses", "Average Score"],
    ...(breakdown?.classes ?? []).map((c) => [
      c.className,
      c.totalResponses,
      c.averageScore
    ])
  ];
  const questionSheetData = [
    ["Order", "Question", "Average Score"],
    ...(analytics?.questions ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((q) => [q.order ?? "", q.text, q.averageScore])
  ];
  const answersSheetData = [
    ["Answer", "Question Id", "Total Responses", "Average Score"],
    ...(analytics?.answers ?? []).map((a) => [
      a.text,
      a.questionId ?? "",
      a.totalResponses,
      a.averageScore
    ])
  ];
  const timelineSheetData = [
    ["Date", "Total Responses", "Average Score"],
    ...(analytics?.timeline ?? []).map((t) => [
      t.date,
      t.totalResponses,
      t.averageScore
    ])
  ];
  const wb = XLSX.utils.book_new();
  const summaryWs = XLSX.utils.aoa_to_sheet(summarySheetData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");
  const questionnairesWs = XLSX.utils.aoa_to_sheet(questionnaireSheetData);
  XLSX.utils.book_append_sheet(wb, questionnairesWs, "Questionnaires");
  const classesWs = XLSX.utils.aoa_to_sheet(classSheetData);
  XLSX.utils.book_append_sheet(wb, classesWs, "Classes");
  const questionsWs = XLSX.utils.aoa_to_sheet(questionSheetData);
  XLSX.utils.book_append_sheet(wb, questionsWs, "Questions");
  const answersWs = XLSX.utils.aoa_to_sheet(answersSheetData);
  XLSX.utils.book_append_sheet(wb, answersWs, "Answers");
  const timelineWs = XLSX.utils.aoa_to_sheet(timelineSheetData);
  XLSX.utils.book_append_sheet(wb, timelineWs, "Timeline");
  XLSX.writeFile(wb, "dashboard-analytics.xlsx");
}
const THEMES = { light: "", dark: ".dark" };
const ChartContext = React.createContext(null);
function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}
function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;
  return /* @__PURE__ */ jsx(ChartContext.Provider, { value: { config }, children: /* @__PURE__ */ jsxs(
    "div",
    {
      "data-slot": "chart",
      "data-chart": chartId,
      className: cn(
        "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx(ChartStyle, { id: chartId, config }),
        /* @__PURE__ */ jsx(RechartsPrimitive.ResponsiveContainer, { children })
      ]
    }
  ) });
}
const ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config2]) => config2.theme || config2.color
  );
  if (!colorConfig.length) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    "style",
    {
      dangerouslySetInnerHTML: {
        __html: Object.entries(THEMES).map(
          ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig.map(([key, itemConfig]) => {
            const color = itemConfig.theme?.[theme] || itemConfig.color;
            return color ? `  --color-${key}: ${color};` : null;
          }).join("\n")}
}
`
        ).join("\n")
      }
    }
  );
};
const ChartTooltip = RechartsPrimitive.Tooltip;
function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey
}) {
  const { config } = useChart();
  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }
    const [item] = payload;
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value = !labelKey && typeof label === "string" ? config[label]?.label || label : itemConfig?.label;
    if (labelFormatter) {
      return /* @__PURE__ */ jsx("div", { className: cn("font-medium", labelClassName), children: labelFormatter(value, payload) });
    }
    if (!value) {
      return null;
    }
    return /* @__PURE__ */ jsx("div", { className: cn("font-medium", labelClassName), children: value });
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey
  ]);
  if (!active || !payload?.length) {
    return null;
  }
  const nestLabel = payload.length === 1 && indicator !== "dot";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className
      ),
      children: [
        !nestLabel ? tooltipLabel : null,
        /* @__PURE__ */ jsx("div", { className: "grid gap-1.5", children: payload.filter((item) => item.type !== "none").map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color || item.payload.fill || item.color;
          return /* @__PURE__ */ jsx(
            "div",
            {
              className: cn(
                "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                indicator === "dot" && "items-center"
              ),
              children: formatter && item?.value !== void 0 && item.name ? formatter(item.value, item.name, item, index, item.payload) : /* @__PURE__ */ jsxs(Fragment, { children: [
                itemConfig?.icon ? /* @__PURE__ */ jsx(itemConfig.icon, {}) : !hideIndicator && /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: cn(
                      "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                      {
                        "h-2.5 w-2.5": indicator === "dot",
                        "w-1": indicator === "line",
                        "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                        "my-0.5": nestLabel && indicator === "dashed"
                      }
                    ),
                    style: {
                      "--color-bg": indicatorColor,
                      "--color-border": indicatorColor
                    }
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center"
                    ),
                    children: [
                      /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5", children: [
                        nestLabel ? tooltipLabel : null,
                        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: itemConfig?.label || item.name })
                      ] }),
                      item.value && /* @__PURE__ */ jsx("span", { className: "text-foreground font-mono font-medium tabular-nums", children: item.value.toLocaleString() })
                    ]
                  }
                )
              ] })
            },
            item.dataKey
          );
        }) })
      ]
    }
  );
}
function getPayloadConfigFromPayload(config, payload, key) {
  if (typeof payload !== "object" || payload === null) {
    return void 0;
  }
  const payloadPayload = "payload" in payload && typeof payload.payload === "object" && payload.payload !== null ? payload.payload : void 0;
  let configLabelKey = key;
  if (key in payload && typeof payload[key] === "string") {
    configLabelKey = payload[key];
  } else if (payloadPayload && key in payloadPayload && typeof payloadPayload[key] === "string") {
    configLabelKey = payloadPayload[key];
  }
  return configLabelKey in config ? config[configLabelKey] : config[key];
}
const chartConfig = {
  value: {
    label: "Score",
    color: "hsl(var(--primary))"
  }
};
function DashboardAnalysisChart({
  title,
  subtitle,
  data,
  maxValue,
  isLoading = false,
  emptyMessage = "No data available"
}) {
  const safeData = (data ?? []).map((d) => ({
    label: d.label,
    value: d.value
  }));
  const maxVal = maxValue ?? (safeData.length > 0 ? Math.max(...safeData.map((d) => d.value)) : 10);
  const domainMax = Math.ceil(maxVal * 1.2);
  return /* @__PURE__ */ jsxs(Card, { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsx(CardTitle, { children: title }),
      subtitle && /* @__PURE__ */ jsx(CardDescription, { children: subtitle })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { className: "flex-1 pb-0", children: isLoading ? /* @__PURE__ */ jsx("div", { className: "flex h-[300px] items-center justify-center text-sm text-muted-foreground", children: "Loading..." }) : safeData.length === 0 ? /* @__PURE__ */ jsx("div", { className: "flex h-[300px] items-center justify-center text-sm text-muted-foreground", children: emptyMessage }) : /* @__PURE__ */ jsx(ChartContainer, { config: chartConfig, className: "min-h-[300px] w-full", children: /* @__PURE__ */ jsxs(
      BarChart,
      {
        accessibilityLayer: true,
        data: safeData,
        layout: "vertical",
        margin: {
          top: 0,
          right: 40,
          // Margin kanan ditambah untuk angka
          bottom: 0,
          left: 0
        },
        children: [
          /* @__PURE__ */ jsx(CartesianGrid, { horizontal: false, vertical: false }),
          /* @__PURE__ */ jsx(
            YAxis,
            {
              dataKey: "label",
              type: "category",
              tickLine: false,
              tickMargin: 10,
              axisLine: false,
              fontSize: 12,
              width: 180
            }
          ),
          /* @__PURE__ */ jsx(
            XAxis,
            {
              type: "number",
              dataKey: "value",
              domain: [0, domainMax],
              hide: true
            }
          ),
          /* @__PURE__ */ jsx(
            ChartTooltip,
            {
              cursor: false,
              content: /* @__PURE__ */ jsx(ChartTooltipContent, { hideLabel: true })
            }
          ),
          /* @__PURE__ */ jsx(
            Bar,
            {
              dataKey: "value",
              fill: "var(--color-value)",
              radius: [0, 4, 4, 0],
              barSize: 32,
              children: /* @__PURE__ */ jsx(
                LabelList,
                {
                  dataKey: "value",
                  position: "right",
                  offset: 8,
                  className: "fill-foreground font-medium",
                  fontSize: 12
                }
              )
            }
          )
        ]
      }
    ) }) })
  ] });
}
function DashboardAnalytics({
  analytics,
  isLoading
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-7", children: [
      /* @__PURE__ */ jsx("div", { className: "col-span-1 lg:col-span-4", children: /* @__PURE__ */ jsx(
        DashboardAnalysisChart,
        {
          title: "Question Performance",
          subtitle: "Rata-rata skor per pertanyaan",
          data: analytics?.questions.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((q) => ({
            label: q.order != null ? `${q.order}. ${q.text}` : q.text,
            value: Math.round(q.averageScore * 10) / 10
          })) ?? [],
          maxValue: 4,
          isLoading,
          emptyMessage: "Belum ada data pertanyaan."
        }
      ) }),
      /* @__PURE__ */ jsxs(Card, { className: "col-span-1 lg:col-span-3", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Video Submissions" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Perbandingan respon dengan dan tanpa video" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          isLoading && /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "Loading..." }),
          !isLoading && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold", children: analytics?.video.withVideo ?? 0 }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Responses with video" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold", children: analytics?.video.total ?? 0 }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Total responses" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-2 w-full overflow-hidden rounded-full bg-muted", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-2 rounded-full bg-primary",
                style: {
                  width: analytics && analytics.video.total ? `${Math.min(
                    100,
                    (analytics.video.withVideo ?? 0) / (analytics.video.total || 1) * 100
                  )}%` : "0%"
                }
              }
            ) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-7", children: [
      /* @__PURE__ */ jsxs(Card, { className: "col-span-1 lg:col-span-4", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Response Timeline" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Jumlah respon dan rata-rata skor per hari" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2", children: [
          isLoading && /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "Loading..." }),
          !isLoading && analytics?.timeline.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "Belum ada data timeline." }),
          !isLoading && analytics?.timeline.map((t) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex items-center justify-between border-b border-border/40 pb-2 last:border-b-0 last:pb-0",
              children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm", children: t.date }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
                  t.totalResponses,
                  " responses • avg",
                  " ",
                  Math.round(t.averageScore * 10) / 10
                ] })
              ]
            },
            t.date
          ))
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "col-span-1 lg:col-span-3", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Answer Distribution" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Distribusi jawaban per opsi" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2", children: [
          isLoading && /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "Loading..." }),
          !isLoading && analytics?.answers.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "Belum ada data jawaban." }),
          !isLoading && analytics?.answers.map((a) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex items-center justify-between border-b border-border/40 pb-2 last:border-b-0 last:pb-0",
              children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: a.text }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
                  a.totalResponses,
                  " responses • avg",
                  " ",
                  Math.round(a.averageScore * 10) / 10
                ] })
              ]
            },
            a.id
          ))
        ] })
      ] })
    ] })
  ] });
}
function DashboardOverview({
  summary,
  breakdown,
  isLoading
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: "Total Questionnaires" }) }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: isLoading ? "..." : summary?.totalQuestionnaires ?? 0 }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-xs", children: "Semua kuesioner yang terdaftar" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: "Active Questionnaires" }) }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: isLoading ? "..." : summary?.activeQuestionnaires ?? 0 }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-xs", children: "Sedang dibuka untuk respon" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: "Total Responses" }) }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: isLoading ? "..." : summary?.totalResponses ?? 0 }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-xs", children: "Semua respon yang sudah masuk" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium", children: "Average Total Score" }) }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: isLoading ? "..." : Math.round((summary?.averageScore ?? 0) * 10) / 10 }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-xs", children: "Rata-rata skor semua respon" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-7", children: [
      /* @__PURE__ */ jsxs(Card, { className: "col-span-1 lg:col-span-4", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Responses by Questionnaire" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Jumlah respon dan rata-rata skor per kuesioner" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
          isLoading && /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "Loading..." }),
          !isLoading && breakdown?.questionnaires.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "Belum ada data respon." }),
          !isLoading && breakdown?.questionnaires.map((q) => /* @__PURE__ */ jsx(
            "div",
            {
              className: "flex items-center justify-between border-b border-border/40 pb-2 last:border-b-0 last:pb-0",
              children: /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: q.title }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
                  q.totalResponses,
                  " responses • avg score",
                  " ",
                  Math.round(q.averageScore * 10) / 10
                ] })
              ] })
            },
            q.id
          ))
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "col-span-1 lg:col-span-3", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Responses by Class" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Partisipasi dan rata-rata skor per kelas" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
          isLoading && /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "Loading..." }),
          !isLoading && breakdown?.classes.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "Belum ada data kelas." }),
          !isLoading && breakdown?.classes.map((c) => /* @__PURE__ */ jsx(
            "div",
            {
              className: "flex items-center justify-between border-b border-border/40 pb-2 last:border-b-0 last:pb-0",
              children: /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: c.className }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
                  c.totalResponses,
                  " responses • avg score",
                  " ",
                  Math.round(c.averageScore * 10) / 10
                ] })
              ] })
            },
            c.className
          ))
        ] })
      ] })
    ] })
  ] });
}
function DashboardResponses() {
  const responsesQuery = useQuery({
    queryKey: ["admin", "responses"],
    queryFn: () => getResponses()
  });
  const responses = responsesQuery.data ?? [];
  const recentResponses = responses.slice(0, 20);
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Recent Responses" }),
        /* @__PURE__ */ jsxs(CardDescription, { children: [
          "Latest ",
          recentResponses.length,
          " responses from all questionnaires"
        ] })
      ] }),
      /* @__PURE__ */ jsx(Link, { to: "/admin/responses", children: /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "cursor-pointer", children: "View All" }) })
    ] }) }),
    /* @__PURE__ */ jsx(CardContent, { children: responsesQuery.isLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-32", children: /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Loading responses..." }) }) : responses.length === 0 ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-32", children: /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "No responses yet" }) }) : /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Name" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Class" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Questionnaire" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Score" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Video" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: recentResponses.map((response) => /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: response.profile?.name ?? "-" }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: "outline", children: response.profile?.class ?? "-" }) }),
        /* @__PURE__ */ jsx(TableCell, { className: "max-w-[150px] truncate", children: response.questionnaireTitle ?? "-" }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: response.totalScore }) }),
        /* @__PURE__ */ jsx(TableCell, { children: response.videoPath && response.videoPath !== "null" ? /* @__PURE__ */ jsxs(Badge, { variant: "default", className: "gap-1", children: [
          /* @__PURE__ */ jsx(Video, { className: "h-3 w-3" }),
          "Yes"
        ] }) : /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "No" }) }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-muted-foreground text-sm", children: format(new Date(response.createdAt), "dd MMM yyyy HH:mm") }),
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
    ] }) })
  ] });
}
function DashboardTabs({
  summary,
  breakdown,
  analytics,
  isLoading
}) {
  return /* @__PURE__ */ jsxs(Tabs, { orientation: "vertical", defaultValue: "overview", className: "space-y-4", children: [
    /* @__PURE__ */ jsx("div", { className: "w-full overflow-x-auto pb-2", children: /* @__PURE__ */ jsxs(TabsList, { children: [
      /* @__PURE__ */ jsx(TabsTrigger, { value: "overview", children: "Overview" }),
      /* @__PURE__ */ jsx(TabsTrigger, { value: "analytics", children: "Analytics" }),
      /* @__PURE__ */ jsx(TabsTrigger, { value: "responses", children: "Responses" })
    ] }) }),
    /* @__PURE__ */ jsx(TabsContent, { value: "overview", className: "space-y-4", children: /* @__PURE__ */ jsx(
      DashboardOverview,
      {
        summary,
        breakdown,
        isLoading
      }
    ) }),
    /* @__PURE__ */ jsx(TabsContent, { value: "analytics", className: "space-y-4", children: /* @__PURE__ */ jsx(DashboardAnalytics, { analytics, isLoading }) }),
    /* @__PURE__ */ jsx(TabsContent, { value: "responses", className: "space-y-4", children: /* @__PURE__ */ jsx(DashboardResponses, {}) })
  ] });
}
function Dashboard({ summary, breakdown, analytics }) {
  return /* @__PURE__ */ jsxs(Main, { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between space-y-2", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Dashboard" }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-2", children: /* @__PURE__ */ jsx(
        Button,
        {
          onClick: () => exportDashboardToExcel({ summary, breakdown, analytics }),
          children: "Export Excel"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx(
      DashboardTabs,
      {
        summary,
        breakdown,
        analytics,
        isLoading: false
      }
    )
  ] });
}
const summaryOptions = queryOptions({
  queryKey: ["dashboard", "summary"],
  queryFn: () => getDashboardSummary()
});
const breakdownOptions = queryOptions({
  queryKey: ["dashboard", "breakdown"],
  queryFn: () => getDashboardBreakdown()
});
const analyticsOptions = queryOptions({
  queryKey: ["dashboard", "analytics"],
  queryFn: () => getAnalyticsDetails()
});
function DashboardRouteComponent() {
  const summary = useSuspenseQuery(summaryOptions);
  const breakdown = useSuspenseQuery(breakdownOptions);
  const analytics = useSuspenseQuery(analyticsOptions);
  return /* @__PURE__ */ jsx(Dashboard, { summary: summary.data, breakdown: breakdown.data, analytics: analytics.data });
}
export {
  DashboardRouteComponent as component
};
