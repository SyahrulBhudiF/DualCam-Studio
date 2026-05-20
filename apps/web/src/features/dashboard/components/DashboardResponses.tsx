import type { DashboardRecentResponse } from "../Dashboard.types";
import { RecentResponsesCard } from "./RecentResponsesCard";

type DashboardResponsesProps = {
	responses: DashboardRecentResponse[];
};

export function DashboardResponses({ responses }: DashboardResponsesProps) {
	return <RecentResponsesCard responses={responses} />;
}
