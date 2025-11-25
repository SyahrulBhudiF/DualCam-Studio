import { createFileRoute } from "@tanstack/react-router";
import { signupFn } from "@/apis/user";
import { Auth } from "@/components/Auth";
import { getValidationErrorMessage } from "@/utils/utils";
import { useMutation } from "@tanstack/react-query";

export const Route = createFileRoute("/signup")({
	component: SignupComp,
});

function SignupComp() {
	const signupMutation = useMutation({
		mutationFn: signupFn,
	});

	const validationError = getValidationErrorMessage(signupMutation.error);
	const handlerError = signupMutation.data?.error
		? signupMutation.data.message
		: null;

	const displayError = validationError || handlerError;

	return (
		<Auth
			actionText="Sign Up"
			status={signupMutation.status}
			onSubmit={(e) => {
				const formData = new FormData(e.target as HTMLFormElement);

				signupMutation.mutate({
					data: {
						email: formData.get("email") as string,
						password: formData.get("password") as string,
						redirectUrl: "/",
					},
				});
			}}
			afterSubmit={
				displayError ? <div className="text-red-400">{displayError}</div> : null
			}
		/>
	);
}
