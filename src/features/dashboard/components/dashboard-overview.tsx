import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { BreakdownData, SummaryData } from "./types";

type DashboardOverviewProps = {
	summary: SummaryData;
	breakdown: BreakdownData;
	isLoading: boolean;
};

export function DashboardOverview({
	summary,
	breakdown,
	isLoading,
}: DashboardOverviewProps) {
	return (
		<>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Questionnaires
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading ? "..." : (summary?.totalQuestionnaires ?? 0)}
						</div>
						<p className="text-muted-foreground text-xs">
							Semua kuesioner yang terdaftar
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active Questionnaires
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading ? "..." : (summary?.activeQuestionnaires ?? 0)}
						</div>
						<p className="text-muted-foreground text-xs">
							Sedang dibuka untuk respon
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Responses
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading ? "..." : (summary?.totalResponses ?? 0)}
						</div>
						<p className="text-muted-foreground text-xs">
							Semua respon yang sudah masuk
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Average Total Score
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading
								? "..."
								: Math.round((summary?.averageScore ?? 0) * 10) / 10}
						</div>
						<p className="text-muted-foreground text-xs">
							Rata-rata skor semua respon
						</p>
					</CardContent>
				</Card>
			</div>
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
				<Card className="col-span-1 lg:col-span-4">
					<CardHeader>
						<CardTitle>Responses by Questionnaire</CardTitle>
						<CardDescription>
							Jumlah respon dan rata-rata skor per kuesioner
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{isLoading && (
							<div className="text-sm text-muted-foreground">Loading...</div>
						)}
						{!isLoading && breakdown?.questionnaires.length === 0 && (
							<div className="text-sm text-muted-foreground">
								Belum ada data respon.
							</div>
						)}
						{!isLoading &&
							breakdown?.questionnaires.map((q) => (
								<div
									key={q.id}
									className="flex items-center justify-between border-b border-border/40 pb-2 last:border-b-0 last:pb-0"
								>
									<div>
										<div className="text-sm font-medium">{q.title}</div>
										<div className="text-xs text-muted-foreground">
											{q.totalResponses} responses • avg score{" "}
											{Math.round(q.averageScore * 10) / 10}
										</div>
									</div>
								</div>
							))}
					</CardContent>
				</Card>
				<Card className="col-span-1 lg:col-span-3">
					<CardHeader>
						<CardTitle>Responses by Class</CardTitle>
						<CardDescription>
							Partisipasi dan rata-rata skor per kelas
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{isLoading && (
							<div className="text-sm text-muted-foreground">Loading...</div>
						)}
						{!isLoading && breakdown?.classes.length === 0 && (
							<div className="text-sm text-muted-foreground">
								Belum ada data kelas.
							</div>
						)}
						{!isLoading &&
							breakdown?.classes.map((c) => (
								<div
									key={c.className}
									className="flex items-center justify-between border-b border-border/40 pb-2 last:border-b-0 last:pb-0"
								>
									<div>
										<div className="text-sm font-medium">{c.className}</div>
										<div className="text-xs text-muted-foreground">
											{c.totalResponses} responses • avg score{" "}
											{Math.round(c.averageScore * 10) / 10}
										</div>
									</div>
								</div>
							))}
					</CardContent>
				</Card>
			</div>
		</>
	);
}
