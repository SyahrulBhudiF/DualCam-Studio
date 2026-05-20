import type { DashboardBreakdown, DashboardSummary } from "../Dashboard.types";
import { MetricCard } from "./MetricCard";
import { StatsListCard } from "./StatsListCard";

type DashboardOverviewProps = {
	summary: DashboardSummary;
	breakdown: DashboardBreakdown;
};

function round1(value: number) {
	return Math.round(value * 10) / 10;
}

export function DashboardOverview({
	summary,
	breakdown,
}: DashboardOverviewProps) {
	return (
		<>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					title="Total Questionnaires"
					value={summary.totalQuestionnaires}
					description="Semua kuesioner yang terdaftar"
				/>
				<MetricCard
					title="Active Questionnaires"
					value={summary.activeQuestionnaires}
					description="Sedang dibuka untuk respon"
				/>
				<MetricCard
					title="Total Responses"
					value={summary.totalResponses}
					description="Semua respon yang sudah masuk"
				/>
				<MetricCard
					title="Average Total Score"
					value={round1(summary.averageScore)}
					description="Rata-rata skor semua respon"
				/>
			</div>
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
				<StatsListCard
					className="col-span-1 lg:col-span-4"
					title="Responses by Questionnaire"
					description="Jumlah respon dan rata-rata skor per kuesioner"
					items={breakdown.questionnaires.map((item) => ({
						id: item.id,
						primary: item.title,
						meta: `${item.totalResponses} responses • avg score ${round1(item.averageScore)}`,
					}))}
					emptyMessage="Belum ada data respon."
				/>
				<StatsListCard
					className="col-span-1 lg:col-span-3"
					title="Responses by Class"
					description="Partisipasi dan rata-rata skor per kelas"
					items={breakdown.classes.map((item) => ({
						id: item.className,
						primary: item.className,
						meta: `${item.totalResponses} responses • avg score ${round1(item.averageScore)}`,
					}))}
					emptyMessage="Belum ada data kelas."
				/>
			</div>
		</>
	);
}
