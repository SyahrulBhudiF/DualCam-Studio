import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLoaderData, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { submitSegmentedResponse } from "@/apis/segmented-upload";
import { CameraControlPanel } from "@/components/CameraControlPanel";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { useCameraSetup } from "@/libs/hooks/use-camera-setup";
import { useUploadQueue } from "@/libs/hooks/use-upload-queue";
import { useQuestionnaireStore } from "@/libs/store/QuestionnaireStore";
import { useUserStore } from "@/libs/store/UserStore";

interface Answer {
	id: string;
	answer_text: string;
}

export function SegmentedPage() {
	const { questionnaire, questions } = useLoaderData({
		from: "/questionnaire/segmented/",
	});
	const user = useUserStore((s) => s.user);
	const store = useQuestionnaireStore();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const [currentIndex, setCurrentIndex] = useState(0);
	const [isProcessing, setIsProcessing] = useState(false);

	const {
		videoDevices,
		deviceIdMain,
		setDeviceIdMain,
		deviceIdSec,
		videoRefMain,
		videoRefSec,
		realSenseRef,
		isRecording,
		allReady,
		setSecReady,
		startRecording,
		stopRecording,
	} = useCameraSetup();
	const uploadQueue = useUploadQueue({ maxJobs: questions.length });

	const submitMutation = useMutation({
		mutationFn: submitSegmentedResponse,
		onSuccess: (result) => {
			queryClient.invalidateQueries({ queryKey: ["admin", "responses"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });

			const predictionOptIn = useQuestionnaireStore.getState().predictionOptIn;
			store.reset();

			if (predictionOptIn) {
				navigate({
					to: "/prediction/$responseId",
					params: { responseId: result.responseId },
					search: { token: result.resultToken },
				});
				return;
			}

			navigate({ to: "/success" });
		},
	});

	const form = useForm({
		defaultValues: {
			answerId: "",
		},
		onSubmit: async ({ value }) => {
			if (!value.answerId) return;

			setIsProcessing(true);
			const currentQ = questions[currentIndex];
			const { blobMain, secondaryPath } = await stopRecording();
			const subFolder = `q${currentIndex + 1}`;
			const mainFileName = `${subFolder}/${user?.name ?? "Anon"}_${currentIndex + 1}_${currentQ.id}_main.webm`;

			if (blobMain.size > 0) {
				await uploadQueue.enqueue({
					questionId: currentQ.id,
					folderName: store.folderName,
					fileName: mainFileName,
					blob: blobMain,
				});
			}

			store.addAnswer(currentQ.id, {
				questionId: currentQ.id,
				answerId: value.answerId,
				videoMainPath: "",
				videoSecPath: secondaryPath ?? "",
			});

			form.reset();

			if (currentIndex < questions.length - 1) {
				setCurrentIndex((prev) => prev + 1);
				setIsProcessing(false);
				return;
			}

			const uploadState = await uploadQueue.waitForIdle();
			if (Object.keys(uploadState.failed).length > 0) {
				setIsProcessing(false);
				return;
			}

			const answers = Object.values(
				useQuestionnaireStore.getState().answers,
			).map((answer) => ({
				...answer,
				videoMainPath:
					uploadState.completed[answer.questionId] ?? answer.videoMainPath,
			}));

			const finalData = {
				userEmail: user?.email || "anon@example.com",
				userName: user?.name || "Anon",
				userClass: user?.class || "-",
				userGender: user?.gender || "-",
				userAge: user?.age || 0,
				userNim: user?.nim || "-",
				userSemester: user?.semester || "-",
				questionnaireId: questionnaire.id,
				folderName: store.folderName,
				answers,
				predictionOptIn: useQuestionnaireStore.getState().predictionOptIn,
			};
			await submitMutation.mutateAsync({ data: finalData });
		},
	});

	useEffect(() => {
		if (user?.name && !store.folderName) {
			const safeName = user.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
			store.setFolderName(`segmented/${safeName}_${Date.now()}`);
		}
	}, [user, store.folderName, store.setFolderName]);

	useEffect(() => {
		if (!allReady || isProcessing || !questions || !store.folderName) return;

		const timer = setTimeout(() => {
			const currentQ = questions[currentIndex];
			const subFolder = `q${currentIndex + 1}`;
			const secFileName = `${subFolder}/answer_${currentIndex + 1}_${currentQ.id}_sec.avi`;

			void startRecording({
				mode: "SEGMENT",
				folderName: store.folderName,
				fileName: secFileName,
			});
		}, 500);

		return () => clearTimeout(timer);
	}, [
		currentIndex,
		allReady,
		isProcessing,
		questions,
		store.folderName,
		startRecording,
	]);

	const currentQ = questions?.[currentIndex];
	const isLastQuestion = currentIndex === questions.length - 1;

	return (
		<div className="min-h-screen bg-muted/40 p-4 pb-48">
			{!allReady && (
				<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-muted/80 gap-4">
					<div className="animate-spin">
						<Loader2 className="size-10" />
					</div>
					<div className="text-muted-foreground font-medium">
						Initializing Cameras…
					</div>
				</div>
			)}

			<div className="max-w-3xl mx-auto mb-6">
				<h1 className="text-2xl font-semibold">
					Question {currentIndex + 1} / {questions?.length}
				</h1>
			</div>

			<div className="max-w-3xl mx-auto mb-8 space-y-4">
				<form action={() => void form.handleSubmit()}>
					{currentQ && (
						<Card>
							<CardHeader>
								<CardTitle>{currentQ.question_text}</CardTitle>
							</CardHeader>
							<CardContent>
								<form.Field name="answerId">
									{(field) => (
										<RadioGroup
											value={field.state.value}
											onValueChange={(val) => field.handleChange(val)}
										>
											{currentQ.answers.map((ans: Answer) => (
												<div
													key={ans.id}
													className="flex items-center gap-x-2 mb-2 cursor-pointer"
												>
													<RadioGroupItem value={ans.id} id={ans.id} />
													<Label htmlFor={ans.id}>{ans.answer_text}</Label>
												</div>
											))}
										</RadioGroup>
									)}
								</form.Field>
							</CardContent>
						</Card>
					)}

					<form.Subscribe
						selector={(state) => [state.values.answerId, state.isSubmitting]}
					>
						{([answerId, isSubmitting]) => (
							<Button
								type="submit"
								className="w-full mt-4 dark:bg-blend-saturation cursor-pointer"
								disabled={!answerId || !!isSubmitting || isProcessing}
							>
								{isSubmitting || isProcessing
									? isLastQuestion
										? "Finalizing uploads…"
										: "Saving…"
									: isLastQuestion
										? "Finish"
										: "Next Question"}
							</Button>
						)}
					</form.Subscribe>
				</form>
				{uploadQueue.isUploading && (
					<p className="mt-2 text-center text-sm text-muted-foreground">
						Uploading previous answer…
					</p>
				)}
				{Object.keys(uploadQueue.failed).length > 0 && (
					<p className="mt-2 text-center text-sm text-destructive">
						Upload failed. Please retry submit.
					</p>
				)}
			</div>

			<CameraControlPanel
				videoDevices={videoDevices}
				deviceIdMain={deviceIdMain}
				setDeviceIdMain={setDeviceIdMain}
				deviceIdSec={deviceIdSec}
				videoRefMain={videoRefMain}
				videoRefSec={videoRefSec}
				realSenseRef={realSenseRef}
				isRecording={isRecording}
				onSecReady={() => setSecReady(true)}
				secondarySelect={false}
			/>
		</div>
	);
}
