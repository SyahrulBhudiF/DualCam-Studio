import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { signupFn } from "@/apis/user";
import { Auth } from "@/components/Auth";
import { signupSchema } from "@/libs/schemas/user";
import {
	getFormError,
	normalizeZodError,
	type NormalizedValidationError,
} from "@/utils/validation-errors";

export const Route = createFileRoute("/signup")({
	component: SignupComp,
});

function SignupComp() {
	const queryClient = useQueryClient();
	const router = useRouter();
	const [clientValidation, setClientValidation] =
		useState<NormalizedValidationError | null>(null);
	const signupMutation = useMutation({
		mutationFn: signupFn,
		onSuccess: async (data) => {
			if (!data?.error) {
				await queryClient.invalidateQueries({ queryKey: ["user"] });
				await router.invalidate();
				router.navigate({ to: "/admin/dashboard" });
			}
		},
	});

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			const parsed = signupSchema.safeParse({
				...value,
				redirectUrl: "/admin/dashboard",
			});

			if (!parsed.success) {
				setClientValidation(normalizeZodError(parsed.error));
				return;
			}

			setClientValidation(null);
			signupMutation.mutate({ data: parsed.data });
		},
	});

	const serverValidation = getFormError(signupMutation.error);
	const fieldErrors =
		clientValidation?.fieldErrors ?? serverValidation?.fieldErrors ?? {};
	const validationError =
		clientValidation?.formErrors[0] ?? serverValidation?.formErrors[0] ?? null;
	const handlerError = signupMutation.data?.error
		? signupMutation.data.message
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
					actionText="Sign Up"
					status={signupMutation.status}
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
						displayError ? (
							<p className="text-destructive text-sm">{displayError}</p>
						) : null
					}
				/>
			)}
		</form.Subscribe>
	);
}
