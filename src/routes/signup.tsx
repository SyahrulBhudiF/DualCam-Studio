import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { signupFn } from "@/apis/user";
import { Auth } from "@/components/Auth";
import { getValidationErrorMessage } from "@/utils/utils";

export const Route = createFileRoute("/signup")({
	component: SignupComp,
});

function SignupComp() {
	const queryClient = useQueryClient();
	const router = useRouter();
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

	const validationError = getValidationErrorMessage(signupMutation.error);
	const handlerError = signupMutation.data?.error
		? signupMutation.data.message
		: null;

	const displayError = validationError || handlerError;
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			signupMutation.mutate({
				data: {
					...value,
					redirectUrl: "/admin/dashboard",
				},
			});
		},
	});

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
						displayError ? <div className="text-destructive">{displayError}</div> : null
					}
				/>
			)}
		</form.Subscribe>
	);
}
