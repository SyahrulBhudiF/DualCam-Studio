import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Upload, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { finalizeUpload, initUpload, uploadChunks } from "@/apis/upload";
import {
	createVideoPrediction,
	runVideoPrediction,
} from "@/apis/video-prediction";
import { Button } from "@/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export function PredictVideoPage() {
	const navigate = useNavigate();
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [canPreview, setCanPreview] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [stage, setStage] = useState<UploadStage>("idle");
	const [error, setError] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);

	const updateSelectedFile = (file: File | null) => {
		setPreviewUrl(file ? URL.createObjectURL(file) : null);
		const video = document.createElement("video");
		setCanPreview(
			!!file &&
				file.type.startsWith("video/") &&
				video.canPlayType(file.type) !== "",
		);
	};

	const form = useForm({
		defaultValues: {
			video: null as File | null,
		},
		validators: {
			onSubmit: ({ value }) => {
				if (!value.video) return "Video wajib dipilih";
				if (!value.video.type.startsWith("video/")) return "File harus video";
				return undefined;
			},
		},
		onSubmit: async ({ value }) => {
			if (!value.video) return;

			setError(null);
			setStage("uploading");
			setUploadProgress(0);

			try {
				toast.loading("Mengunggah video…", { id: "predict-video-upload" });
				const safeName = value.video.name.replace(/[^a-zA-Z0-9._-]/g, "_");
				const uploadSession = await initUpload({
					contentType: value.video.type || "video/webm",
					fileName: safeName,
					folderName: `predict-video/${crypto.randomUUID()}`,
					size: value.video.size,
				});

				await uploadChunks({
					concurrency: 6,
					file: value.video,
					onProgress: setUploadProgress,
					session: uploadSession,
				});

				setStage("saving");
				const finalized = await finalizeUpload(uploadSession.uploadId);
				setStage("preparing");
				const created = await createVideoPrediction({
					data: {
						format: safeName.split(".").at(-1)?.toLowerCase(),
						mimeType: value.video.type || undefined,
						sizeBytes: value.video.size,
						videoPath: finalized.path,
					},
				});

				void runVideoPrediction({
					data: { predictionId: created.prediction.id },
				});
				toast.success("Video berhasil diupload", { id: "predict-video-upload" });

				await navigate({
					params: { predictionId: created.prediction.id },
					search: { token: created.accessToken },
					to: "/predict-video/result/$predictionId",
				});
			} catch (error) {
				const message = error instanceof Error ? error.message : "Upload gagal";
				setStage("idle");
				setError(message);
				toast.error(message, { id: "predict-video-upload" });
			}
		},
	});

	return (
		<div className="min-h-screen bg-muted/40 p-4 pb-48">
			<div className="mx-auto mb-6 max-w-3xl">
				<h1 className="font-semibold text-2xl">
					Prediksi Kecemasan dari Video
				</h1>
				<p className="text-muted-foreground">
					Upload satu video wajah. Sistem akan memproses hasil, frame, dan event.
				</p>
			</div>

			<div className="mx-auto max-w-3xl space-y-4">
				<form action={() => void form.handleSubmit()}>
					<Card>
						<CardHeader>
							<CardTitle>Pilih video wajah</CardTitle>
							<CardDescription>
								Tarik video ke area ini atau klik untuk memilih file. Jika pratinjau
								tidak tampil, video tetap bisa dilihat di halaman analisis.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<form.Field name="video">
								{(field) => (
									<Label
										className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
											isDragging
												? "border-primary bg-primary/5"
												: "border-muted-foreground/25 bg-background hover:bg-muted/50"
										}`}
										onDragEnter={(event) => {
											event.preventDefault();
											setIsDragging(true);
										}}
										onDragLeave={(event) => {
											event.preventDefault();
											setIsDragging(false);
										}}
										onDragOver={(event) => event.preventDefault()}
										onDrop={(event) => {
											event.preventDefault();
											setIsDragging(false);
											const file = event.dataTransfer.files?.[0] ?? null;
											field.handleChange(file);
											updateSelectedFile(file);
										}}
									>
										<div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
											<Upload className="size-8" />
										</div>
										<div className="font-medium">
											{field.state.value
												? field.state.value.name
												: "Pilih atau tarik video ke sini"}
										</div>
										<p className="mt-1 text-muted-foreground text-sm">
											Satu video saja. File akan diupload dan diproses otomatis.
										</p>
										<Input
											accept="video/*"
											className="sr-only"
											disabled={form.state.isSubmitting}
											type="file"
											onChange={(event) => {
												const file = event.target.files?.[0] ?? null;
												field.handleChange(file);
												updateSelectedFile(file);
											}}
										/>
									</Label>
								)}
							</form.Field>

							{previewUrl ? (
								<div className="overflow-hidden rounded-lg border bg-black">
									<div className="flex items-center gap-2 border-b bg-background px-3 py-2 text-sm">
										<Video className="size-4" />
										Pratinjau video
									</div>
									{canPreview ? (
										<video
											className="max-h-80 w-full"
											controls
											src={previewUrl}
										>
											<track kind="captions" label="Tidak ada caption" />
										</video>
									) : (
										<div className="flex min-h-60 flex-col items-center justify-center gap-2 bg-muted p-6 text-center">
											<Video className="size-10 text-muted-foreground" />
											<div className="font-medium">
												Pratinjau tidak tersedia
											</div>
											<p className="max-w-md text-muted-foreground text-sm">
												Browser tidak dapat memutar pratinjau ini. Video tetap bisa
												diupload dan dilihat di halaman analisis.
											</p>
										</div>
									)}
								</div>
							) : null}

							{form.state.isSubmitting ? (
								<UploadProgress stage={stage} uploadProgress={uploadProgress} />
							) : null}

							{error ? (
								<p className="text-destructive text-sm">{error}</p>
							) : null}

							<form.Subscribe
								selector={(state) => [state.values.video, state.isSubmitting]}
							>
								{([video, isSubmitting]) => (
									<Button
										className="mt-2 w-full cursor-pointer dark:bg-blend-saturation"
										disabled={!video || !!isSubmitting}
										size="lg"
										type="submit"
									>
										{isSubmitting ? stageLabel(stage) : "Upload video"}
									</Button>
								)}
							</form.Subscribe>
						</CardContent>
					</Card>
				</form>
			</div>
		</div>
	);
}

type UploadStage = "idle" | "uploading" | "saving" | "preparing";

function stageLabel(stage: UploadStage) {
	if (stage === "saving") return "Menyimpan video…";
	if (stage === "preparing") return "Menyiapkan analisis…";
	return "Mengupload…";
}

function stageProgress(stage: UploadStage, uploadProgress: number) {
	if (stage === "saving") return 96;
	if (stage === "preparing") return 100;
	return Math.min(uploadProgress, 95);
}

function UploadProgress({
	stage,
	uploadProgress,
}: {
	stage: UploadStage;
	uploadProgress: number;
}) {
	const progress = stageProgress(stage, uploadProgress);
	return (
		<div className="rounded-2xl border bg-muted/30 p-4">
			<div className="flex items-center justify-between text-sm">
				<span className="flex items-center gap-2 font-medium">
					<Loader2 className="size-4 animate-spin text-primary" />
					{stageLabel(stage)}
				</span>
				<span className="text-muted-foreground tabular-nums">{progress}%</span>
			</div>
			<div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
				<div
					className="h-full rounded-full bg-primary transition-all duration-300"
					style={{ width: `${progress}%` }}
				/>
			</div>
			<div className="mt-3 grid grid-cols-3 gap-2 text-xs">
				<Step active={stage === "uploading"} done={progress > 95} label="Upload" />
				<Step active={stage === "saving"} done={stage === "preparing"} label="Simpan" />
				<Step active={stage === "preparing"} done={false} label="Siapkan" />
			</div>
		</div>
	);
}

function Step({ active, done, label }: { active: boolean; done: boolean; label: string }) {
	return (
		<div
			className={`rounded-full px-3 py-1 text-center ${
				active || done
					? "bg-primary/10 font-medium text-primary"
					: "bg-background text-muted-foreground"
			}`}
		>
			{label}
		</div>
	);
}

