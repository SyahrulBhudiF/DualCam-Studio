import { Link } from "@tanstack/react-router";
import { Main } from "@/components/layout/Main";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/Table";
import type { VideoPrediction } from "@/infrastructure/db/types";

type VideoPredictionsListProps = {
	predictions: VideoPrediction[];
};

const anxietyLabels: Record<string, string> = {
	anxiety_rendah: "Kecemasan Rendah",
	anxiety_tinggi: "Kecemasan Tinggi",
};

export function VideoPredictionsList({
	predictions,
}: VideoPredictionsListProps) {
	return (
		<Main className="space-y-4">
			<div>
				<h2 className="font-semibold text-2xl tracking-tight">
					Manajemen Prediksi Video
				</h2>
				<p className="text-muted-foreground">
					Daftar semua prediksi dari upload video mandiri.
				</p>
			</div>

			<div className="overflow-hidden rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Waktu</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Video</TableHead>
							<TableHead>Label</TableHead>
							<TableHead className="text-right">Probabilitas</TableHead>
							<TableHead className="text-right">Frame</TableHead>
							<TableHead className="text-right">Event</TableHead>
							<TableHead className="text-right">Durasi</TableHead>
							<TableHead>Model</TableHead>
							<TableHead>Error</TableHead>
							<TableHead>Aksi</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{predictions.length > 0 ? (
							predictions.map((prediction) => (
								<TableRow key={prediction.id}>
									<TableCell>
										{new Date(prediction.createdAt).toLocaleString("id-ID")}
									</TableCell>
									<TableCell>{prediction.status}</TableCell>
									<TableCell>
										<div className="max-w-56 truncate">
											{prediction.videoPath}
										</div>
									</TableCell>
									<TableCell>
										{prediction.label
											? (anxietyLabels[prediction.label] ?? prediction.label)
											: "-"}
									</TableCell>
									<TableCell className="text-right font-medium tabular-nums">
										{typeof prediction.probabilityAnxietyTinggi === "number"
											? `${(prediction.probabilityAnxietyTinggi * 100).toFixed(1)}%`
											: "-"}
									</TableCell>
									<TableCell className="text-right tabular-nums">
										{prediction.frameCount ?? "-"}
									</TableCell>
									<TableCell className="text-right tabular-nums">
										{prediction.eventCount ?? "-"}
									</TableCell>
									<TableCell className="text-right tabular-nums">
										{typeof prediction.durationSeconds === "number"
											? `${prediction.durationSeconds.toFixed(1)}s`
											: "-"}
									</TableCell>
									<TableCell>
										{prediction.modelVersion ?? prediction.modelExpName ?? "-"}
									</TableCell>
									<TableCell>
										<div className="max-w-48 truncate text-muted-foreground">
											{prediction.errorMessage ?? "-"}
										</div>
									</TableCell>
									<TableCell>
										<Link
											className="font-medium text-primary underline-offset-4 hover:underline"
											params={{ predictionId: prediction.id }}
											to="/admin/video-predictions/$predictionId"
										>
											Detail
										</Link>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={11} className="h-24 text-center">
									Belum ada Prediksi Video.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</Main>
	);
}
