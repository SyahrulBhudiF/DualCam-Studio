import { Main } from "@/components/layout/main";
import { Button } from "@/components/ui/button";
import { exportDashboardToExcel } from "./components/dashboard-export";
import { DashboardTabs } from "./components/dashboard-tabs";
import type { DashboardProps } from "./components/types";

export function Dashboard({
	summary,
	breakdown,
	analytics,
	isLoading = false,
}: DashboardProps) {
	return (
		<Main>
			<div className="mb-2 flex items-center justify-between space-y-2">
				<h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
				<div className="flex items-center space-x-2">
					<Button
						onClick={() =>
							exportDashboardToExcel({ summary, breakdown, analytics })
						}
						disabled={isLoading}
					>
						Export Excel
					</Button>
				</div>
			</div>

			<DashboardTabs
				summary={summary}
				breakdown={breakdown}
				analytics={analytics}
				isLoading={isLoading}
			/>
		</Main>
	);
}
