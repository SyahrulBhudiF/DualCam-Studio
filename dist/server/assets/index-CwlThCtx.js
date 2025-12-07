import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { B as Button } from "./button-CmIj-cVl.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-BHTzFMfN.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./supabase-0PR4I26a.js";
import "@supabase/ssr";
import "clsx";
import "tailwind-merge";
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
function SuccessPage() {
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-slate-50 p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md text-center shadow-lg", children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-16 w-16 text-green-500" }) }),
      /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl font-bold text-green-700", children: "Submission Successful!" })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-slate-600", children: "Thank you for completing the questionnaire. Your video and answers have been recorded securely." }),
      /* @__PURE__ */ jsx(Button, { asChild: true, className: "w-full", children: /* @__PURE__ */ jsx(Link, { to: "/", children: "Back to Home" }) })
    ] })
  ] }) });
}
export {
  SuccessPage as component
};
