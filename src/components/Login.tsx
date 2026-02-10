import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { loginFn, signupFn } from "@/apis/user";
import { getValidationErrorMessage } from "@/utils/utils";
import { Auth } from "./Auth";
import { Button } from "./ui/button";

export function Login() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const loginMutation = useMutation({
		mutationFn: loginFn,
		onSuccess: async (data) => {
			if (!data?.error) {
				await queryClient.invalidateQueries({ queryKey: ["user"] });
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
					{displayError && (
						<p className="text-destructive text-sm">{displayError}</p>
					)}

					{(handlerError === "Invalid login credentials" ||
						handlerError === "Invalid credentials") && (
						<div>
							<Button
								variant="link"
								className="px-0"
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
							</Button>
						</div>
					)}
				</>
			}
		/>
	);
}
