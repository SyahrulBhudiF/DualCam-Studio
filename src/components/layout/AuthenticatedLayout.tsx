import { Outlet } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { Search } from "@/components/Search";
import { SkipToMain } from "@/components/SkipToMain";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import { LayoutProvider } from "@/libs/context/layout-provider";
import { SearchProvider } from "@/libs/context/search-provider";
import { cn } from "@/utils/utils";
import { ConfigDrawer } from "../ConfigDrawer";

type AuthenticatedLayoutProps = {
	children?: ReactNode;
};

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
	return (
		<SearchProvider>
			<LayoutProvider>
				<SidebarProvider defaultOpen>
					<SkipToMain />
					<AppSidebar />
					<SidebarInset
						className={cn(
							// Set content container, so we can use container queries
							"@container/content",

							// If layout is fixed, set the height
							// to 100svh to prevent overflow
							"has-data-[layout=fixed]:h-svh",

							// If layout is fixed and sidebar is inset,
							// set the height to 100svh - spacing (total margins) to prevent overflow
							"peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]",
						)}
					>
						<div>
							<Header>
								<div className="ms-auto flex items-center gap-x-4">
									<Search />
									<ThemeSwitch />
									<ConfigDrawer />
									<ProfileDropdown />
								</div>
							</Header>
							{children ?? <Outlet />}
						</div>
					</SidebarInset>
				</SidebarProvider>
			</LayoutProvider>
		</SearchProvider>
	);
}
