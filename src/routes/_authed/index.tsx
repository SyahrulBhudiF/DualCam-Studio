import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/features/dashboard";

export const AuthedIndexDemo = createFileRoute("/_authed/")({
	component: Dashboard,
});
