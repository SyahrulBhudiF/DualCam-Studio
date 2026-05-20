import { Button } from "@/components/ui/Button";
import type { DashboardData } from "../Dashboard.types";
import { exportDashboardToExcel } from "./DashboardExport";

type DashboardPageHeaderProps = DashboardData;

export function DashboardPageHeader(data: DashboardPageHeaderProps) {
	return (
		<div className="mb-2 flex items-center justify-between gap-y-2">
			<h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
			<Button onClick={() => exportDashboardToExcel(data)}>Export Excel</Button>
		</div>
	);
}
