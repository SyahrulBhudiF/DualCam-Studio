import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { loginFn, signupFn } from "@/apis/user";
import { loginSchema } from "@/libs/schemas/user";
import {
	getFormError,
	normalizeZodError,
	type NormalizedValidationError,
} from "@/utils/validation-errors";
import { Auth } from "./Auth";
import { Button } from "./ui/Button";

export function Login() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [clientValidation, setClientValidation] =
		useState<NormalizedValidationError | null>(null);

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
			const parsed = loginSchema.safeParse(value);
			if (!parsed.success) {
				setClientValidation(normalizeZodError(parsed.error));
				return;
			}

			setClientValidation(null);
			loginMutation.mutate({ data: parsed.data });
		},
	});

	const serverValidation = getFormError(loginMutation.error);
	const fieldErrors = clientValidation?.fieldErrors ?? serverValidation?.fieldErrors ?? {};
	const validationError =
		clientValidation?.formErrors[0] ?? serverValidation?.formErrors[0] ?? null;
	const handlerError = loginMutation.data?.error ? loginMutation.data.message : null;
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
						onChange: (value) => {
							setClientValidation(null);
							form.setFieldValue("email", value);
						},
						errors: fieldErrors.email ?? [],
					}}
					passwordField={{
						value: values.password,
						onBlur: () => form.validateField("password", "blur"),
						onChange: (value) => {
							setClientValidation(null);
							form.setFieldValue("password", value);
						},
						errors: fieldErrors.password ?? [],
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
