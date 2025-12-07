import { jsx } from "react/jsx-runtime";
import { L as Login } from "./Login-C3o8PjhQ.js";
import "@tanstack/react-query";
import "@tanstack/react-router";
import "./router-BmiHf_ZJ.js";
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
import "clsx";
import "tailwind-merge";
import "lucide-react";
import "next-themes";
import "sonner";
import "react";
import "@radix-ui/react-direction";
import "js-cookie";
import "node:fs";
import "node:path";
import "./questionnaire-DGzIDWUe.js";
import "zustand";
import "./Auth-CqwgXvCt.js";
const SplitErrorComponent = ({
  error
}) => {
  if (error.message === "Not authenticated") {
    return /* @__PURE__ */ jsx(Login, {});
  }
  throw error;
};
export {
  SplitErrorComponent as errorComponent
};
