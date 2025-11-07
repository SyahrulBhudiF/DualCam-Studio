import { useRouter } from "@tanstack/react-router";
import { loginFn, signupFn } from "@/apis/user";
import { useMutation } from "@/libs/hooks/useMutation";
import { getValidationErrorMessage } from "@/utils/utils";
import { Auth } from "./Auth";

export function Login() {
  const router = useRouter();

  const loginMutation = useMutation({
    fn: loginFn,
    onSuccess: async (ctx) => {
      if (!ctx.data?.error) {
        await router.invalidate();
        router.navigate({ to: "/" });
        return;
      }
    },
  });

  const signupMutation = useMutation({
    fn: signupFn,
  });

  const validationError = getValidationErrorMessage(loginMutation.error);
  const handlerError = loginMutation.data?.error
    ? loginMutation.data.message
    : null;

  const displayError = validationError || handlerError;

  return (
    <Auth
      actionText="Login"
      status={loginMutation.status}
      onSubmit={(e) => {
        const formData = new FormData(e.target as HTMLFormElement);
        loginMutation.mutate({
          data: {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
          },
        });
      }}
      afterSubmit={
        <>
          {displayError ? (
            <div className="text-red-400">{displayError}</div>
          ) : null}

          {handlerError === "Invalid login credentials" ? (
            <div>
              <button
                className="text-blue-500"
                onClick={(e) => {
                  const formData = new FormData(
                    (e.target as HTMLButtonElement).form!,
                  );
                  signupMutation.mutate({
                    data: {
                      email: formData.get("email") as string,
                      password: formData.get("password") as string,
                      redirectUrl: "/",
                    },
                  });
                }}
                type="button"
              >
                Sign up instead?
              </button>
            </div>
          ) : null}
        </>
      }
    />
  );
}
