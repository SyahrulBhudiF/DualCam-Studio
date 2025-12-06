import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useLoaderData, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { submitQuestionnaire } from "@/apis/questionnaire";
import { CameraControlPanel } from "@/components/CameraControlPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCameraSetup } from "@/libs/hooks/use-camera-setup";
import { useUserStore } from "@/libs/store/UserStore";

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export function QuestionnairePage() {
  const { questionnaire, questions } = useLoaderData({
    from: "/questionnaire/",
  });
  const user = useUserStore().user;
  const navigate = useNavigate();

  const [currentFolderName, setCurrentFolderName] = useState<string>("");

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

  const mutation = useMutation({
    mutationFn: submitQuestionnaire,
    onSuccess: () => navigate({ to: "/success" }),
    onError: (error) => {
      console.error(error);
      alert("Failed to submit.");
    },
  });

  const form = useForm({
    defaultValues: {
      answers: {} as Record<string, string>,
    },
    onSubmit: async ({ value }) => {
      if (!user?.name || !user?.class) {
        alert("User profile missing");
        return;
      }

      const { blobMain, blobSec } = await stopRecording();

      await new Promise((r) => setTimeout(r, 1500));

      let base64Main = "";
      if (blobMain.size > 0) {
        base64Main = await blobToBase64(blobMain);
      }

      let base64Sec = "";

      if (deviceIdSec !== "ws-realsense" && blobSec && blobSec.size > 0) {
        base64Sec = await blobToBase64(blobSec);
      } else if (deviceIdSec === "ws-realsense") {
        base64Sec = "SAVED_ON_SERVER";
      }

      await mutation.mutateAsync({
        data: {
          userEmail: user.email || "",
          userName: user.name,
          userClass: user.class,
          userSemester: user.semester || "",
          userGender: user.gender || "",
          userAge: user.age || 0,
          userNim: user.nim || "",
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
    if (user?.name && !currentFolderName) {
      const timestamp = Date.now();
      const safeName = user.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();

      setCurrentFolderName(`full/${safeName}_${timestamp}`);
    }
  }, [user?.name, currentFolderName]);

  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (
      allReady &&
      !isRecording &&
      currentFolderName &&
      !hasStartedRef.current
    ) {
      const timer = setTimeout(() => {
        startRecording({ folderName: currentFolderName, mode: "FULL" });
        hasStartedRef.current = true;
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [allReady, isRecording, startRecording, currentFolderName]);

  if (!allReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 animate-spin" />
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
    <div className="min-h-screen bg-primary p-4 pb-48">
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
            <Card key={q.id} className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
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
                          className="flex items-center space-x-2 cursor-pointer"
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
          ))}

          <form.Subscribe
            selector={(state) => ({
              answers: state.values.answers,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ answers, isSubmitting }) => (
              <Button
                className="w-full mt-8 dark:bg-blend-saturation cursor-pointer"
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
