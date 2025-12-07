import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DashboardAnalysisChart } from "./dashboard-analysis-chart";
import type { AnalyticsData } from "./types";

type DashboardAnalyticsProps = {
	analytics: AnalyticsData;
	isLoading: boolean;
};

export function DashboardAnalytics({
	analytics,
	isLoading,
}: DashboardAnalyticsProps) {
	return (
		<>
			<div className="grid gap-4 lg:grid-cols-7">
				<div className="col-span-1 lg:col-span-4">
					<DashboardAnalysisChart
						title="Question Performance"
						subtitle="Rata-rata skor per pertanyaan"
						data={
							analytics?.questions
								.slice()
								.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
								.map((q) => ({
									label: q.order != null ? `${q.order}. ${q.text}` : q.text,
									value: Math.round(q.averageScore * 10) / 10,
								})) ?? []
						}
						maxValue={4}
						isLoading={isLoading}
						emptyMessage="Belum ada data pertanyaan."
					/>
				</div>
				<Card className="col-span-1 lg:col-span-3">
					<CardHeader>
						<CardTitle>Video Submissions</CardTitle>
						<CardDescription>
							Perbandingan respon dengan dan tanpa video
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{isLoading && (
							<div className="text-sm text-muted-foreground">Loading...</div>
						)}
						{!isLoading && (
							<>
								<div className="flex items-baseline justify-between">
									<div>
										<div className="text-3xl font-bold">
											{analytics?.video.withVideo ?? 0}
										</div>
										<div className="text-xs text-muted-foreground">
											Responses with video
										</div>
									</div>
									<div className="text-right">
										<div className="text-3xl font-bold">
											{analytics?.video.total ?? 0}
										</div>
										<div className="text-xs text-muted-foreground">
											Total responses
										</div>
									</div>
								</div>
								<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
									<div
										className="h-2 rounded-full bg-primary"
										style={{
											width:
												analytics && analytics.video.total
													? `${Math.min(
															100,
															((analytics.video.withVideo ?? 0) /
																(analytics.video.total || 1)) *
																100,
														)}%`
													: "0%",
										}}
									/>
								</div>
							</>
						)}
					</CardContent>
				</Card>
			</div>
			<div className="grid gap-4 lg:grid-cols-7">
				<Card className="col-span-1 lg:col-span-4">
					<CardHeader>
						<CardTitle>Response Timeline</CardTitle>
						<CardDescription>
							Jumlah respon dan rata-rata skor per hari
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						{isLoading && (
							<div className="text-sm text-muted-foreground">Loading...</div>
						)}
						{!isLoading && analytics?.timeline.length === 0 && (
							<div className="text-sm text-muted-foreground">
								Belum ada data timeline.
							</div>
						)}
						{!isLoading &&
							analytics?.timeline.map((t) => (
								<div
									key={t.date}
									className="flex items-center justify-between border-b border-border/40 pb-2 last:border-b-0 last:pb-0"
								>
									<div className="text-sm">{t.date}</div>
									<div className="text-xs text-muted-foreground">
										{t.totalResponses} responses • avg{" "}
										{Math.round(t.averageScore * 10) / 10}
									</div>
								</div>
							))}
					</CardContent>
				</Card>
				<Card className="col-span-1 lg:col-span-3">
					<CardHeader>
						<CardTitle>Answer Distribution</CardTitle>
						<CardDescription>Distribusi jawaban per opsi</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						{isLoading && (
							<div className="text-sm text-muted-foreground">Loading...</div>
						)}
						{!isLoading && analytics?.answers.length === 0 && (
							<div className="text-sm text-muted-foreground">
								Belum ada data jawaban.
							</div>
						)}
						{!isLoading &&
							analytics?.answers.map((a) => (
								<div
									key={a.id}
									className="flex items-center justify-between border-b border-border/40 pb-2 last:border-b-0 last:pb-0"
								>
									<div className="text-sm font-medium">{a.text}</div>
									<div className="text-xs text-muted-foreground">
										{a.totalResponses} responses • avg{" "}
										{Math.round(a.averageScore * 10) / 10}
									</div>
								</div>
							))}
					</CardContent>
				</Card>
			</div>
		</>
	);
}
