import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { l as loginFn, s as signupFn } from "./router-BmiHf_ZJ.js";
import { a as getValidationErrorMessage } from "./supabase-0PR4I26a.js";
import { A as Auth } from "./Auth-CqwgXvCt.js";
function Login() {
  const router = useRouter();
  const loginMutation = useMutation({
    mutationFn: loginFn,
    onSuccess: async (data) => {
      if (!data?.error) {
        await router.invalidate();
        router.navigate({ to: "/admin/dashboard" });
      }
    }
  });
  const signupMutation = useMutation({
    mutationFn: signupFn
  });
  const validationError = getValidationErrorMessage(loginMutation.error);
  const handlerError = loginMutation.data?.error ? loginMutation.data.message : null;
  const displayError = validationError || handlerError;
  return /* @__PURE__ */ jsx(
    Auth,
    {
      actionText: "Login",
      status: loginMutation.status,
      onSubmit: (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        loginMutation.mutate({
          data: {
            email: formData.get("email"),
            password: formData.get("password")
          }
        });
      },
      afterSubmit: /* @__PURE__ */ jsxs(Fragment, { children: [
        displayError && /* @__PURE__ */ jsx("div", { className: "text-red-400", children: displayError }),
        handlerError === "Invalid login credentials" && /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
          "button",
          {
            className: "text-blue-500",
            onClick: (e) => {
              const form = e.currentTarget.form;
              if (!form) return;
              const formData = new FormData(form);
              signupMutation.mutate({
                data: {
                  email: formData.get("email"),
                  password: formData.get("password"),
                  redirectUrl: "/"
                }
              });
            },
            type: "button",
            children: "Sign up instead?"
          }
        ) })
      ] })
    }
  );
}
export {
  Login as L
};
