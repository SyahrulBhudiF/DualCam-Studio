import { jsx } from "react/jsx-runtime";
import { s as signupFn } from "./router-BmiHf_ZJ.js";
import { A as Auth } from "./Auth-CqwgXvCt.js";
import { a as getValidationErrorMessage } from "./supabase-0PR4I26a.js";
import { useMutation } from "@tanstack/react-query";
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
import "@supabase/ssr";
import "clsx";
import "tailwind-merge";
function SignupComp() {
  const signupMutation = useMutation({
    mutationFn: signupFn
  });
  const validationError = getValidationErrorMessage(signupMutation.error);
  const handlerError = signupMutation.data?.error ? signupMutation.data.message : null;
  const displayError = validationError || handlerError;
  return /* @__PURE__ */ jsx(Auth, { actionText: "Sign Up", status: signupMutation.status, onSubmit: (e) => {
    const formData = new FormData(e.target);
    signupMutation.mutate({
      data: {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectUrl: "/"
      }
    });
  }, afterSubmit: displayError ? /* @__PURE__ */ jsx("div", { className: "text-red-400", children: displayError }) : null });
}
export {
  SignupComp as component
};
