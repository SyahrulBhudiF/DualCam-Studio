import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import type { DashboardAnalytics } from "../Dashboard.types";

type VideoCompletionCardProps = {
	video: DashboardAnalytics["video"];
};

export function VideoCompletionCard({ video }: VideoCompletionCardProps) {
	const percentage = video.total
		? Math.min(100, (video.withVideo / video.total) * 100)
		: 0;

	return (
		<Card className="col-span-1 lg:col-span-3">
			<CardHeader>
				<CardTitle>Video Submissions</CardTitle>
				<CardDescription>
					Perbandingan respon dengan dan tanpa video
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex items-baseline justify-between">
					<div>
						<div className="text-3xl font-bold">{video.withVideo}</div>
						<div className="text-xs text-muted-foreground">
							Responses with video
						</div>
					</div>
					<div className="text-right">
						<div className="text-3xl font-bold">{video.total}</div>
						<div className="text-xs text-muted-foreground">Total responses</div>
					</div>
				</div>
				<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
					<div
						className="h-2 rounded-full bg-primary"
						style={{ width: `${percentage}%` }}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
