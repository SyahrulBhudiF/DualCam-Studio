import { sidebarData } from "@/components/layout/data/sidebar-data";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { useLayout } from "@/libs/context/layout-provider";
import { AppTitle } from "./app-title";
import { NavGroup } from "./nav-group";
import { NavUser } from "./nav-user";

export function AppSidebar() {
	const { collapsible, variant } = useLayout();
	return (
		<Sidebar collapsible={collapsible} variant={variant}>
			<SidebarHeader>
				<AppTitle />
			</SidebarHeader>
			<SidebarContent>
				{sidebarData.navGroups.map((props) => (
					<NavGroup key={props.title} {...props} />
				))}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={sidebarData.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
