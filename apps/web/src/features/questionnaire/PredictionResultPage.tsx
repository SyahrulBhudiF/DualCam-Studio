import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	CheckCircle2,
	Clipboard,
	Loader2,
	RefreshCcw,
	XCircle,
} from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import {
	getPublicPredictionResult,
	runPublicPrediction,
} from "@/apis/prediction";
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

type ResultPageProps = {
	responseId: string;
	token: string;
};

type PredictionRow = Awaited<
	ReturnType<typeof getPublicPredictionResult>
>[number];

export function PredictionResultPage({ responseId, token }: ResultPageProps) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const resultQuery = useQuery({
		queryKey: ["public", "prediction", responseId, token],
		queryFn: () => getPublicPredictionResult({ data: { responseId, token } }),
		enabled: token.length > 0,
		refetchInterval: (query) =>
			(query.state.data ?? []).some(
				(row) => row.status === "pending" || row.status === "running",
			)
				? 3000
				: false,
		retry: false,
	});

	const runMutation = useMutation({
		mutationFn: () => runPublicPrediction({ data: { responseId, token } }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["public", "prediction", responseId, token],
			});
			toast.success("Analisis dimulai");
		},
		onError: () => {
			queryClient.invalidateQueries({
				queryKey: ["public", "prediction", responseId, token],
			});
			toast.message("Analisis sedang diproses. Memuat ulang status…");
		},
	});

	const rows = (resultQuery.data ?? []).filter(isVisiblePredictionRow);
	const summary = useMemo(() => summarizeRows(rows), [rows]);
	const totalScore = useMemo(() => sumQuestionnaireScore(rows), [rows]);
	const canRun =
		!summary.isRunning &&
		(rows.length === 0 || rows.some((row) => row.status === "failed"));
	const isBusy =
		resultQuery.isLoading || runMutation.isPending || summary.isRunning;

	const copyLink = async () => {
		await navigator.clipboard.writeText(window.location.href);
		toast.success("Link hasil berhasil disalin");
	};

	if (!token) {
		return (
			<ResultShell>
				<ResultError
					description="Link hasil tidak lengkap. Gunakan link hasil yang diberikan setelah submit."
					title="Token hasil tidak ditemukan"
				/>
			</ResultShell>
		);
	}

	if (resultQuery.isError) {
		return (
			<ResultShell>
				<ResultError
					description="Link hasil tidak valid atau sudah kedaluwarsa."
					title="Tidak bisa membuka hasil"
				/>
			</ResultShell>
		);
	}

	return (
		<ResultShell>
			<Card className="overflow-hidden shadow-lg">
				<CardHeader className="border-b bg-card px-6 py-5">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="space-y-1">
							<CardTitle className="text-2xl font-bold tracking-tight">
								Hasil Analisis
							</CardTitle>
							<CardDescription>
								Ringkasan prediksi video dan skor kuesioner.
							</CardDescription>
						</div>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									onClick={copyLink}
									className="h-9 cursor-pointer"
								>
									<Clipboard className="mr-2 size-4" />
									Salin Link
								</Button>
							</TooltipTrigger>
							<TooltipContent>Copy result link</TooltipContent>
						</Tooltip>
					</div>
				</CardHeader>
				<CardContent className="space-y-5 p-6">
					{isBusy && (
						<div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-4">
							<Loader2 className="size-5 animate-spin" />
							<div>
								<div className="font-medium">Menganalisis video…</div>
								<div className="text-sm text-muted-foreground">
									Proses ini bisa memakan waktu beberapa saat.
								</div>
							</div>
						</div>
					)}

					{summary.completedCount > 0 ? (
						<PredictionSummary summary={summary} totalScore={totalScore} />
					) : (
						<div className="rounded-lg border border-dashed p-6 text-center">
							<div className="font-medium">Hasil prediksi belum tersedia</div>
							<p className="mt-1 text-sm text-muted-foreground">
								Jalankan analisis untuk membuat hasil prediksi dari video yang
								sudah dikirim.
							</p>
						</div>
					)}

					{rows.length > 0 && <PredictionTable rows={rows} />}

					<div className="flex flex-col gap-2 border-t pt-5 sm:flex-row sm:justify-end">
						{canRun && (
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										onClick={() => runMutation.mutate()}
										disabled={isBusy}
										className="cursor-pointer"
									>
										{runMutation.isPending ? (
											<Loader2 className="mr-2 size-4 animate-spin" />
										) : (
											<RefreshCcw className="mr-2 size-4" />
										)}
										{rows.length === 0 ? "Jalankan Analisis" : "Coba Lagi"}
									</Button>
								</TooltipTrigger>
								<TooltipContent>Run video analysis</TooltipContent>
							</Tooltip>
						)}
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="secondary"
									onClick={() => navigate({ to: "/" })}
									className="cursor-pointer"
								>
									Kembali ke Beranda
								</Button>
							</TooltipTrigger>
							<TooltipContent>Return to home page</TooltipContent>
						</Tooltip>
					</div>
				</CardContent>
			</Card>
		</ResultShell>
	);
}

function ResultShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-muted/40 p-4">
			<div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-5xl items-center justify-center">
				<div className="w-full">{children}</div>
			</div>
		</div>
	);
}

