import { createFileRoute } from "@tanstack/react-router";
import { Login } from "@/components/Login";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";

export const Route = createFileRoute("/_authed")({
	beforeLoad: ({ context }) => {
		if (!context.user) {
			throw new Error("Not authenticated");
		}
	},
	errorComponent: ({ error }) => {
		if (error.message === "Not authenticated") {
			return <Login />;
		}

		throw error;
	},
	component: AuthenticatedLayout,
});
