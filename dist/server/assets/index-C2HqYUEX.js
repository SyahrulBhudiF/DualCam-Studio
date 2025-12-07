import { jsxs, jsx } from "react/jsx-runtime";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useLoaderData, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { d as submitQuestionnaire } from "./router-BmiHf_ZJ.js";
import { u as useCameraSetup, C as CameraControlPanel, R as RadioGroup, a as RadioGroupItem } from "./use-camera-setup-DF4u8nEf.js";
import { B as Button } from "./button-CmIj-cVl.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-BHTzFMfN.js";
import { L as Label } from "./label-Bk8qxaEw.js";
import { u as useUserStore } from "./UserStore-Bda0L9F1.js";
import "@tanstack/react-router-ssr-query";
import "@tanstack/react-router-devtools";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "./user-B3mpcRFy.js";
import "zod";
import "./supabase-0PR4I26a.js";
import "@supabase/ssr";
import "clsx";
import "tailwind-merge";
import "next-themes";
import "sonner";
import "@radix-ui/react-direction";
import "js-cookie";
import "node:fs";
import "node:path";
import "./questionnaire-DGzIDWUe.js";
import "zustand";
import "@radix-ui/react-radio-group";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "zustand/middleware";
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
function QuestionnairePage() {
  const { questionnaire, questions } = useLoaderData({
    from: "/questionnaire/"
  });
  const user = useUserStore().user;
  const navigate = useNavigate();
  const [currentFolderName, setCurrentFolderName] = useState("");
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
  const mutation = useMutation({
    mutationFn: submitQuestionnaire,
    onSuccess: () => navigate({ to: "/success" }),
    onError: (error) => {
      console.error(error);
      alert("Failed to submit.");
    }
  });
  const form = useForm({
    defaultValues: {
      answers: {}
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
          answers: value.answers
        }
      });
    }
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
    if (allReady && !isRecording && currentFolderName && !hasStartedRef.current) {
      const timer = setTimeout(() => {
        startRecording({ folderName: currentFolderName, mode: "FULL" });
        hasStartedRef.current = true;
      }, 1e3);
      return () => clearTimeout(timer);
    }
  }, [allReady, isRecording, startRecording, currentFolderName]);
  if (!allReady) {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4", children: [
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
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-primary p-4 pb-48", children: [
    /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto mb-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold dark:text-slate-50", children: questionnaire.title }),
      /* @__PURE__ */ jsxs("p", { className: "text-slate-600 dark:text-slate-400", children: [
        "Student:",
        " ",
        /* @__PURE__ */ jsx("span", { className: "font-semibold dark:text-slate-200", children: user?.name || "Guest" }),
        " ",
        "| Class:",
        " ",
        /* @__PURE__ */ jsx("span", { className: "font-semibold dark:text-slate-200", children: user?.class || "-" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "max-w-3xl mx-auto space-y-6", children: /* @__PURE__ */ jsxs(
      "form",
      {
        onSubmit: (e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        },
        children: [
          questions?.map((q, index) => /* @__PURE__ */ jsxs(Card, { className: "mb-6", children: [
            /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-lg", children: [
              index + 1,
              ". ",
              q.question_text
            ] }) }),
            /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(form.Field, { name: `answers.${q.id}`, children: (field) => /* @__PURE__ */ jsx(
              RadioGroup,
              {
                onValueChange: (val) => field.handleChange(val),
                value: field.state.value,
                children: q.answers.map((ans) => /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "flex items-center space-x-2 cursor-pointer",
                    children: [
                      /* @__PURE__ */ jsx(RadioGroupItem, { value: ans.id, id: ans.id }),
                      /* @__PURE__ */ jsx(Label, { htmlFor: ans.id, children: ans.answer_text })
                    ]
                  },
                  ans.id
                ))
              }
            ) }) })
          ] }, q.id)),
          /* @__PURE__ */ jsx(
            form.Subscribe,
            {
              selector: (state) => ({
                answers: state.values.answers,
                isSubmitting: state.isSubmitting
              }),
              children: ({ answers, isSubmitting }) => /* @__PURE__ */ jsx(
                Button,
                {
                  className: "w-full mt-8 dark:bg-blend-saturation cursor-pointer",
                  size: "lg",
                  type: "submit",
                  disabled: !questions || Object.keys(answers).length !== questions.length || isSubmitting || mutation.isPending,
                  children: isSubmitting || mutation.isPending ? "Finalizing..." : "Submit Answers"
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
const SplitComponent = QuestionnairePage;
export {
  SplitComponent as component
};
