import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { User, Mail, Hash, GraduationCap, Calendar, Users, Pause, Play, VolumeX, Volume2, Maximize, CheckCircle, Video, ArrowLeft } from "lucide-react";
import { M as Main } from "./main-CFzJm1Bk.js";
import { B as Button } from "./button-CmIj-cVl.js";
import { format } from "date-fns";
import { B as Badge } from "./badge-CiJstU-m.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from "./card-BHTzFMfN.js";
import { useRef, useState } from "react";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-a33jwLhQ.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell, f as Tabs, g as TabsList, h as TabsTrigger, i as TabsContent } from "./tabs-S5ZPqgFb.js";
import { a as ExportResponseDetailButton } from "./calendar-D2J7gS5B.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-WKwWO3Fr.js";
import "sonner";
import { r as Route } from "./router-BmiHf_ZJ.js";
import "clsx";
import "./supabase-0PR4I26a.js";
import "@supabase/ssr";
import "tailwind-merge";
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
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-dialog";
import "@radix-ui/react-tabs";
import "xlsx";
import "./dropdown-menu-DNyQp_hH.js";
import "@radix-ui/react-dropdown-menu";
import "react-day-picker";
import "@radix-ui/react-select";
import "@tanstack/react-query";
import "@tanstack/react-router-ssr-query";
import "@tanstack/react-router-devtools";
import "./user-B3mpcRFy.js";
import "zod";
import "next-themes";
import "@radix-ui/react-direction";
import "js-cookie";
import "node:fs";
import "node:path";
import "./questionnaire-DGzIDWUe.js";
import "zustand";
function ProfileCard({
  profile,
  createdAt,
  questionnaireTitle
}) {
  if (!profile) {
    return /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Respondent Profile" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Profile information not available" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-32 text-muted-foreground", children: "No profile data" }) })
    ] });
  }
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(User, { className: "h-5 w-5" }),
          profile.name ?? "Unknown"
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Respondent Profile" })
      ] }),
      /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs", children: format(new Date(createdAt), "dd MMM yyyy HH:mm") })
    ] }) }),
    /* @__PURE__ */ jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: [
        profile.email && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Mail, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Email" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: profile.email })
          ] })
        ] }),
        profile.nim && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Hash, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "NIM" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: profile.nim })
          ] })
        ] }),
        profile.class && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(GraduationCap, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Class" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: profile.class })
          ] })
        ] }),
        profile.semester && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Semester" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: profile.semester })
          ] })
        ] }),
        profile.gender && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Users, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Gender" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: profile.gender })
          ] })
        ] }),
        profile.age && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Age" }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm font-medium", children: [
              profile.age,
              " years"
            ] })
          ] })
        ] })
      ] }),
      questionnaireTitle && /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mb-1", children: "Questionnaire" }),
        /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: questionnaireTitle })
      ] })
    ] })
  ] });
}
function SingleVideoPlayer({ src, title }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };
  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx("div", { className: "relative rounded-lg overflow-hidden bg-black aspect-video", children: /* @__PURE__ */ jsx(
      "video",
      {
        ref: videoRef,
        src: src || void 0,
        className: "w-full h-full object-contain",
        onPlay: () => setIsPlaying(true),
        onPause: () => setIsPlaying(false),
        onEnded: () => setIsPlaying(false)
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: handlePlayPause,
          className: "cursor-pointer",
          children: isPlaying ? /* @__PURE__ */ jsx(Pause, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Play, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: handleMuteToggle,
          className: "cursor-pointer",
          children: isMuted ? /* @__PURE__ */ jsx(VolumeX, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Volume2, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: handleFullscreen,
          className: "cursor-pointer",
          children: /* @__PURE__ */ jsx(Maximize, { className: "h-4 w-4" })
        }
      )
    ] })
  ] });
}
function ResponseAnswers({
  details,
  totalScore,
  videoData
}) {
  const [selectedQuestionId, setSelectedQuestionId] = useState(
    null
  );
  const sortedDetails = [...details].sort(
    (a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0)
  );
  const maxPossibleScore = details.reduce(
    (acc, d) => acc + (d.maxScore ?? 0),
    0
  );
  const isSegmented = videoData?.mode === "segmented";
  const getVideoForQuestion = (questionId) => {
    if (!isSegmented || !videoData?.segmentedVideos) return null;
    return videoData.segmentedVideos.find((v) => v.questionId === questionId);
  };
  const selectedVideo = selectedQuestionId ? getVideoForQuestion(selectedQuestionId) : null;
  const selectedDetail = selectedQuestionId ? details.find((d) => d.questionId === selectedQuestionId) : null;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Response Answers" }),
          /* @__PURE__ */ jsxs(CardDescription, { children: [
            "All answers submitted for this questionnaire",
            isSegmented && " (with video per question)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: totalScore }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
            "Total Score ",
            maxPossibleScore > 0 && `/ ${maxPossibleScore}`
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: details.length === 0 ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-32 text-muted-foreground", children: "No answer details available" }) : /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { className: "w-[60px]", children: "#" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Question" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Answer" }),
          /* @__PURE__ */ jsx(TableHead, { className: "w-[100px] text-right", children: "Score" }),
          isSegmented && /* @__PURE__ */ jsx(TableHead, { className: "w-[80px] text-center", children: "Video" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: sortedDetails.map((detail, index) => {
          const hasVideo = isSegmented && getVideoForQuestion(detail.questionId);
          return /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: detail.orderNumber ?? index + 1 }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("div", { className: "max-w-md", children: detail.questionText ?? "-" }) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 text-green-500 flex-shrink-0" }),
              /* @__PURE__ */ jsx("span", { children: detail.answerText ?? "-" })
            ] }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsx(
              Badge,
              {
                variant: detail.score > 0 ? "default" : "secondary",
                children: detail.score
              }
            ) }),
            isSegmented && /* @__PURE__ */ jsx(TableCell, { className: "text-center", children: hasVideo ? /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "sm",
                className: "cursor-pointer",
                onClick: () => setSelectedQuestionId(detail.questionId),
                children: /* @__PURE__ */ jsx(Video, { className: "h-4 w-4" })
              }
            ) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs", children: "-" }) })
          ] }, detail.id);
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(
      Dialog,
      {
        open: !!selectedQuestionId,
        onOpenChange: (open) => !open && setSelectedQuestionId(null),
        children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-4xl", children: [
          /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs(DialogTitle, { children: [
            "Question ",
            selectedDetail?.orderNumber ?? "",
            " Video"
          ] }) }),
          selectedDetail && /* @__PURE__ */ jsxs("div", { className: "p-3 bg-muted rounded-lg mb-4", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: selectedDetail.questionText }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
              "Answer: ",
              selectedDetail.answerText,
              " (Score:",
              " ",
              selectedDetail.score,
              ")"
            ] })
          ] }),
          selectedVideo && /* @__PURE__ */ jsxs(Tabs, { defaultValue: "main", children: [
            /* @__PURE__ */ jsxs(TabsList, { className: "mb-4", children: [
              /* @__PURE__ */ jsx(TabsTrigger, { value: "main", children: "Main Camera" }),
              /* @__PURE__ */ jsx(TabsTrigger, { value: "secondary", children: "Secondary Camera" }),
              /* @__PURE__ */ jsx(TabsTrigger, { value: "side-by-side", children: "Side by Side" })
            ] }),
            /* @__PURE__ */ jsx(TabsContent, { value: "main", children: selectedVideo.main ? /* @__PURE__ */ jsx(
              SingleVideoPlayer,
              {
                src: selectedVideo.main,
                title: "Main Camera"
              }
            ) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-48 bg-muted rounded-lg", children: /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Main video not available" }) }) }),
            /* @__PURE__ */ jsx(TabsContent, { value: "secondary", children: selectedVideo.secondary ? /* @__PURE__ */ jsx(
              SingleVideoPlayer,
              {
                src: selectedVideo.secondary,
                title: "Secondary Camera"
              }
            ) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-48 bg-muted rounded-lg", children: /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Secondary video not available" }) }) }),
            /* @__PURE__ */ jsx(TabsContent, { value: "side-by-side", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium mb-2", children: "Main Camera" }),
                selectedVideo.main ? /* @__PURE__ */ jsx(
                  SingleVideoPlayer,
                  {
                    src: selectedVideo.main,
                    title: "Main Side"
                  }
                ) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-32 bg-muted rounded-lg", children: /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-sm", children: "Not available" }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium mb-2", children: "Secondary Camera" }),
                selectedVideo.secondary ? /* @__PURE__ */ jsx(
                  SingleVideoPlayer,
                  {
                    src: selectedVideo.secondary,
                    title: "Secondary Side"
                  }
                ) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-32 bg-muted rounded-lg", children: /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-sm", children: "Not available" }) })
              ] })
            ] }) })
          ] })
        ] })
      }
    )
  ] });
}
function SegmentedVideoPlayer({
  videos,
  details
}) {
  const [selectedQuestion, setSelectedQuestion] = useState(
    videos.length > 0 ? videos[0].questionId : ""
  );
  if (videos.length === 0) {
    return /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Video Recording" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Segmented video recordings" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-48 bg-muted rounded-lg", children: /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "No segmented videos available" }) }) })
    ] });
  }
  const selectedVideo = videos.find((v) => v.questionId === selectedQuestion);
  const selectedDetail = details.find((d) => d.questionId === selectedQuestion);
  const getQuestionLabel = (video) => {
    const detail = details.find((d) => d.questionId === video.questionId);
    const questionText = detail?.questionText ?? `Question ${video.questionNumber}`;
    const truncated = questionText.length > 40 ? `${questionText.substring(0, 40)}...` : questionText;
    return `Q${video.questionNumber}: ${truncated}`;
  };
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(CardTitle, { children: "Segmented Video Recordings" }),
      /* @__PURE__ */ jsxs(CardDescription, { children: [
        "Video recordings per question (",
        videos.length,
        " questions)"
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs(Select, { value: selectedQuestion, onValueChange: setSelectedQuestion, children: [
        /* @__PURE__ */ jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select a question" }) }),
        /* @__PURE__ */ jsx(SelectContent, { children: videos.map((video) => /* @__PURE__ */ jsx(SelectItem, { value: video.questionId, children: getQuestionLabel(video) }, video.questionId)) })
      ] }),
      selectedVideo && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        selectedDetail && /* @__PURE__ */ jsxs("div", { className: "p-3 bg-muted rounded-lg", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mb-1", children: [
            "Question ",
            selectedVideo.questionNumber
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: selectedDetail.questionText }),
          selectedDetail.answerText && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-2", children: [
            "Answer: ",
            selectedDetail.answerText,
            " (Score:",
            " ",
            selectedDetail.score,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Tabs, { defaultValue: "main", children: [
          /* @__PURE__ */ jsxs(TabsList, { className: "mb-4", children: [
            /* @__PURE__ */ jsx(TabsTrigger, { value: "main", children: "Main Camera" }),
            /* @__PURE__ */ jsx(TabsTrigger, { value: "secondary", children: "Secondary Camera" }),
            /* @__PURE__ */ jsx(TabsTrigger, { value: "side-by-side", children: "Side by Side" })
          ] }),
          /* @__PURE__ */ jsx(TabsContent, { value: "main", children: selectedVideo.main ? /* @__PURE__ */ jsx(
            SingleVideoPlayer,
            {
              src: selectedVideo.main,
              title: `Q${selectedVideo.questionNumber} Main`
            }
          ) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-48 bg-muted rounded-lg", children: /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Main video not available" }) }) }),
          /* @__PURE__ */ jsx(TabsContent, { value: "secondary", children: selectedVideo.secondary ? /* @__PURE__ */ jsx(
            SingleVideoPlayer,
            {
              src: selectedVideo.secondary,
              title: `Q${selectedVideo.questionNumber} Secondary`
            }
          ) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-48 bg-muted rounded-lg", children: /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Secondary video not available" }) }) }),
          /* @__PURE__ */ jsx(TabsContent, { value: "side-by-side", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium mb-2", children: "Main Camera" }),
              selectedVideo.main ? /* @__PURE__ */ jsx(
                SingleVideoPlayer,
                {
                  src: selectedVideo.main,
                  title: `Q${selectedVideo.questionNumber} Main Side`
                }
              ) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-32 bg-muted rounded-lg", children: /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-sm", children: "Not available" }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium mb-2", children: "Secondary Camera" }),
              selectedVideo.secondary ? /* @__PURE__ */ jsx(
                SingleVideoPlayer,
                {
                  src: selectedVideo.secondary,
                  title: `Q${selectedVideo.questionNumber} Secondary Side`
                }
              ) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-32 bg-muted rounded-lg", children: /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-sm", children: "Not available" }) })
            ] })
          ] }) })
        ] })
      ] })
    ] })
  ] });
}
function VideoPlayer({ videoPath }) {
  if (!videoPath) {
    return /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Video Recording" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "No video available for this response" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-48 bg-muted rounded-lg", children: /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "No video recorded" }) }) })
    ] });
  }
  const hasMain = videoPath.main && videoPath.main !== "null";
  const hasSecondary = videoPath.secondary && videoPath.secondary !== "null";
  if (!hasMain && !hasSecondary) {
    return /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Video Recording" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "No video available for this response" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-48 bg-muted rounded-lg", children: /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "No video recorded" }) }) })
    ] });
  }
  const mainSrc = videoPath.main ?? "";
  const secondarySrc = videoPath.secondary ?? "";
  if (hasMain && !hasSecondary) {
    return /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Video Recording" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Main camera recording" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(SingleVideoPlayer, { src: mainSrc, title: "Main Camera" }) })
    ] });
  }
  if (!hasMain && hasSecondary) {
    return /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Video Recording" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Secondary camera recording" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(SingleVideoPlayer, { src: secondarySrc, title: "Secondary Camera" }) })
    ] });
  }
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsx(CardTitle, { children: "Video Recording" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "View recordings from both cameras" })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Tabs, { defaultValue: "main", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "mb-4", children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "main", children: "Main Camera" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "secondary", children: "Secondary Camera" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "side-by-side", children: "Side by Side" })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "main", children: /* @__PURE__ */ jsx(SingleVideoPlayer, { src: mainSrc, title: "Main Camera" }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "secondary", children: /* @__PURE__ */ jsx(SingleVideoPlayer, { src: secondarySrc, title: "Secondary Camera" }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "side-by-side", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium mb-2", children: "Main Camera" }),
          /* @__PURE__ */ jsx(SingleVideoPlayer, { src: mainSrc, title: "Main Side" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium mb-2", children: "Secondary Camera" }),
          /* @__PURE__ */ jsx(SingleVideoPlayer, { src: secondarySrc, title: "Secondary Side" })
        ] })
      ] }) })
    ] }) })
  ] });
}
function parseVideoData(videoPathString, details) {
  if (!videoPathString || videoPathString === "null") {
    return { mode: "full", fullVideo: void 0 };
  }
  const hasSegmentedVideos = details.some(
    (d) => d.videoSegmentPath && d.videoSegmentPath !== "null"
  );
  if (hasSegmentedVideos) {
    const segmentedVideos = details.filter((d) => d.videoSegmentPath && d.videoSegmentPath !== "null").sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0)).map((detail, index) => {
      let main = null;
      let secondary = null;
      try {
        const parsed = JSON.parse(detail.videoSegmentPath);
        main = parsed.main ?? null;
        secondary = parsed.secondary ?? null;
      } catch {
        main = detail.videoSegmentPath;
      }
      return {
        questionId: detail.questionId,
        questionNumber: detail.orderNumber ?? index + 1,
        main,
        secondary
      };
    });
    return {
      mode: "segmented",
      segmentedVideos
    };
  }
  try {
    const parsed = JSON.parse(videoPathString);
    return {
      mode: "full",
      fullVideo: {
        main: parsed.main ?? null,
        secondary: parsed.secondary ?? null
      }
    };
  } catch {
    return {
      mode: "full",
      fullVideo: {
        main: videoPathString,
        secondary: null
      }
    };
  }
}
function ResponseDetail({ response }) {
  const videoData = parseVideoData(response.videoPath, response.details);
  return /* @__PURE__ */ jsxs(Main, { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { to: "/admin/responses", children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", className: "cursor-pointer", children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }),
          "Back to Responses"
        ] }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold tracking-tight", children: "Response Detail" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "View complete response information" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(ExportResponseDetailButton, { response })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsx(
        ProfileCard,
        {
          profile: response.profile,
          createdAt: response.createdAt,
          questionnaireTitle: response.questionnaire?.title ?? null
        }
      ),
      videoData.mode === "full" ? /* @__PURE__ */ jsx(VideoPlayer, { videoPath: videoData.fullVideo ?? null }) : /* @__PURE__ */ jsx(
        SegmentedVideoPlayer,
        {
          videos: videoData.segmentedVideos ?? [],
          details: response.details
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      ResponseAnswers,
      {
        details: response.details,
        totalScore: response.totalScore,
        videoData
      }
    )
  ] });
}
function ResponseDetailPage() {
  const {
    response
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsx(ResponseDetail, { response });
}
export {
  ResponseDetailPage as component
};
