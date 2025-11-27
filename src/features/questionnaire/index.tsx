import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useLoaderData, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { submitQuestionnaire } from "@/apis/questionnaire";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUserStore } from "@/libs/store/UserStore";
import { RealSenseCanvas, RealSenseHandle } from "@/components/RealSenseCanvas";

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const stopRecorderSafe = (recorder: MediaRecorder | null): Promise<void> => {
  return new Promise((resolve) => {
    if (!recorder || recorder.state === "inactive") {
      resolve();
      return;
    }
    recorder.onstop = () => resolve();
    recorder.stop();
  });
};

export function QuestionnairePage() {
  const { questionnaire, questions } = useLoaderData({
    from: "/questionnaire/",
  });
  const user = useUserStore().user;
  const navigate = useNavigate();

  const [isRecording, setIsRecording] = useState(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceIdMain, setDeviceIdMain] = useState<string>("");
  const [deviceIdSec, setDeviceIdSec] = useState<string>("ws-realsense");
  const [currentFolderName, setCurrentFolderName] = useState<string>("");

  const videoRefMain = useRef<HTMLVideoElement>(null);
  const mediaRecorderRefMain = useRef<MediaRecorder | null>(null);
  const videoChunksRefMain = useRef<Blob[]>([]);
  const streamRefMain = useRef<MediaStream | null>(null);

  const realSenseRef = useRef<RealSenseHandle>(null);
  const videoRefSec = useRef<HTMLVideoElement>(null);
  const mediaRecorderRefSec = useRef<MediaRecorder | null>(null);
  const videoChunksRefSec = useRef<Blob[]>([]);
  const streamRefSec = useRef<MediaStream | null>(null);

  const mutation = useMutation({
    mutationFn: submitQuestionnaire,
    onSuccess: () => navigate({ to: "/success" }),
    onError: (error) => {
      console.error(error);
      alert("Failed to submit.");
    },
  });

  const startAllRecording = () => {
    if (!user?.name) return;

    const timestamp = Date.now();
    const safeName = user.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const folderName = `${safeName}_${timestamp}`;
    setCurrentFolderName(folderName);

    if (
      mediaRecorderRefMain.current &&
      mediaRecorderRefMain.current.state === "inactive"
    ) {
      videoChunksRefMain.current = [];
      mediaRecorderRefMain.current.start(1000);
    }

    if (deviceIdSec === "ws-realsense") {
      realSenseRef.current?.startRecording(folderName);
    } else if (
      mediaRecorderRefSec.current &&
      mediaRecorderRefSec.current.state === "inactive"
    ) {
      videoChunksRefSec.current = [];
      mediaRecorderRefSec.current.start(1000);
    }

    setIsRecording(true);
  };

  const stopAllRecording = async () => {
    await stopRecorderSafe(mediaRecorderRefMain.current);

    if (deviceIdSec === "ws-realsense") {
      realSenseRef.current?.stopRecording();
    } else {
      await stopRecorderSafe(mediaRecorderRefSec.current);
    }

    setIsRecording(false);
  };

  const form = useForm({
    defaultValues: {
      answers: {} as Record<string, string>,
    },
    onSubmit: async ({ value }) => {
      if (!user?.name || !user?.class) {
        alert("User profile missing");
        return;
      }

      await stopAllRecording();
      await new Promise((r) => setTimeout(r, 1500));

      let base64Main = "";
      if (videoChunksRefMain.current.length > 0) {
        const videoBlobMain = new Blob(videoChunksRefMain.current, {
          type: "video/webm",
        });
        base64Main = await blobToBase64(videoBlobMain);
      }

      let base64Sec = "";
      if (
        deviceIdSec !== "ws-realsense" &&
        videoChunksRefSec.current.length > 0
      ) {
        const videoBlobSec = new Blob(videoChunksRefSec.current, {
          type: "video/webm",
        });
        base64Sec = await blobToBase64(videoBlobSec);
      } else if (deviceIdSec === "ws-realsense") {
        base64Sec = "SAVED_ON_SERVER";
      }

      await mutation.mutateAsync({
        data: {
          userName: user.name,
          userClass: user.class,
          questionnaireId: questionnaire.id,
          videoBase64Main: base64Main,
          videoBase64Secondary: base64Sec || " ",
          folderName: currentFolderName,
          answers: value.answers,
        },
      });
    },
  });

  useEffect(() => {
    if (deviceIdMain && !isRecording) {
      const timer = setTimeout(() => {
        startAllRecording();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [deviceIdMain, deviceIdSec]);

  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((d) => d.kind === "videoinput");
        setVideoDevices(cameras);
        if (cameras.length > 0) setDeviceIdMain(cameras[0].deviceId);
      } catch (err) {
        console.error(err);
      }
    };
    getDevices();
  }, []);

  useEffect(() => {
    if (!deviceIdMain) return;
    const startMain = async () => {
      if (streamRefMain.current)
        streamRefMain.current.getTracks().forEach((t) => t.stop());
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: deviceIdMain },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: true,
        });
        streamRefMain.current = stream;
        if (videoRefMain.current) videoRefMain.current.srcObject = stream;

        const mediaRecorder = new MediaRecorder(stream);
        videoChunksRefMain.current = [];
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) videoChunksRefMain.current.push(event.data);
        };
        mediaRecorderRefMain.current = mediaRecorder;
      } catch (err) {
        console.error(err);
      }
    };
    startMain();
    return () => streamRefMain.current?.getTracks().forEach((t) => t.stop());
  }, [deviceIdMain]);

  useEffect(() => {
    if (deviceIdSec === "ws-realsense") return;

    if (!deviceIdSec) {
      if (streamRefSec.current)
        streamRefSec.current.getTracks().forEach((t) => t.stop());
      return;
    }

    const startSec = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: deviceIdSec },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
        streamRefSec.current = stream;
        if (videoRefSec.current) videoRefSec.current.srcObject = stream;

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm",
        });
        videoChunksRefSec.current = [];
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) videoChunksRefSec.current.push(event.data);
        };
        mediaRecorderRefSec.current = mediaRecorder;
      } catch (err) {
        console.error(err);
      }
    };
    startSec();
    return () => streamRefSec.current?.getTracks().forEach((t) => t.stop());
  }, [deviceIdSec]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-48">
      <div className="max-w-3xl mx-auto mb-6">
        <h1 className="text-2xl font-bold dark:text-slate-50">
          {questionnaire.title}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Student:{" "}
          <span className="font-semibold dark:text-slate-200">
            {user?.name || "Guest"}
          </span>{" "}
          | Class:{" "}
          <span className="font-semibold dark:text-slate-200">
            {user?.class || "-"}
          </span>
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          {questions?.map((q, index) => (
            <Card
              key={q.id}
              className="mb-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            >
              <CardHeader>
                <CardTitle className="text-lg dark:text-slate-100">
                  {index + 1}. {q.question_text}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form.Field name={`answers.${q.id}`}>
                  {(field) => (
                    <RadioGroup
                      onValueChange={(val) => field.handleChange(val)}
                      value={field.state.value}
                    >
                      {q.answers.map((ans) => (
                        <div
                          key={ans.id}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={ans.id}
                            id={ans.id}
                            className="dark:border-slate-400 dark:text-slate-200"
                          />
                          <Label
                            htmlFor={ans.id}
                            className="dark:text-slate-300"
                          >
                            {ans.answer_text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </form.Field>
              </CardContent>
            </Card>
          ))}

          <form.Subscribe
            selector={(state) => ({
              answers: state.values.answers,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ answers, isSubmitting }) => (
              <Button
                className="w-full mt-8 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                size="lg"
                type="submit"
                disabled={
                  !questions ||
                  Object.keys(answers).length !== questions.length ||
                  isSubmitting ||
                  mutation.isPending
                }
              >
                {isSubmitting || mutation.isPending
                  ? "Finalizing..."
                  : "Submit Answers"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </div>

      <div className="fixed bottom-4 right-4 flex flex-row gap-4 z-50 items-end">
        <div className="flex flex-col gap-2">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded shadow text-[10px] font-bold text-center border border-slate-200 dark:border-slate-800 dark:text-slate-200">
            Main Cam (Audio ON)
          </div>
          <select
            className="w-48 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded p-1 shadow-sm dark:text-slate-200"
            value={deviceIdMain}
            onChange={(e) => setDeviceIdMain(e.target.value)}
          >
            {videoDevices.map((d, idx) => (
              <option key={`main-${d.deviceId}-${idx}`} value={d.deviceId}>
                {d.label || `Cam ${d.deviceId.substring(0, 5)}...`}
              </option>
            ))}
          </select>
          <div className="w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-slate-300 dark:border-slate-700 shadow-xl">
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
          <div className="bg-blue-100/90 dark:bg-blue-950/90 backdrop-blur px-2 py-1 rounded shadow text-[10px] font-bold text-center text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            Secondary / D415
          </div>
          <select
            className="w-48 text-xs bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-900 rounded p-1 shadow-sm dark:text-slate-200"
            value={deviceIdSec}
            onChange={(e) => setDeviceIdSec(e.target.value)}
          >
            <option value="">-- Turn Off --</option>
            <option value="ws-realsense" className="font-bold text-blue-600">
              ⚡ RealSense (Lossless Rec)
            </option>
            {videoDevices.map((d, idx) => (
              <option key={`sec-${d.deviceId}-${idx}`} value={d.deviceId}>
                {idx + 1}. {d.label || `Cam ${d.deviceId.substring(0, 5)}...`}
              </option>
            ))}
          </select>
          <div className="w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-blue-500 shadow-xl relative group">
            {deviceIdSec === "ws-realsense" ? (
              <RealSenseCanvas ref={realSenseRef} />
            ) : (
              <video
                ref={videoRefSec}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            )}
            <div
              className={`absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full transition-opacity ${isRecording ? "opacity-100 animate-pulse" : "opacity-0"}`}
            >
              REC
            </div>
            {!deviceIdSec && (
              <div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs">
                No Signal
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
