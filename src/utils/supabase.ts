import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie } from "@tanstack/react-start/server";
import { requireEnv } from "./utils";

export function getSupabaseServerClient() {
	return createServerClient(
		requireEnv<string>("SUPABASE_URL"),
		requireEnv<string>("SUPABASE_ANON_KEY"),
		{
			cookies: {
				getAll() {
					return Object.entries(getCookies()).map(([name, value]) => ({
						name,
						value,
					}));
				},
				setAll(cookies) {
					cookies.forEach((cookie) => {
						setCookie(cookie.name, cookie.value);
					});
				},
			},
		},
	);
}
