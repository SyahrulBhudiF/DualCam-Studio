import { Main } from "@/components/layout/Main";
import { DashboardPageHeader } from "./components/DashboardPageHeader";
import { DashboardTabs } from "./components/DashboardTabs";
import type { DashboardData } from "./Dashboard.types";

export function Dashboard(data: DashboardData) {
	return (
		<Main>
			<DashboardPageHeader {...data} />
			<DashboardTabs {...data} />
		</Main>
	);
}
