import {
	ClipboardList,
	Command,
	FileText,
	LayoutDashboard,
	LogOut,
} from "lucide-react";
import type { SidebarData } from "@/components/layout/types";

export const sidebarData: SidebarData = {
	user: {
		name: "Admin",
		email: "admin@quis.com",
		avatar: "/avatars/admin.jpg",
	},
	teams: [
		{
			name: "QUIS",
			logo: Command,
			plan: "Questionnaire System",
		},
	],
	navGroups: [
		{
			title: "Menu",
			items: [
				{
					title: "Dashboard",
					url: "/admin/dashboard",
					icon: LayoutDashboard,
				},
				{
					title: "Questionnaires",
					url: "/admin/questionnaires",
					icon: ClipboardList,
				},
				{
					title: "Responses",
					url: "/admin/responses",
					icon: FileText,
				},
			],
		},
		{
			title: "Account",
			items: [
				{
					title: "Logout",
					url: "/logout",
					icon: LogOut,
				},
			],
		},
	],
};