function ResultError({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<Card className="mx-auto max-w-md text-center shadow-lg">
			<CardHeader>
				<div className="mb-4 flex justify-center">
					<XCircle className="size-14 text-destructive" />
				</div>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
		</Card>
	);
}

function PredictionSummary({
	summary,
	totalScore,
}: {
	summary: PredictionSummaryData;
	totalScore: number | null;
}) {
	return (
		<div className="grid grid-cols-4 gap-3">
			<div className="col-span-2 rounded-lg border bg-background p-5">
				<div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Tingkat Kecemasan
				</div>
				<div className="mt-3 flex items-center gap-3">
					<span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
						<CheckCircle2 className="size-4" />
					</span>
					<div className="text-3xl font-bold capitalize tracking-tight">
						{formatLabel(summary.label)}
					</div>
				</div>
			</div>
			<div className="rounded-lg border bg-background p-5">
				<div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					High Anxiety Probability
				</div>
				<div className="mt-3 flex items-baseline gap-2">
					<div className="text-3xl font-bold tracking-tight">
						{summary.probability == null
							? "-"
							: `${(summary.probability * 100).toFixed(1)}%`}
					</div>
				</div>
				<div className="mt-2 text-xs text-muted-foreground">
					Threshold: {summary.threshold == null
						? "-"
						: `${(summary.threshold * 100).toFixed(1)}%`}
				</div>
			</div>
			<div className="rounded-lg border bg-background p-5">
				<div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Questionnaire Score
				</div>
				<div className="mt-3 text-3xl font-bold tracking-tight">
					{totalScore ?? "-"}
				</div>
				<div className="mt-2 text-xs text-muted-foreground">Total answers</div>
			</div>
		</div>
	);
}

function PredictionTable({ rows }: { rows: PredictionRow[] }) {
	return (
		<div className="overflow-hidden rounded-lg border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[34%]">Video</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Label</TableHead>
						<TableHead className="text-right">High Anxiety Probability</TableHead>
						<TableHead className="text-right">Threshold</TableHead>
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
									<div className="max-w-80 truncate text-xs text-muted-foreground">
										{row.questionText ??
										(questionNumber ? `Question ${questionNumber}` : `Question ${index + 1}`)}
									</div>
								</TableCell>
								<TableCell>
									<StatusBadge status={row.status} />
									{row.errorMessage && (
										<div className="mt-1 max-w-xs text-xs text-destructive">
											{row.errorMessage}
										</div>
									)}
								</TableCell>
								<TableCell className="font-medium capitalize">
									{formatLabel(row.label)}
								</TableCell>
								<TableCell className="text-right font-medium tabular-nums">
									{row.probabilityAnxietyTinggi == null
										? "-"
										: `${(row.probabilityAnxietyTinggi * 100).toFixed(1)}%`}
								</TableCell>
								<TableCell className="text-right tabular-nums text-muted-foreground">
									{row.threshold == null
										? "-"
										: `${(row.threshold * 100).toFixed(1)}%`}
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}

function isVisiblePredictionRow(row: PredictionRow) {
	return !(
		row.videoKind === "secondary" &&
		row.status === "failed" &&
		row.errorMessage?.startsWith("video file not found:")
	);
}

function StatusBadge({ status }: { status: string }) {
	const variant =
		status === "failed"
			? "destructive"
			: status === "completed"
				? "default"
				: "secondary";
	return <Badge variant={variant}>{status}</Badge>;
}

type PredictionSummaryData = {
	completedCount: number;
	isRunning: boolean;
	label: string | null;
	probability: number | null;
	threshold: number | null;
};

function summarizeRows(rows: PredictionRow[]): PredictionSummaryData {
	const completed = rows.filter(
		(row) => row.status === "completed" && row.probabilityAnxietyTinggi != null,
	);
	const probabilities = completed
		.map((row) => row.probabilityAnxietyTinggi)
		.filter((value): value is number => value != null)
		.sort((a, b) => a - b);
	const probability = probabilities.length
		? (() => {
				const index = (probabilities.length - 1) * 0.9;
				const lower = Math.floor(index);
				const upper = Math.ceil(index);
				const weight = index - lower;
				return (
					(probabilities[lower] ?? 0) * (1 - weight) +
					(probabilities[upper] ?? probabilities[lower] ?? 0) * weight
				);
			})()
		: null;

	const threshold = completed.length
		? completed.reduce((acc, row) => acc + (row.threshold ?? 0), 0) /
			completed.length
		: null;

	return {
		completedCount: completed.length,
		isRunning: rows.some(
			(row) => row.status === "pending" || row.status === "running",
		),
			label:
			probability == null || threshold == null
				? null
				: probability >= threshold
					? "anxiety_tinggi"
					: "anxiety_rendah",
		probability,
		threshold,
	};
}

function formatLabel(label: string | null) {
	if (!label) return "-";
	return label.replaceAll("_", " ");
}


function sumQuestionnaireScore(rows: PredictionRow[]) {
	const scoresByQuestion = new Map<string, number>();

	for (const row of rows) {
		if (row.score == null) continue;
		scoresByQuestion.set(row.questionId, row.score);
	}

	return scoresByQuestion.size
		? [...scoresByQuestion.values()].reduce((acc, score) => acc + score, 0)
		: null;
}

