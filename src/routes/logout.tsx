import { createFileRoute } from "@tanstack/react-router";
import { logoutFn } from "@/apis/user";

export const Route = createFileRoute("/logout")({
	preload: false,
	loader: () => logoutFn(),
});
