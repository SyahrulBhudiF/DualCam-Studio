import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
	uploadVideoChunk,
	submitSegmentedResponse,
} from "@/apis/segmented-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUserStore } from "@/libs/store/UserStore";
import { useQuestionnaireStore } from "@/libs/store/QuestionnaireStore";
import { Loader2 } from "lucide-react";
import { useCameraSetup } from "@/libs/hooks/use-camera-setup";
import { CameraControlPanel } from "@/components/CameraControlPanel";
import { useLoaderData } from "@tanstack/react-router";

const blobToBase64 = (blob: Blob): Promise<string> => {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result as string);
		reader.readAsDataURL(blob);
	});
};

interface Answer {
	id: string;
	answer_text: string;
}

export function SegmentedPage() {
	const { questionnaire, questions } = useLoaderData({
		from: "/questionnaire/segmented/",
	});
	const user = useUserStore().user;
	const store = useQuestionnaireStore();
	const navigate = useNavigate();

	const [currentIndex, setCurrentIndex] = useState(0);
	const [isProcessing, setIsProcessing] = useState(false);

	const {
		videoDevices,
		deviceIdMain,
		setDeviceIdMain,
		deviceIdSec,
		setDeviceIdSec,
		videoRefMain,
		videoRefSec,
		realSenseRef,
		isRecording,
		allReady,
		setSecReady,
		startRecording,
		stopRecording,
	} = useCameraSetup();

	const uploadMutation = useMutation({
		mutationFn: uploadVideoChunk,
	});

	const submitMutation = useMutation({
		mutationFn: submitSegmentedResponse,
		onSuccess: () => {
			store.reset();
			navigate({ to: "/success" });
		},
	});

	const form = useForm({
		defaultValues: {
			answerId: "",
		},
		onSubmit: async ({ value }) => {
			setIsProcessing(true);
			const currentQ = questions[currentIndex];

			realSenseRef.current?.stopRecording();
			const { blobMain } = await stopRecording();

			const base64Main = blobMain.size > 0 ? await blobToBase64(blobMain) : "";

			const subFolder = `q${currentIndex + 1}`;
			const mainFileName = `/${subFolder}/answer_${currentIndex + 1}_${currentQ.id}_main.webm`;

			let uploadPath = "";
			if (base64Main) {
				const uploadRes = await uploadMutation.mutateAsync({
					data: {
						folderName: store.folderName,
						fileName: mainFileName,
						fileBase64: base64Main,
					},
				});
				uploadPath = uploadRes.path;
			}

			store.addAnswer(currentQ.id, {
				questionId: currentQ.id,
				answerId: value.answerId,
				videoMainPath: uploadPath,
				videoSecPath: `/video_uploads/${store.folderName}/${subFolder}/answer_${currentIndex + 1}_${currentQ.id}_sec.avi`,
			});

			form.reset();

			if (currentIndex < questions.length - 1) {
				setCurrentIndex((prev) => prev + 1);
				setIsProcessing(false);
			} else {
				const finalData = {
					userName: user?.name || "Anon",
					userClass: user?.class || "-",
					questionnaireId: questionnaire.id,
					folderName: store.folderName,
					answers: Object.values(useQuestionnaireStore.getState().answers),
				};
				await submitMutation.mutateAsync({ data: finalData });
			}
		},
	});

	useEffect(() => {
		if (user?.name && !store.folderName) {
			const safeName = user.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
			store.setFolderName(`segmented/${safeName}_${Date.now()}`);
		}
	}, [user, store.folderName, store.setFolderName]);

	useEffect(() => {
		if (!allReady || isProcessing || !questions) return;

		const timer = setTimeout(() => {
			const currentQ = questions[currentIndex];
			const subFolder = `q${currentIndex + 1}`;
			const secFileName = `${subFolder}/answer_${currentIndex + 1}_${currentQ.id}_sec.avi`;

			startRecording({
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

	if (!allReady) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
				<Loader2 className="w-10 h-10 animate-spin text-blue-600" />
				<div className="text-slate-600 font-medium">
					Initializing Cameras...
				</div>
				<div className="fixed opacity-0 pointer-events-none">
					<CameraControlPanel
						videoDevices={videoDevices}
						deviceIdMain={deviceIdMain}
						setDeviceIdMain={setDeviceIdMain}
						deviceIdSec={deviceIdSec}
						setDeviceIdSec={setDeviceIdSec}
						videoRefMain={videoRefMain}
						videoRefSec={videoRefSec}
						realSenseRef={realSenseRef}
						isRecording={false}
						onSecReady={() => setSecReady(true)}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50 p-4 pb-48">
			<div className="max-w-3xl mx-auto mb-6">
				<h1 className="text-2xl font-bold">
					Question {currentIndex + 1} / {questions?.length}
				</h1>
			</div>

			<div className="max-w-3xl mx-auto mb-8">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
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
													className="flex items-center space-x-2 mb-2"
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
								className="w-full mt-4"
								disabled={!answerId || !!isSubmitting || isProcessing}
							>
								{isSubmitting || isProcessing
									? "Saving & Uploading..."
									: currentIndex === questions.length - 1
										? "Finish"
										: "Next Question"}
							</Button>
						)}
					</form.Subscribe>
				</form>
			</div>

			<CameraControlPanel
				videoDevices={videoDevices}
				deviceIdMain={deviceIdMain}
				setDeviceIdMain={setDeviceIdMain}
				deviceIdSec={deviceIdSec}
				setDeviceIdSec={setDeviceIdSec}
				videoRefMain={videoRefMain}
				videoRefSec={videoRefSec}
				realSenseRef={realSenseRef}
				isRecording={isRecording}
				onSecReady={() => setSecReady(true)}
			/>
		</div>
	);
}
