import { useMemo } from "react";
import type { DashboardAnalytics as DashboardAnalyticsData } from "../Dashboard.types";
import { ScoreBarList } from "./ScoreBarList";
import { StatsListCard } from "./StatsListCard";
import { VideoCompletionCard } from "./VideoCompletionCard";

type DashboardAnalyticsProps = {
	analytics: DashboardAnalyticsData;
};

function round1(value: number) {
	return Math.round(value * 10) / 10;
}

export function DashboardAnalytics({ analytics }: DashboardAnalyticsProps) {
	const sortedQuestions = useMemo(
		() =>
			analytics.questions
				.toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0))
				.map((q) => ({
					label: q.order != null ? `${q.order}. ${q.text}` : q.text,
					value: round1(q.averageScore),
				})),
		[analytics.questions],
	);

	return (
		<>
			<div className="grid gap-4 lg:grid-cols-7">
				<div className="col-span-1 lg:col-span-4">
					<ScoreBarList
						title="Question Performance"
						subtitle="Rata-rata skor per pertanyaan"
						data={sortedQuestions}
						maxValue={4}
						emptyMessage="Belum ada data pertanyaan."
					/>
				</div>
				<VideoCompletionCard video={analytics.video} />
			</div>
			<div className="grid gap-4 lg:grid-cols-7">
				<StatsListCard
					className="col-span-1 lg:col-span-4"
					title="Response Timeline"
					description="Jumlah respon dan rata-rata skor per hari"
					items={analytics.timeline.map((item) => ({
						id: item.date,
						primary: item.date,
						meta: `${item.totalResponses} responses • avg ${round1(item.averageScore)}`,
					}))}
					emptyMessage="Belum ada data timeline."
					pageSize={10}
				/>
				<StatsListCard
					className="col-span-1 lg:col-span-3"
					title="Answer Distribution"
					description="Distribusi jawaban per opsi"
					items={analytics.answers.map((item) => ({
						id: item.id,
						primary: item.text,
						meta: `${item.totalResponses} responses • avg ${round1(item.averageScore)}`,
					}))}
					emptyMessage="Belum ada data jawaban."
					pageSize={10}
				/>
			</div>
		</>
	);
}
