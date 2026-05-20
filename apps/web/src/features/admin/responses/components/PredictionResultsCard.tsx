import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
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

	const rows = (resultsQuery.data ?? []).filter(isVisiblePredictionRow);
	const hasRows = rows.length > 0;
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
									<TableHead>Confidence</TableHead>
									<TableHead>Error</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.map((row) => (
									<TableRow key={row.id}>
										<TableCell>
											<div className="font-medium">{row.videoKind}</div>
											<div className="max-w-72 truncate text-xs text-muted-foreground">
												{row.videoPath}
											</div>
										</TableCell>
										<TableCell>
											<StatusBadge status={row.status} />
										</TableCell>
										<TableCell>{formatLabel(row.label)}</TableCell>
										<TableCell>
											{formatConfidence(
												row.probabilityAnxietyTinggi,
												row.label,
											)}
										</TableCell>
										<TableCell className="max-w-72 truncate text-muted-foreground">
											{row.errorMessage ?? "-"}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				) : (
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

function formatConfidence(
	probabilityHigh: number | string | null,
	label: string | null,
) {
	if (probabilityHigh === null || !label) return "-";
	const numeric = Number(probabilityHigh);
	if (!Number.isFinite(numeric)) return "-";
	const confidence = label.includes("tinggi") ? numeric : 1 - numeric;
	return `${(confidence * 100).toFixed(2)}%`;
}
