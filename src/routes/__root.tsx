/// <reference types="vite/client" />

import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import type * as React from "react";
import { fetchUser } from "@/apis/user";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { NotFound } from "@/components/NotFound";
import { Toaster } from "@/components/ui/sonner";
import { DirectionProvider } from "@/libs/context/direction-provider";
import { ThemeProvider } from "@/libs/context/theme-provider";
import appCss from "@/styles/app.css?url";
import { seo } from "@/utils/seo";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	beforeLoad: async ({ context }) => {
		// Use cached user data if available, otherwise fetch
		const user = await context.queryClient.fetchQuery({
			queryKey: ["user"],
			queryFn: () => fetchUser(),
			staleTime: 1000 * 60 * 5, // 5 minutes - don't refetch if fresh
		});

		return {
			user,
		};
	},
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			...seo({
				title: "DualCam Studio",
				description: `DualCam Studio is a general‑purpose, dataset‑oriented platform for dual‑camera microexpression recording and questionnaire management, suitable both for research and for more traditional online exam and survey use cases.`,
			}),
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/favicon-32x32.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "16x16",
				href: "/favicon-16x16.png",
			},
			{ rel: "manifest", href: "/site.webmanifest" },
			{ rel: "icon", href: "/favicon.ico" },
		],
	}),
	errorComponent: (props) => {
		return (
			<RootDocument>
				<DefaultCatchBoundary {...props} />
			</RootDocument>
		);
	},
	notFoundComponent: () => <NotFound />,
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<ThemeProvider>
				<DirectionProvider>
					<Outlet />
				</DirectionProvider>
			</ThemeProvider>
		</RootDocument>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
				<title></title>
			</head>
			<body>
				{children}
				<Toaster />
				<a
					href="https://github.com/SyahrulBhudiF"
					target="_blank"
					rel="noopener noreferrer"
					className="fixed bottom-3 right-3 z-40 flex items-center gap-1.5 rounded-md bg-background/50 px-2.5 py-1.5 text-xs text-muted-foreground opacity-80 shadow-sm backdrop-blur-sm transition-opacity hover:opacity-100"
				>
					<img src="/logo.svg" alt="DualCam Studio" className="h-4 w-4" />
					<span>by SyahrulBhudiF</span>
				</a>
				{/*<TanStackRouterDevtools position="bottom-left" />*/}
				<Scripts />
			</body>
		</html>
	);
}
