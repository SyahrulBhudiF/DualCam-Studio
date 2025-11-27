import { useEffect, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
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
import { RealSenseCanvas, RealSenseHandle } from "@/components/RealSenseCanvas";
import { Loader2 } from "lucide-react";
import { useLoaderData } from "@tanstack/react-router";

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

const stopRecorderSafe = (recorder: MediaRecorder | null): Promise<void> => {
  return new Promise((resolve) => {
    if (!recorder || recorder.state === "inactive") {
      resolve();
    } else {
      recorder.onstop = () => resolve();
      recorder.stop();
    }
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
  const {
    folderName,
    setFolderName,
    addAnswer,
    reset,
    answers: storeAnswers,
  } = useQuestionnaireStore();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [mainReady, setMainReady] = useState(false);
  const [secReady, setSecReady] = useState(false);

  const videoRefMain = useRef<HTMLVideoElement>(null);
  const mediaRecorderMain = useRef<MediaRecorder | null>(null);
  const chunksMain = useRef<Blob[]>([]);
  const realSenseRef = useRef<RealSenseHandle>(null);

  const uploadMutation = useMutation({
    mutationFn: uploadVideoChunk,
  });

  const submitMutation = useMutation({
    mutationFn: submitSegmentedResponse,
    onSuccess: () => {
      reset();
      navigate({ to: "/success" });
    },
  });

  const handleSubmitFinal = async () => {
    const finalData = {
      userName: user?.name || "Anon",
      userClass: user?.class || "-",
      questionnaireId: questionnaire.id,
      folderName: folderName,
      answers: Object.values(useQuestionnaireStore.getState().answers),
    };

    await submitMutation.mutateAsync({ data: finalData });
  };

  const form = useForm({
    defaultValues: {
      answerId: "",
    },
    onSubmit: async ({ value }) => {
      setIsProcessing(true);
      const currentQ = questions[currentIndex];

      realSenseRef.current?.stopRecording();
      await stopRecorderSafe(mediaRecorderMain.current);

      const blob = new Blob(chunksMain.current, { type: "video/webm" });
      const base64Main =
        chunksMain.current.length > 0 ? await blobToBase64(blob) : "";

      const subFolder = `q${currentIndex + 1}`;
      const mainFileName = `${subFolder}/answer_${currentIndex + 1}_${currentQ.id}_main.webm`;

      let uploadPath = "";
      if (base64Main) {
        const uploadRes = await uploadMutation.mutateAsync({
          data: {
            folderName: folderName,
            fileName: mainFileName,
            fileBase64: base64Main,
          },
        });
        uploadPath = uploadRes.path;
      }

      addAnswer(currentQ.id, {
        questionId: currentQ.id,
        answerId: value.answerId,
        videoMainPath: uploadPath,
        videoSecPath: `/video_uploads/${folderName}/${subFolder}/answer_${currentIndex + 1}_${currentQ.id}_sec.avi`,
      });

      form.reset();

      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsProcessing(false);
      } else {
        await handleSubmitFinal();
      }
    },
  });

  useEffect(() => {
    if (user?.name && !folderName) {
      const safeName = user.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      setFolderName(`${safeName}_${Date.now()}`);
    }
  }, [user, folderName]);

  useEffect(() => {
    const initMainCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: true,
        });

        if (videoRefMain.current) {
          videoRefMain.current.srcObject = stream;
        }

        const rec = new MediaRecorder(stream);
        rec.ondataavailable = (e) => {
          if (e.data.size > 0) chunksMain.current.push(e.data);
        };
        mediaRecorderMain.current = rec;

        setMainReady(true);
      } catch (e) {
        console.error(e);
      }
    };
    initMainCam();
  }, []);

  const allSystemsReady = mainReady && secReady && !!folderName;

  useEffect(() => {
    if (!allSystemsReady || isProcessing || !questions) return;

    const currentQ = questions[currentIndex];

    if (mediaRecorderMain.current?.state === "inactive") {
      chunksMain.current = [];
      mediaRecorderMain.current.start(1000);
    }

    const subFolder = `q${currentIndex + 1}`;
    const secFileName = `${subFolder}/answer_${currentIndex + 1}_${currentQ.id}_sec.avi`;

    realSenseRef.current?.startRecording({
      mode: "SEGMENT",
      folderName: folderName,
      fileName: secFileName,
    });
  }, [currentIndex, allSystemsReady, isProcessing, questions, folderName]);

  const currentQ = questions?.[currentIndex];

  if (!allSystemsReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <div className="text-slate-600 font-medium">
          Initializing Cameras & Server...
        </div>

        <div className="fixed bottom-4 right-4 flex flex-row gap-4 opacity-0 pointer-events-none">
          <video ref={videoRefMain} autoPlay muted />
          <RealSenseCanvas
            ref={realSenseRef}
            onReady={() => setSecReady(true)}
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

      <div className="fixed bottom-4 right-4 flex flex-row gap-4 z-50">
        <div className="flex flex-col gap-2">
          <div className="bg-white/90 px-2 rounded text-xs font-bold text-center">
            Main Cam
          </div>
          <div className="w-48 h-36 bg-black rounded overflow-hidden border-2">
            <video
              ref={videoRefMain}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="bg-blue-100 px-2 rounded text-xs font-bold text-center text-blue-700">
            RealSense (Auto)
          </div>
          <div className="w-48 h-36 bg-black rounded overflow-hidden border-2 border-blue-500 relative">
            <RealSenseCanvas
              ref={realSenseRef}
              onReady={() => setSecReady(true)}
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-[10px] rounded animate-pulse">
              REC
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
