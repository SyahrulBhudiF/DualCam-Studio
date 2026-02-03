import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { loginFn, signupFn } from "@/apis/user";
import { getValidationErrorMessage } from "@/utils/utils";
import { Auth } from "./Auth";

export function Login() {
	const router = useRouter();

	const loginMutation = useMutation({
		mutationFn: loginFn,
		onSuccess: async (data) => {
			if (!data?.error) {
				await router.invalidate();
				router.navigate({ to: "/admin/dashboard" });
			}
		},
	});

	const signupMutation = useMutation({
		mutationFn: signupFn,
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
				e.preventDefault();
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
					{displayError && <div className="text-red-400">{displayError}</div>}

					{(handlerError === "Invalid login credentials" ||
						handlerError === "Invalid credentials") && (
						<div>
							<button
								className="text-blue-500"
								onClick={(e) => {
									const form = (e.currentTarget as HTMLButtonElement).form;
									if (!form) return;

									const formData = new FormData(form);
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
					)}
				</>
			}
		/>
	);
}
