import { sidebarData } from "@/components/layout/data/sidebar-data";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/Sidebar";
import { useLayout } from "@/libs/context/layout-provider";
import { AppTitle } from "./AppTitle";
import { NavGroup } from "./NavGroup";
import { NavUser } from "./NavUser";

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
