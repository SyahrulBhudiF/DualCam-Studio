import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
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
			if (data?.error) {
				toast.error(data.message);
				return;
			}

			toast.success("Logged in");
			await queryClient.invalidateQueries({ queryKey: ["user"] });
			await router.invalidate();
			router.navigate({ to: "/admin/dashboard" });
		},
	});

	const signupMutation = useMutation({
		mutationFn: signupFn,
		onSuccess: async (data) => {
			if (data?.error) {
				toast.error(data.message);
				return;
			}

			toast.success("Account created");
			await queryClient.invalidateQueries({ queryKey: ["user"] });
			await router.invalidate();
			router.navigate({ to: "/admin/dashboard" });
		},
	});

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			loginMutation.mutate({ data: value });
		},
	});

	const validationError = getValidationErrorMessage(loginMutation.error);
	const handlerError = loginMutation.data?.error
		? loginMutation.data.message
		: null;

	const displayError = validationError || handlerError;

	return (
		<form.Subscribe
			selector={(state) => ({
				email: state.values.email,
				password: state.values.password,
			})}
		>
			{(values) => (
				<Auth
					actionText="Login"
					status={loginMutation.status}
					onSubmit={() => form.handleSubmit()}
					emailField={{
						value: values.email,
						onBlur: () => form.validateField("email", "blur"),
						onChange: (value) => form.setFieldValue("email", value),
						errors: [],
					}}
					passwordField={{
						value: values.password,
						onBlur: () => form.validateField("password", "blur"),
						onChange: (value) => form.setFieldValue("password", value),
						errors: [],
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
										onClick={() => {
											signupMutation.mutate({
												data: {
													email: form.getFieldValue("email"),
													password: form.getFieldValue("password"),
													redirectUrl: "/admin/dashboard",
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
			)}
		</form.Subscribe>
	);
}
