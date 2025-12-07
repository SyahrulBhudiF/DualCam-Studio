import { jsxs, jsx } from "react/jsx-runtime";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useLoaderData, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { e as createSsrRpc, c as useQuestionnaireStore } from "./router-BmiHf_ZJ.js";
import fs from "node:fs";
import path from "node:path";
import { g as uploadChunkSchema, h as finalSubmitSchema } from "./questionnaire-DGzIDWUe.js";
import { g as getSupabaseServerClient } from "./supabase-0PR4I26a.js";
import { c as createServerFn } from "../server.js";
import { u as useCameraSetup, C as CameraControlPanel, R as RadioGroup, a as RadioGroupItem } from "./use-camera-setup-DF4u8nEf.js";
import { B as Button } from "./button-CmIj-cVl.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-BHTzFMfN.js";
import { L as Label } from "./label-Bk8qxaEw.js";
import { u as useUserStore } from "./UserStore-Bda0L9F1.js";
import "@tanstack/react-router-ssr-query";
import "@tanstack/react-router-devtools";
import "./user-B3mpcRFy.js";
import "zod";
import "next-themes";
import "sonner";
import "@radix-ui/react-direction";
import "js-cookie";
import "zustand";
import "@supabase/ssr";
import "clsx";
import "tailwind-merge";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "@radix-ui/react-radio-group";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "zustand/middleware";
const uploadVideoChunk_createServerFn_handler = createSsrRpc("3e8463c2903c7b1d998228770fd196c4f38b030596578bf6a4a4fe5d9dc87c44");
const uploadVideoChunk = createServerFn({
  method: "POST"
}).inputValidator((data) => uploadChunkSchema.parse(data)).handler(uploadVideoChunk_createServerFn_handler, async ({
  data
}) => {
  const uploadRoot = path.join(process.cwd(), "video_uploads");
  const userFolder = path.join(uploadRoot, data.folderName);
  if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot);
  if (!fs.existsSync(userFolder)) fs.mkdirSync(userFolder);
  const filePath = path.join(userFolder, data.fileName);
  const fileDir = path.dirname(filePath);
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, {
      recursive: true
    });
  }
  const buffer = Buffer.from(data.fileBase64.split(",")[1], "base64");
  try {
    fs.writeFileSync(filePath, buffer);
    return {
      success: true,
      path: `/video_uploads/${data.folderName}/${data.fileName}`
    };
  } catch (e) {
    throw new Error(`Failed to save chunk: ${e instanceof Error ? e.message : String(e)}`);
  }
});
const submitSegmentedResponse_createServerFn_handler = createSsrRpc("6e10dc167003492fe41b5184f0702cab32b56085f4fe3d4ec79d1a719175f784");
const submitSegmentedResponse = createServerFn({
  method: "POST"
}).inputValidator((data) => finalSubmitSchema.parse(data)).handler(submitSegmentedResponse_createServerFn_handler, async ({
  data
}) => {
  const supabase = getSupabaseServerClient();
  const {
    data: existing,
    error: checkErr
  } = await supabase.from("profiles").select("id").eq("email", data.userEmail).maybeSingle();
  if (checkErr) throw new Error(checkErr.message);
  let profileId = existing?.id;
  if (!profileId) {
    const {
      data: created,
      error: createErr
    } = await supabase.from("profiles").insert({
      name: data.userName,
      class: data.userClass,
      semester: data.userSemester,
      nim: data.userNim,
      gender: data.userGender,
      age: data.userAge,
      email: data.userEmail
    }).select("id").single();
    if (createErr) throw new Error(createErr.message);
    profileId = created.id;
  }
  const answerIds = data.answers.map((a) => a.answerId);
  const {
    data: dbAnswers
  } = await supabase.from("answers").select("id, score").in("id", answerIds);
  const totalScore = dbAnswers?.reduce((acc, curr) => acc + curr.score, 0) || 0;
  const {
    data: response,
    error: respError
  } = await supabase.from("responses").insert({
    user_id: profileId,
    questionnaire_id: data.questionnaireId,
    video_path: data.folderName,
    total_score: totalScore
  }).select("id").single();
  if (respError) throw new Error(respError.message);
  const details = data.answers.map((ans) => {
    const score = dbAnswers?.find((d) => d.id === ans.answerId)?.score || 0;
    const videoJson = JSON.stringify({
      main: ans.videoMainPath,
      secondary: ans.videoSecPath
    });
    return {
      response_id: response.id,
      question_id: ans.questionId,
      answer_id: ans.answerId,
      score,
      video_segment_path: videoJson
    };
  });
  await supabase.from("response_details").insert(details);
  return {
    success: true,
    responseId: response.id
  };
});
const blobToBase64 = (blob) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};
function SegmentedPage() {
  const { questionnaire, questions } = useLoaderData({
    from: "/questionnaire/segmented/"
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
    stopRecording
  } = useCameraSetup();
  const uploadMutation = useMutation({
    mutationFn: uploadVideoChunk
  });
  const submitMutation = useMutation({
    mutationFn: submitSegmentedResponse,
    onSuccess: () => {
      store.reset();
      navigate({ to: "/success" });
    }
  });
  const form = useForm({
    defaultValues: {
      answerId: ""
    },
    onSubmit: async ({ value }) => {
      setIsProcessing(true);
      const currentQ2 = questions[currentIndex];
      realSenseRef.current?.stopRecording();
      const { blobMain } = await stopRecording();
      const base64Main = blobMain.size > 0 ? await blobToBase64(blobMain) : "";
      const subFolder = `q${currentIndex + 1}`;
      const mainFileName = `/${subFolder}/${user?.name ?? "Anon"}_${currentIndex + 1}_${currentQ2.id}_main.webm`;
      let uploadPath = "";
      if (base64Main) {
        const uploadRes = await uploadMutation.mutateAsync({
          data: {
            folderName: store.folderName,
            fileName: mainFileName,
            fileBase64: base64Main
          }
        });
        uploadPath = uploadRes.path;
      }
      store.addAnswer(currentQ2.id, {
        questionId: currentQ2.id,
        answerId: value.answerId,
        videoMainPath: uploadPath,
        videoSecPath: `/video_uploads/${store.folderName}/${subFolder}/${user?.name ?? "Anon"}_${currentIndex + 1}_${currentQ2.id}_sec.avi`
      });
      form.reset();
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsProcessing(false);
      } else {
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
          answers: Object.values(useQuestionnaireStore.getState().answers)
        };
        await submitMutation.mutateAsync({ data: finalData });
      }
    }
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
      const currentQ2 = questions[currentIndex];
      const subFolder = `q${currentIndex + 1}`;
      const secFileName = `${subFolder}/answer_${currentIndex + 1}_${currentQ2.id}_sec.avi`;
      startRecording({
        mode: "SEGMENT",
        folderName: store.folderName,
        fileName: secFileName
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [
    currentIndex,
    allReady,
    isProcessing,
    questions,
    store.folderName,
    startRecording
  ]);
  const currentQ = questions?.[currentIndex];
  if (!allReady) {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center bg-muted/40 gap-4", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "w-10 h-10 animate-spin" }),
      /* @__PURE__ */ jsx("div", { className: "text-slate-600 font-medium", children: "Initializing Cameras..." }),
      /* @__PURE__ */ jsx("div", { className: "fixed opacity-0 pointer-events-none", children: /* @__PURE__ */ jsx(
        CameraControlPanel,
        {
          videoDevices,
          deviceIdMain,
          setDeviceIdMain,
          deviceIdSec,
          setDeviceIdSec,
          videoRefMain,
          videoRefSec,
          realSenseRef,
          isRecording: false,
          onSecReady: () => setSecReady(true)
        }
      ) })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-muted/40 p-4 pb-48", children: [
    /* @__PURE__ */ jsx("div", { className: "max-w-3xl mx-auto mb-6", children: /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold", children: [
      "Question ",
      currentIndex + 1,
      " / ",
      questions?.length
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "max-w-3xl mx-auto mb-8", children: /* @__PURE__ */ jsxs(
      "form",
      {
        onSubmit: (e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        },
        children: [
          currentQ && /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: currentQ.question_text }) }),
            /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(form.Field, { name: "answerId", children: (field) => /* @__PURE__ */ jsx(
              RadioGroup,
              {
                value: field.state.value,
                onValueChange: (val) => field.handleChange(val),
                children: currentQ.answers.map((ans) => /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "flex items-center space-x-2 mb-2 cursor-pointer",
                    children: [
                      /* @__PURE__ */ jsx(RadioGroupItem, { value: ans.id, id: ans.id }),
                      /* @__PURE__ */ jsx(Label, { htmlFor: ans.id, children: ans.answer_text })
                    ]
                  },
                  ans.id
                ))
              }
            ) }) })
          ] }),
          /* @__PURE__ */ jsx(
            form.Subscribe,
            {
              selector: (state) => [state.values.answerId, state.isSubmitting],
              children: ([answerId, isSubmitting]) => /* @__PURE__ */ jsx(
                Button,
                {
                  type: "submit",
                  className: "w-full mt-4 dark:bg-blend-saturation cursor-pointer",
                  disabled: !answerId || !!isSubmitting || isProcessing,
                  children: isSubmitting || isProcessing ? "Saving & Uploading..." : currentIndex === questions.length - 1 ? "Finish" : "Next Question"
                }
              )
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(
      CameraControlPanel,
      {
        videoDevices,
        deviceIdMain,
        setDeviceIdMain,
        deviceIdSec,
        setDeviceIdSec,
        videoRefMain,
        videoRefSec,
        realSenseRef,
        isRecording,
        onSecReady: () => setSecReady(true)
      }
    )
  ] });
}
const SplitComponent = SegmentedPage;
export {
  SplitComponent as component
};
