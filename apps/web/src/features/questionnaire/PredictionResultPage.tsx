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
			<Card className="shadow-lg">
				<CardHeader className="space-y-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<CardTitle className="text-2xl font-bold">
								Hasil Analisis
							</CardTitle>
							<CardDescription>
								Simpan link ini untuk melihat hasil lagi nanti.
							</CardDescription>
						</div>
						<Button
							variant="outline"
							onClick={copyLink}
							className="cursor-pointer"
						>
							<Clipboard className="mr-2 size-4" />
							Salin Link Hasil
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
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
						<PredictionSummary summary={summary} />
					) : (
						<div className="rounded-lg border border-dashed p-6 text-center">
							<div className="font-medium">Hasil prediksi belum tersedia</div>
							<p className="mt-1 text-sm text-muted-foreground">
								Jalankan analisis untuk membuat hasil prediksi dari video yang
								sudah dikirim.
							</p>
						</div>
					)}

					<div className="flex flex-col gap-2 sm:flex-row">
						{canRun && (
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
						)}
						<Button
							variant="secondary"
							onClick={() => navigate({ to: "/" })}
							className="cursor-pointer"
						>
							Kembali ke Beranda
						</Button>
					</div>

					{rows.length > 0 && <PredictionTable rows={rows} />}
				</CardContent>
			</Card>
		</ResultShell>
	);
}

function ResultShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-muted/40 p-4">
			<div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-4xl items-center justify-center">
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

function PredictionSummary({ summary }: { summary: PredictionSummaryData }) {
	return (
		<div className="grid gap-4 sm:grid-cols-3">
			<div className="rounded-lg border bg-background p-4 sm:col-span-2">
				<div className="text-sm text-muted-foreground">Tingkat Kecemasan</div>
				<div className="mt-2 flex items-center gap-2">
					<CheckCircle2 className="size-5 text-primary" />
					<div className="text-2xl font-bold capitalize">
						{formatLabel(summary.label)}
					</div>
				</div>
			</div>
			<div className="rounded-lg border bg-background p-4">
				<div className="text-sm text-muted-foreground">Confidence</div>
				<div className="mt-2 text-2xl font-bold">
					{formatConfidence(summary.probability, summary.label)}
				</div>
			</div>
		</div>
	);
}

function PredictionTable({ rows }: { rows: PredictionRow[] }) {
	return (
		<div className="rounded-lg border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Video</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Label</TableHead>
						<TableHead className="text-right">Confidence</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{rows.map((row) => (
						<TableRow key={row.id}>
							<TableCell>
								<div className="font-medium">{row.videoKind}</div>
								<div className="text-xs text-muted-foreground">
									{row.questionId}
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
							<TableCell>{formatLabel(row.label)}</TableCell>
							<TableCell className="text-right">
								{formatConfidence(row.probabilityAnxietyTinggi, row.label)}
							</TableCell>
						</TableRow>
					))}
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
};

function summarizeRows(rows: PredictionRow[]): PredictionSummaryData {
	const completed = rows.filter(
		(row) => row.status === "completed" && row.probabilityAnxietyTinggi != null,
	);
	const probability = completed.length
		? completed.reduce(
				(acc, row) => acc + (row.probabilityAnxietyTinggi ?? 0),
				0,
			) / completed.length
		: null;

	return {
		completedCount: completed.length,
		isRunning: rows.some(
			(row) => row.status === "pending" || row.status === "running",
		),
		label:
			probability == null
				? null
				: probability >= 0.5
					? "anxiety_tinggi"
					: "anxiety_rendah",
		probability,
	};
}

function formatLabel(label: string | null) {
	if (!label) return "-";
	return label.replaceAll("_", " ");
}

function formatConfidence(
	probabilityHigh: number | null,
	label: string | null,
) {
	if (probabilityHigh == null || !label) return "-";
	const confidence = label.includes("tinggi")
		? probabilityHigh
		: 1 - probabilityHigh;
	return `${(confidence * 100).toFixed(1)}%`;
}
