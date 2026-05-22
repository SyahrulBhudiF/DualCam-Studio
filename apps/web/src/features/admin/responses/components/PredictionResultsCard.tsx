import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { getPredictionResults, runPrediction } from "@/apis/prediction";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/Table";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/Tooltip";

const QUERY_KEY = (responseId: string) => ["prediction-results", responseId];

type PredictionResultsCardProps = {
	responseId: string;
};

export function PredictionResultsCard({
	responseId,
}: PredictionResultsCardProps) {
	const queryClient = useQueryClient();
	const resultsQuery = useQuery({
		queryFn: () => getPredictionResults({ data: { responseId } }),
		queryKey: QUERY_KEY(responseId),
		refetchInterval: (query) =>
			(query.state.data ?? []).some(
				(row) => row.status === "pending" || row.status === "running",
			)
				? 3000
				: false,
	});
	const runMutation = useMutation({
		mutationFn: () => runPrediction({ data: { responseId } }),
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEY(responseId) });
			queryClient.invalidateQueries({ queryKey: ["admin", "responses"] });
		},
	});

	const visibleRows = (resultsQuery.data ?? []).filter(isVisiblePredictionRow);
	const failedRows = visibleRows.filter((row) => row.status === "failed");
	const rows = visibleRows.filter((row) => row.status !== "failed");
	const hasRows = rows.length > 0;
	const hasFailedRows = failedRows.length > 0;
	const isRunning = rows.some(
		(row) => row.status === "pending" || row.status === "running",
	);
	const isBusy = resultsQuery.isLoading || runMutation.isPending || isRunning;
	const buttonLabel = hasRows ? "Run ulang prediksi" : "Jalankan prediksi";

	return (
		<Card>
			<CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1.5">
					<CardTitle>Prediction Results</CardTitle>
					<CardDescription>
						Run or inspect anxiety prediction rows for this response.
					</CardDescription>
				</div>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							onClick={() => runMutation.mutate()}
							disabled={isBusy}
							className="w-full cursor-pointer sm:w-auto"
						>
							{runMutation.isPending ? (
								<Loader2 className="mr-2 size-4 animate-spin" />
							) : (
								<RefreshCw className="mr-2 size-4" />
							)}
							{buttonLabel}
						</Button>
					</TooltipTrigger>
					<TooltipContent>Run prediction for this response</TooltipContent>
				</Tooltip>
			</CardHeader>
			<CardContent className="space-y-4">
				{resultsQuery.isError && (
					<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
						Failed to load prediction results.
					</div>
				)}

				{runMutation.isError && (
					<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
						Failed to run prediction.
					</div>
				)}

				{hasFailedRows && <PredictionIssueList rows={failedRows} />}

				{resultsQuery.isLoading ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="size-4 animate-spin" />
						Loading prediction rows…
					</div>
				) : hasRows ? (
					<div className="overflow-hidden rounded-lg border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Video</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Label</TableHead>
									<TableHead className="text-right">
										High Anxiety Probability
									</TableHead>
									<TableHead className="text-right">Threshold</TableHead>
									<TableHead>Error</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.map((row, index) => {
									const parts = row.videoPath?.split("/").filter(Boolean) ?? [];
									const folder = parts.at(-2);
									const videoName = parts.at(-1) ?? `${row.videoKind} ${index + 1}`;
									const questionNumber = folder?.match(/^q(\d+)$/i)?.[1];

									return (
										<TableRow key={row.id}>
											<TableCell>
												<div className="font-medium">{videoName}</div>
												<div className="max-w-72 truncate text-xs text-muted-foreground">
													{row.questionText ??
														(questionNumber ? `Question ${questionNumber}` : `Question ${index + 1}`)}
												</div>
											</TableCell>
											<TableCell>
												<StatusBadge status={row.status} />
											</TableCell>
											<TableCell className="capitalize">
												{formatLabel(row.label)}
											</TableCell>
											<TableCell className="text-right font-medium tabular-nums">
												{row.probabilityAnxietyTinggi == null
													? "-"
													: `${(Number(row.probabilityAnxietyTinggi) * 100).toFixed(1)}%`}
											</TableCell>
											<TableCell className="text-right tabular-nums text-muted-foreground">
												{row.threshold == null
													? "-"
													: `${(Number(row.threshold) * 100).toFixed(1)}%`}
											</TableCell>
											<TableCell className="max-w-72 truncate text-muted-foreground">
												{row.errorMessage ?? "-"}
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				) : hasFailedRows ? null : (
					<div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
						No prediction rows yet. Click run to create and execute prediction
						for this response.
					</div>
				)}
			</CardContent>
		</Card>
	);
}

type PredictionRow = Awaited<ReturnType<typeof getPredictionResults>>[number];

function isVisiblePredictionRow(row: PredictionRow) {
	return !(
		row.videoKind === "secondary" &&
		row.status === "failed" &&
		row.errorMessage?.startsWith("video file not found:")
	);
}

function PredictionIssueList({ rows }: { rows: PredictionRow[] }) {
	return (
		<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
			<div className="flex items-start gap-3">
				<AlertCircle className="mt-0.5 size-4 shrink-0" />
				<div className="space-y-1">
					<div className="font-medium">Prediction failed</div>
					<ul className="list-disc space-y-1 pl-4">
						{rows.map((row) => (
							<li key={row.id}>{formatPredictionError(row)}</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}

function formatPredictionError(row: PredictionRow) {
	const message = row.errorMessage ?? "Unknown prediction error.";
	if (message.startsWith("unsupported video extension:")) {
		if (isFolderPath(message.replace("unsupported video extension:", ""))) {
			return `${row.videoKind}: no video file found. This response points to a folder, not a video. Re-record or upload again.`;
		}
		return `${row.videoKind}: unsupported video file${formatVideoMime(row)}. Upload a video with one of: mp4, webm, mov, avi.`;
	}
	if (message.startsWith("video file not found:")) {
		return `${row.videoKind}: video file is missing. Re-record or upload again.`;
	}
	if (
		message.startsWith("unsafe video path:") ||
		message.startsWith("video path escapes upload root:")
	) {
		return `${row.videoKind}: invalid video path. Re-record or upload again.`;
	}
	return `${row.videoKind}: ${message}`;
}

function isFolderPath(path: string) {
	const name = path.trim().split("/").at(-1) ?? "";
	return !name.includes(".");
}

function formatVideoMime(row: PredictionRow) {
	const format = row.videoFormat?.toLowerCase();
	const safeFormat = format && /^[a-z0-9]+$/.test(format) ? format : null;
	if (!row.videoMimeType && !safeFormat) return "";
	const details = [row.videoMimeType, safeFormat && `.${safeFormat}`]
		.filter(Boolean)
		.join(", ");
	return ` (${details})`;
}

function StatusBadge({ status }: { status: string }) {
	const variant =
		status === "completed"
			? "default"
			: status === "failed"
				? "destructive"
				: "secondary";
	return <Badge variant={variant}>{status}</Badge>;
}

function formatLabel(label: string | null) {
	if (!label) return "-";
	return label.replace(/_/g, " ");
}

