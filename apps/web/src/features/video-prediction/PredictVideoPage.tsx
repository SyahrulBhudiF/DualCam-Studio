import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Upload, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { finalizeUpload, initUpload, uploadChunk } from "@/apis/upload";
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
	const [error, setError] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);

	const updateSelectedFile = (file: File | null) => {
		setPreviewUrl(file ? URL.createObjectURL(file) : null);
		setCanPreview(
			!!file &&
				file.type.startsWith("video/") &&
				document.createElement("video").canPlayType(file.type) !== "",
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

				for (let index = 0; index < uploadSession.totalChunks; index++) {
					const start = index * uploadSession.chunkSize;
					const end = Math.min(
						start + uploadSession.chunkSize,
						value.video.size,
					);

					await uploadChunk({
						chunk: value.video.slice(start, end),
						index,
						totalChunks: uploadSession.totalChunks,
						uploadId: uploadSession.uploadId,
					});

					setUploadProgress(
						Math.round(((index + 1) / uploadSession.totalChunks) * 100),
					);
				}

				const finalized = await finalizeUpload(uploadSession.uploadId);
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
				toast.success("Prediksi video dimulai", { id: "predict-video-upload" });

				await navigate({
					params: { predictionId: created.prediction.id },
					search: { token: created.accessToken },
					to: "/predict-video/result/$predictionId",
				});
			} catch (error) {
				const message = error instanceof Error ? error.message : "Upload gagal";
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
					Unggah satu video wajah. Hasil final, frame, dan event akan disimpan.
				</p>
			</div>

			<div className="mx-auto max-w-3xl space-y-4">
				<form action={() => void form.handleSubmit()}>
					<Card>
						<CardHeader>
							<CardTitle>Unggah video lokal</CardTitle>
							<CardDescription>
								Tarik video ke area ini atau klik untuk memilih file. Format
								umum: mp4, webm, mov, avi.
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
											Satu video saja. File akan diunggah lalu dianalisis
											otomatis.
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
												Browser tidak dapat memutar format video ini, tetapi
												file tetap bisa diunggah dan diproses oleh predictor.
											</p>
										</div>
									)}
								</div>
							) : null}

							{form.state.isSubmitting ? (
								<div className="space-y-2">
									<div className="flex items-center justify-between text-muted-foreground text-sm">
										<span className="flex items-center gap-2">
											<Loader2 className="size-4 animate-spin" />
											Mengunggah dan memulai prediksi…
										</span>
										<span>{uploadProgress}%</span>
									</div>
									<div className="h-2 overflow-hidden rounded-full bg-muted">
										<div
											className="h-full rounded-full bg-primary transition-all"
											style={{ width: `${uploadProgress}%` }}
										/>
									</div>
								</div>
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
										{isSubmitting ? "Memproses…" : "Mulai prediksi"}
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
