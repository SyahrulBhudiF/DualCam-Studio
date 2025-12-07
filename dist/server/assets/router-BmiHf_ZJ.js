import { queryOptions, QueryClient } from "@tanstack/react-query";
import { redirect, useRouter, useMatch, rootRouteId, ErrorComponent, Link, createRootRouteWithContext, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { jsxs, jsx } from "react/jsx-runtime";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "../server.js";
import { s as signupSchema, l as loginSchema } from "./user-B3mpcRFy.js";
import { g as getSupabaseServerClient } from "./supabase-0PR4I26a.js";
import { Loader2Icon, OctagonXIcon, TriangleAlertIcon, InfoIcon, CircleCheckIcon } from "lucide-react";
import { useTheme as useTheme$1 } from "next-themes";
import { Toaster as Toaster$1 } from "sonner";
import { useState, useEffect, createContext, useContext, useMemo } from "react";
import { DirectionProvider as DirectionProvider$1 } from "@radix-ui/react-direction";
import Cookies from "js-cookie";
import fs from "node:fs";
import path from "node:path";
import { s as submissionSchema, b as bulkDeleteSchema, u as updateQuestionnaireSchema, c as createQuestionnaireSchema, a as updateQuestionSchema, d as createAnswerSchema, e as updateAnswerSchema, f as createQuestionSchema } from "./questionnaire-DGzIDWUe.js";
import { create } from "zustand";
import { z } from "zod";
const createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const fn = async (...args) => {
    const serverFn = await getServerFnById(functionId);
    return serverFn(...args);
  };
  return Object.assign(fn, {
    url,
    functionId,
    [TSS_SERVER_FUNCTION]: true
  });
};
const fetchUser_createServerFn_handler = createSsrRpc("71c38f09d976428ac23b9ebab9ed0203ca97f165e6b36327f3cd59a1c781cfd9");
const fetchUser = createServerFn({
  method: "GET"
}).handler(fetchUser_createServerFn_handler, async () => {
  const supabase = getSupabaseServerClient();
  const {
    data,
    error: _error
  } = await supabase.auth.getUser();
  if (!data.user?.email) {
    return null;
  }
  return {
    email: data.user.email
  };
});
const loginFn_createServerFn_handler = createSsrRpc("5d915414e128485b9cfc4370e1a52ef1680ac1505550dbaf2563dc40703d8597");
const loginFn = createServerFn({
  method: "POST"
}).inputValidator(loginSchema).handler(loginFn_createServerFn_handler, async ({
  data
}) => {
  const supabase = getSupabaseServerClient();
  const {
    error
  } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password
  });
  if (error) {
    return {
      error: true,
      message: error.message
    };
  }
});
const logoutFn_createServerFn_handler = createSsrRpc("824d00d7bf86be64fa9028cbb78809702cc4117e22633944cca1deb8bea782d7");
const logoutFn = createServerFn().handler(logoutFn_createServerFn_handler, async () => {
  const supabase = getSupabaseServerClient();
  const {
    error
  } = await supabase.auth.signOut();
  if (error) {
    return {
      error: true,
      message: error.message
    };
  }
  throw redirect({
    href: "/"
  });
});
const signupFn_createServerFn_handler = createSsrRpc("28df697674671c9fb16b3db29f5a9d226391352e31981f6dd9be68520cf0f562");
const signupFn = createServerFn({
  method: "POST"
}).inputValidator(signupSchema).handler(signupFn_createServerFn_handler, async ({
  data
}) => {
  const supabase = getSupabaseServerClient();
  const {
    error
  } = await supabase.auth.signUp({
    email: data.email,
    password: data.password
  });
  if (error) {
    return {
      error: true,
      message: error.message
    };
  }
  throw redirect({
    href: data.redirectUrl || "/"
  });
});
function DefaultCatchBoundary({ error }) {
  const router2 = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId
  });
  console.error(error);
  return /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6", children: [
    /* @__PURE__ */ jsx(ErrorComponent, { error }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center flex-wrap", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            router2.invalidate();
          },
          className: `px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold`,
          children: "Try Again"
        }
      ),
      isRoot ? /* @__PURE__ */ jsx(
        Link,
        {
          to: "/",
          className: `px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold`,
          children: "Home"
        }
      ) : /* @__PURE__ */ jsx(
        Link,
        {
          to: "/",
          className: `px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold`,
          onClick: (e) => {
            e.preventDefault();
            window.history.back();
          },
          children: "Go Back"
        }
      )
    ] })
  ] });
}
function NotFound({ children }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2 p-2", children: [
    /* @__PURE__ */ jsx("div", { className: "text-gray-600 dark:text-gray-400", children: children || /* @__PURE__ */ jsx("p", { children: "The page you are looking for does not exist." }) }),
    /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => window.history.back(),
          className: "bg-emerald-500 text-white px-2 py-1 rounded-sm uppercase font-black text-sm",
          children: "Go back"
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/",
          className: "bg-cyan-600 text-white px-2 py-1 rounded-sm uppercase font-black text-sm",
          children: "Start Over"
        }
      )
    ] })
  ] });
}
const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme$1();
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      theme,
      className: "toaster group",
      icons: {
        success: /* @__PURE__ */ jsx(CircleCheckIcon, { className: "size-4" }),
        info: /* @__PURE__ */ jsx(InfoIcon, { className: "size-4" }),
        warning: /* @__PURE__ */ jsx(TriangleAlertIcon, { className: "size-4" }),
        error: /* @__PURE__ */ jsx(OctagonXIcon, { className: "size-4" }),
        loading: /* @__PURE__ */ jsx(Loader2Icon, { className: "size-4 animate-spin" })
      },
      style: {
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "var(--radius)"
      },
      ...props
    }
  );
};
const DEFAULT_EXPIRES_DAYS = 7;
function hasDocument() {
  return typeof document !== "undefined";
}
function getCookie(name) {
  if (!hasDocument()) return void 0;
  return Cookies.get(name);
}
function setCookie(name, value, days = DEFAULT_EXPIRES_DAYS) {
  if (!hasDocument()) return;
  Cookies.set(name, value, { expires: days, path: "/" });
}
function removeCookie(name) {
  if (!hasDocument()) return;
  Cookies.remove(name, { path: "/" });
}
const DEFAULT_DIRECTION = "ltr";
const DIRECTION_COOKIE_NAME = "dir";
const DIRECTION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const DirectionContext = createContext(null);
function DirectionProvider({ children }) {
  const [dir, _setDir] = useState(
    () => getCookie(DIRECTION_COOKIE_NAME) || DEFAULT_DIRECTION
  );
  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute("dir", dir);
  }, [dir]);
  const setDir = (dir2) => {
    _setDir(dir2);
    setCookie(DIRECTION_COOKIE_NAME, dir2, DIRECTION_COOKIE_MAX_AGE);
  };
  const resetDir = () => {
    _setDir(DEFAULT_DIRECTION);
    removeCookie(DIRECTION_COOKIE_NAME);
  };
  return /* @__PURE__ */ jsx(
    DirectionContext,
    {
      value: {
        defaultDir: DEFAULT_DIRECTION,
        dir,
        setDir,
        resetDir
      },
      children: /* @__PURE__ */ jsx(DirectionProvider$1, { dir, children })
    }
  );
}
function useDirection() {
  const context = useContext(DirectionContext);
  if (!context) {
    throw new Error("useDirection must be used within a DirectionProvider");
  }
  return context;
}
const DEFAULT_THEME = "system";
const THEME_COOKIE_NAME = "ui-theme";
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const initialState = {
  defaultTheme: DEFAULT_THEME,
  resolvedTheme: "light",
  theme: DEFAULT_THEME,
  setTheme: () => null,
  resetTheme: () => null
};
const ThemeContext = createContext(initialState);
function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
  storageKey = THEME_COOKIE_NAME,
  ...props
}) {
  const [theme, _setTheme] = useState(
    () => getCookie(storageKey) || defaultTheme
  );
  const resolvedTheme = useMemo(() => {
    if (theme === "system") {
      if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      return "light";
    }
    return theme;
  }, [theme]);
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = (currentResolvedTheme) => {
      root.classList.remove("light", "dark");
      root.classList.add(currentResolvedTheme);
    };
    const handleChange = () => {
      if (theme === "system") {
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        applyTheme(systemTheme);
      }
    };
    applyTheme(resolvedTheme);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, resolvedTheme]);
  const setTheme = (theme2) => {
    setCookie(storageKey, theme2, THEME_COOKIE_MAX_AGE);
    _setTheme(theme2);
  };
  const resetTheme = () => {
    removeCookie(storageKey);
    _setTheme(DEFAULT_THEME);
  };
  const contextValue = {
    defaultTheme,
    resolvedTheme,
    resetTheme,
    theme,
    setTheme
  };
  return /* @__PURE__ */ jsx(ThemeContext, { value: contextValue, ...props, children });
}
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
const appCss = "/assets/app-B8HMWa5X.css";
const seo = ({
  title,
  description,
  keywords,
  image
}) => {
  const tags = [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "og:type", content: "website" },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    ...image ? [
      { name: "twitter:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "og:image", content: image }
    ] : []
  ];
  return tags;
};
const Route$e = createRootRouteWithContext()({
  beforeLoad: async () => {
    const user = await fetchUser();
    return {
      user
    };
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      ...seo({
        title: "DualCam Studio",
        description: `DualCam Studio is a general‑purpose, dataset‑oriented platform for dual‑camera microexpression recording and questionnaire management, suitable both for research and for more traditional online exam and survey use cases.`
      })
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png"
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" }
    ]
  }),
  errorComponent: (props) => {
    return /* @__PURE__ */ jsx(RootDocument, { children: /* @__PURE__ */ jsx(DefaultCatchBoundary, { ...props }) });
  },
  notFoundComponent: () => /* @__PURE__ */ jsx(NotFound, {}),
  component: RootComponent
});
function RootComponent() {
  return /* @__PURE__ */ jsx(RootDocument, { children: /* @__PURE__ */ jsx(ThemeProvider, { children: /* @__PURE__ */ jsx(DirectionProvider, { children: /* @__PURE__ */ jsx(Outlet, {}) }) }) });
}
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx(HeadContent, {}),
      /* @__PURE__ */ jsx("title", {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Toaster, {}),
      /* @__PURE__ */ jsx(TanStackRouterDevtools, { position: "bottom-left" }),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$c = () => import("./signup-CkBhO0p9.js");
const Route$d = createFileRoute("/signup")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const Route$c = createFileRoute("/logout")({
  preload: false,
  loader: () => logoutFn()
});
const $$splitComponentImporter$b = () => import("./login-C-G1YIEh.js");
const Route$b = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./route-BhyvYVEd.js");
const $$splitErrorComponentImporter = () => import("./route-DWdB3vB1.js");
const Route$a = createFileRoute("/admin")({
  beforeLoad: ({
    context
  }) => {
    if (!context.user) {
      throw new Error("Not authenticated");
    }
  },
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./index-DaEMi_2P.js");
const Route$9 = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./index-CwlThCtx.js");
const Route$8 = createFileRoute("/success/")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const getActiveQuestionnaire_createServerFn_handler = createSsrRpc("f5f348858b0f538d7a03206b70b71bc050feded4b8e1b425434c8a5c5c0eafaa");
const getActiveQuestionnaire = createServerFn({
  method: "GET"
}).handler(getActiveQuestionnaire_createServerFn_handler, async () => {
  const supabase = getSupabaseServerClient();
  const {
    data: questionnaire,
    error: qError
  } = await supabase.from("questionnaires").select("id, title, description").eq("is_active", true).limit(1).maybeSingle();
  if (qError) {
    throw new Error(`Supabase Error: ${qError.message}`);
  }
  if (!questionnaire) {
    throw new Error("Questionnaire is Empty");
  }
  const {
    data: questions,
    error: questionsError
  } = await supabase.from("questions").select(`
        id,
        question_text,
        order_number,
        answers (
          id,
          answer_text,
          score
        )
      `).eq("questionnaire_id", questionnaire.id).order("order_number", {
    ascending: true
  });
  if (questionsError) {
    throw new Error(`Gagal load questions: ${questionsError.message}`);
  }
  return {
    questionnaire,
    questions
  };
});
const submitQuestionnaire_createServerFn_handler = createSsrRpc("46df931824726e3e5ebc7a81cf1e7e9a24519f57175c41c69bf47fb6f8668677");
const submitQuestionnaire = createServerFn({
  method: "POST"
}).inputValidator((data) => submissionSchema.parse(data)).handler(submitQuestionnaire_createServerFn_handler, async ({
  data
}) => {
  const supabase = getSupabaseServerClient();
  const folderName = data.folderName;
  const uploadRoot = path.join(process.cwd(), "video_uploads");
  if (!fs.existsSync(uploadRoot)) {
    fs.mkdirSync(uploadRoot);
  }
  const userFolder = path.join(uploadRoot, folderName);
  if (!fs.existsSync(userFolder)) {
    fs.mkdirSync(userFolder);
  }
  const filePathMain = path.join(userFolder, "recording_main.webm");
  const bufferMain = Buffer.from(data.videoBase64Main.split(",")[1], "base64");
  try {
    fs.writeFileSync(filePathMain, bufferMain);
  } catch (_err) {
    throw new Error("Server failed to save main video file");
  }
  let filePathSecondary = "";
  if (data.videoBase64Secondary === "SAVED_ON_SERVER") {
    filePathSecondary = path.join(userFolder, "recording_realsense.avi");
  } else if (data.videoBase64Secondary && data.videoBase64Secondary.trim().length > 20) {
    filePathSecondary = path.join(userFolder, "recording_realsense.webm");
    const bufferSecondary = Buffer.from(data.videoBase64Secondary.split(",")[1], "base64");
    try {
      fs.writeFileSync(filePathSecondary, bufferSecondary);
    } catch (_err) {
      throw new Error("Server failed to save secondary video file");
    }
  }
  const storedPathObject = {
    main: `/video_uploads/${folderName}/recording_main.webm`,
    secondary: filePathSecondary ? `/video_uploads/${folderName}/${path.basename(filePathSecondary)}` : null
  };
  const storedPathString = JSON.stringify(storedPathObject);
  const answerIds = Object.values(data.answers);
  const {
    data: dbAnswers,
    error: ansError
  } = await supabase.from("answers").select("id, score, question_id").in("id", answerIds);
  if (ansError) throw new Error("Failed to validate answers");
  const totalScore = dbAnswers.reduce((acc, curr) => acc + curr.score, 0);
  const {
    data: existing,
    error: checkErr
  } = await supabase.from("profiles").select("id").eq("email", data.userEmail).maybeSingle();
  if (checkErr) {
    throw new Error(`Failed to check profile: ${checkErr.message}`);
  }
  let profileId = existing?.id;
  if (!profileId) {
    const {
      data: profile,
      error: profileError
    } = await supabase.from("profiles").insert({
      name: data.userName,
      class: data.userClass
    }).select("id").single();
    if (profileError) {
      throw new Error(`Failed to save profile: ${profileError.message}`);
    }
    profileId = profile.id;
  }
  const {
    data: response,
    error: respError
  } = await supabase.from("responses").insert({
    user_id: profileId,
    questionnaire_id: data.questionnaireId,
    video_path: storedPathString,
    total_score: totalScore
  }).select().single();
  if (respError) {
    throw new Error(`Failed to save response: ${respError.message}`);
  }
  const details = Object.entries(data.answers).map(([qId, aId]) => {
    const ans = dbAnswers.find((a) => a.id === aId);
    return {
      response_id: response.id,
      question_id: qId,
      answer_id: aId,
      score: ans?.score || 0
    };
  });
  await supabase.from("response_details").insert(details);
  return {
    success: true,
    responseId: response.id
  };
});
const $$splitComponentImporter$7 = () => import("./index-C2HqYUEX.js");
const Route$7 = createFileRoute("/questionnaire/")({
  loader: () => getActiveQuestionnaire(),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const useQuestionnaireStore = create((set) => ({
  folderName: "",
  answers: {},
  setFolderName: (name) => set({ folderName: name }),
  addAnswer: (qId, data) => set((state) => ({
    answers: { ...state.answers, [qId]: data }
  })),
  reset: () => set({ folderName: "", answers: {} })
}));
const $$splitComponentImporter$6 = () => import("./index-D92yjfDf.js");
const Route$6 = createFileRoute("/questionnaire/segmented/")({
  beforeLoad: () => {
    useQuestionnaireStore.getState().reset();
  },
  loader: () => getActiveQuestionnaire(),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const getResponses_createServerFn_handler = createSsrRpc("7a1329b1a12481f02ee132e314df924b3a454551fb4068240f89334c897f4300");
const getResponses = createServerFn({
  method: "GET"
}).handler(getResponses_createServerFn_handler, async () => {
  const supabase = getSupabaseServerClient();
  const {
    data,
    error
  } = await supabase.from("responses").select(`
        id,
        total_score,
        video_path,
        created_at,
        questionnaire_id,
        questionnaires (
          id,
          title
        ),
        profiles!inner (
          id,
          name,
          class,
          email,
          nim,
          semester,
          gender,
          age
        )
      `).order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data.map((r) => {
    const questionnaire = Array.isArray(r.questionnaires) ? r.questionnaires[0] : r.questionnaires;
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return {
      id: r.id,
      totalScore: r.total_score,
      videoPath: r.video_path,
      createdAt: r.created_at,
      questionnaireId: r.questionnaire_id,
      questionnaireTitle: questionnaire?.title ?? null,
      profile: profile ? {
        id: profile.id,
        name: profile.name,
        class: profile.class,
        email: profile.email,
        nim: profile.nim,
        semester: profile.semester,
        gender: profile.gender,
        age: profile.age
      } : null
    };
  });
});
const getResponseById_createServerFn_handler = createSsrRpc("d91d66b5f9e75cae63df6735b12886343545f7fdd148613d178e1dc46d022cdd");
const getResponseById = createServerFn({
  method: "GET"
}).inputValidator((id) => z.uuid().parse(id)).handler(getResponseById_createServerFn_handler, async ({
  data: id
}) => {
  const supabase = getSupabaseServerClient();
  const {
    data: response,
    error: responseError
  } = await supabase.from("responses").select(`
        id,
        total_score,
        video_path,
        created_at,
        questionnaire_id,
        questionnaires (
          id,
          title,
          description
        ),
        profiles!inner (
          id,
          name,
          class,
          email,
          nim,
          semester,
          gender,
          age
        )
      `).eq("id", id).single();
  if (responseError) throw new Error(responseError.message);
  const {
    data: details,
    error: detailsError
  } = await supabase.from("response_details").select(`
        id,
        question_id,
        answer_id,
        score,
        video_segment_path,
        questions (
          id,
          question_text,
          order_number
        ),
        answers (
          id,
          answer_text,
          score
        )
      `).eq("response_id", id).order("question_id", {
    ascending: true
  });
  if (detailsError) throw new Error(detailsError.message);
  const questionnaire = Array.isArray(response.questionnaires) ? response.questionnaires[0] : response.questionnaires;
  const profile = Array.isArray(response.profiles) ? response.profiles[0] : response.profiles;
  return {
    id: response.id,
    totalScore: response.total_score,
    videoPath: response.video_path,
    createdAt: response.created_at,
    questionnaire: questionnaire ? {
      id: questionnaire.id,
      title: questionnaire.title,
      description: questionnaire.description
    } : null,
    profile: profile ? {
      id: profile.id,
      name: profile.name,
      class: profile.class,
      email: profile.email,
      nim: profile.nim,
      semester: profile.semester,
      gender: profile.gender,
      age: profile.age
    } : null,
    details: details.map((d) => {
      const question = Array.isArray(d.questions) ? d.questions[0] : d.questions;
      const answer = Array.isArray(d.answers) ? d.answers[0] : d.answers;
      return {
        id: d.id,
        questionId: d.question_id,
        answerId: d.answer_id,
        score: d.score,
        videoSegmentPath: d.video_segment_path ?? null,
        questionText: question?.question_text ?? null,
        orderNumber: question?.order_number ?? null,
        answerText: answer?.answer_text ?? null,
        maxScore: answer?.score ?? null
      };
    })
  };
});
const getResponsesByQuestionnaireId_createServerFn_handler = createSsrRpc("dfc57c314271a67778cbd574504c6a2f33c4d0584eb5d677f9bc89165d8f32a6");
const getResponsesByQuestionnaireId = createServerFn({
  method: "GET"
}).inputValidator((questionnaireId) => z.string().uuid().parse(questionnaireId)).handler(getResponsesByQuestionnaireId_createServerFn_handler, async ({
  data: questionnaireId
}) => {
  const supabase = getSupabaseServerClient();
  const {
    data,
    error
  } = await supabase.from("responses").select(`
        id,
        total_score,
        video_path,
        created_at,
        profiles!inner (
          id,
          name,
          class,
          email,
          nim,
          semester,
          gender,
          age
        )
      `).eq("questionnaire_id", questionnaireId).order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data.map((r) => {
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return {
      id: r.id,
      totalScore: r.total_score,
      videoPath: r.video_path,
      createdAt: r.created_at,
      profile: profile ? {
        id: profile.id,
        name: profile.name,
        class: profile.class,
        email: profile.email,
        nim: profile.nim,
        semester: profile.semester,
        gender: profile.gender,
        age: profile.age
      } : null
    };
  });
});
const deleteResponses_createServerFn_handler = createSsrRpc("29b255e74ff36b54081e4184e128576155b89190e873db423c676abdb4e3e8f4");
const deleteResponses = createServerFn({
  method: "POST"
}).inputValidator((input) => z.object({
  ids: z.array(z.uuid())
}).parse(input)).handler(deleteResponses_createServerFn_handler, async ({
  data
}) => {
  const supabase = getSupabaseServerClient();
  const {
    error: detailsError
  } = await supabase.from("response_details").delete().in("response_id", data.ids);
  if (detailsError) throw new Error(detailsError.message);
  const {
    error
  } = await supabase.from("responses").delete().in("id", data.ids);
  if (error) throw new Error(error.message);
});
const getResponsesFiltered_createServerFn_handler = createSsrRpc("760b8b09a8b9e6912bed111d063a6c4d1dfd4aa67df90b586d7298e8dae794c9");
const getResponsesFiltered = createServerFn({
  method: "POST"
}).inputValidator((input) => z.object({
  questionnaireId: z.string().uuid().optional(),
  className: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
}).parse(input)).handler(getResponsesFiltered_createServerFn_handler, async ({
  data: filters
}) => {
  const supabase = getSupabaseServerClient();
  let query = supabase.from("responses").select(`
        id,
        total_score,
        video_path,
        created_at,
        questionnaire_id,
        questionnaires (
          id,
          title
        ),
        profiles!inner (
          id,
          name,
          class,
          email,
          nim,
          semester,
          gender,
          age
        )
      `).order("created_at", {
    ascending: false
  });
  if (filters.questionnaireId) {
    query = query.eq("questionnaire_id", filters.questionnaireId);
  }
  if (filters.className) {
    query = query.eq("profiles.class", filters.className);
  }
  if (filters.startDate) {
    query = query.gte("created_at", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("created_at", filters.endDate);
  }
  const {
    data,
    error
  } = await query;
  if (error) throw new Error(error.message);
  return data.map((r) => {
    const questionnaire = Array.isArray(r.questionnaires) ? r.questionnaires[0] : r.questionnaires;
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return {
      id: r.id,
      totalScore: r.total_score,
      videoPath: r.video_path,
      createdAt: r.created_at,
      questionnaireId: r.questionnaire_id,
      questionnaireTitle: questionnaire?.title ?? null,
      profile: profile ? {
        id: profile.id,
        name: profile.name,
        class: profile.class,
        email: profile.email,
        nim: profile.nim,
        semester: profile.semester,
        gender: profile.gender,
        age: profile.age
      } : null
    };
  });
});
const getFilterOptions_createServerFn_handler = createSsrRpc("2151d4a87186934f74d5f76057b31d03b779bce8de7ea04d182a26f8b01fc65a");
const getFilterOptions = createServerFn({
  method: "GET"
}).handler(getFilterOptions_createServerFn_handler, async () => {
  const supabase = getSupabaseServerClient();
  const [questionnaireResult, classResult] = await Promise.all([supabase.from("questionnaires").select("id, title").order("created_at", {
    ascending: false
  }), supabase.from("profiles").select("class")]);
  if (questionnaireResult.error) throw new Error(questionnaireResult.error.message);
  if (classResult.error) throw new Error(classResult.error.message);
  const uniqueClasses = [...new Set(classResult.data.map((p) => p.class).filter((c) => typeof c === "string"))].sort();
  return {
    questionnaires: questionnaireResult.data,
    classes: uniqueClasses
  };
});
const $$splitComponentImporter$5 = () => import("./index-m-rwx8Jm.js");
const Route$5 = createFileRoute("/admin/responses/")({
  loader: async () => {
    const [responses, filterOptions] = await Promise.all([getResponses(), getFilterOptions()]);
    return {
      responses,
      filterOptions
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const getQuestionnaires_createServerFn_handler = createSsrRpc("d4e9f6a71adb307cd6f0443a2087e8e28d583c455580fc59b05c5f4959c4bb45");
const getQuestionnaires = createServerFn({
  method: "GET"
}).handler(getQuestionnaires_createServerFn_handler, async () => {
  const supabase = getSupabaseServerClient();
  const {
    data,
    error
  } = await supabase.from("questionnaires").select("*").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data;
});
const getQuestionnaireById_createServerFn_handler = createSsrRpc("fef31e51cf696ef67d80ddc1c7ca7ee019dab8cc06954ad925dd049bd532ed65");
const getQuestionnaireById = createServerFn({
  method: "GET"
}).inputValidator((id) => z.uuid().parse(id)).handler(getQuestionnaireById_createServerFn_handler, async ({
  data: id
}) => {
  const supabase = getSupabaseServerClient();
  const {
    data,
    error
  } = await supabase.from("questionnaires").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data;
});
const createQuestionnaire_createServerFn_handler = createSsrRpc("2d3e5f9ba282f60017732b1d74a3fbe3bf1c3175bc3906572c5bc3842e50cb8a");
const createQuestionnaire = createServerFn({
  method: "POST"
}).inputValidator((input) => createQuestionnaireSchema.parse(input)).handler(createQuestionnaire_createServerFn_handler, async ({
  data
}) => {
  const supabase = getSupabaseServerClient();
  if (data.is_active) {
    await supabase.from("questionnaires").update({
      is_active: false
    }).neq("id", "00000000-0000-0000-0000-000000000000");
  }
  const {
    error
  } = await supabase.from("questionnaires").insert(data);
  if (error) throw new Error(error.message);
});
const updateQuestionnaire_createServerFn_handler = createSsrRpc("bedf3ec58a548bc7f6de1dc6e70cd8de32e28b340dfd37b6badf1b4d011a5138");
const updateQuestionnaire = createServerFn({
  method: "POST"
}).inputValidator((input) => updateQuestionnaireSchema.parse(input)).handler(updateQuestionnaire_createServerFn_handler, async ({
  data
}) => {
  const supabase = getSupabaseServerClient();
  const {
    id,
    ...updates
  } = data;
  if (updates.is_active) {
    await supabase.from("questionnaires").update({
      is_active: false
    }).neq("id", id);
  }
  const {
    error
  } = await supabase.from("questionnaires").update(updates).eq("id", id);
  if (error) throw new Error(error.message);
});
const deleteQuestionnaires_createServerFn_handler = createSsrRpc("ed79761e74bd29c43e4b1e5f3117a359dbccb80d6fc97fd7add5a2323f7f69f3");
const deleteQuestionnaires = createServerFn({
  method: "POST"
}).inputValidator((input) => bulkDeleteSchema.parse(input)).handler(deleteQuestionnaires_createServerFn_handler, async ({
  data
}) => {
  const supabase = getSupabaseServerClient();
  const {
    error
  } = await supabase.from("questionnaires").delete().in("id", data.ids);
  if (error) throw new Error(error.message);
});
const getQuestionsByQuestionnaireId_createServerFn_handler = createSsrRpc("caa23b2b9c63d73da9bba55f4b6b9aedd27e0439c81f14f38266df72965ee87e");
const getQuestionsByQuestionnaireId = createServerFn({
  method: "GET"
}).inputValidator((questionnaireId) => z.string().uuid().parse(questionnaireId)).handler(getQuestionsByQuestionnaireId_createServerFn_handler, async ({
  data: questionnaireId
}) => {
  const supabase = getSupabaseServerClient();
  const {
    data,
    error
  } = await supabase.from("questions").select("*").eq("questionnaire_id", questionnaireId).order("order_number", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return data;
});
const getQuestionById_createServerFn_handler = createSsrRpc("367f2cb38437a2da0055feb228b98c8f848b3a7575cd6056e7943c6f6b7b27c9");
const getQuestionById = createServerFn({
  method: "GET"
}).inputValidator((id) => z.uuid().parse(id)).handler(getQuestionById_createServerFn_handler, async ({
  data: id
}) => {
  const supabase = getSupabaseServerClient();
  const {
    data,
    error
  } = await supabase.from("questions").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data;
});
const createQuestion_createServerFn_handler = createSsrRpc("274890f00997a4a090cb1dcd3fbb6f528523f4dbd070f5489111b01ff6d975ea");
const createQuestion = createServerFn({
  method: "POST"
}).inputValidator((input) => createQuestionSchema.parse(input)).handler(createQuestion_createServerFn_handler, async ({
  data
}) => {
  const supabase = getSupabaseServerClient();
  const {
    error
  } = await supabase.from("questions").insert(data);
  if (error) throw new Error(error.message);
});
const updateQuestion_createServerFn_handler = createSsrRpc("91f5351acf24e4de38474d2a7fe7d8ae83b43cafeae60dd717b1eb75566baad4");
const updateQuestion = createServerFn({
  method: "POST"
}).inputValidator((input) => updateQuestionSchema.parse(input)).handler(updateQuestion_createServerFn_handler, async ({
  data
}) => {
  const supabase = getSupabaseServerClient();
  const {
    id,
    ...updates
  } = data;
  const {
    error
  } = await supabase.from("questions").update(updates).eq("id", id);
  if (error) throw new Error(error.message);
});
const deleteQuestions_createServerFn_handler = createSsrRpc("e27d155c42cca6cdd1251e96a01ec4f630be378ec9d166c628e1a9eb6eb635ec");
const deleteQuestions = createServerFn({
  method: "POST"
}).inputValidator((input) => bulkDeleteSchema.parse(input)).handler(deleteQuestions_createServerFn_handler, async ({
  data
}) => {
  const supabase = getSupabaseServerClient();
  const {
    error
  } = await supabase.from("questions").delete().in("id", data.ids);
  if (error) throw new Error(error.message);
});
const getAnswersByQuestionId_createServerFn_handler = createSsrRpc("ad7b8c3fe4a79426d62a7aa0f45d2348d78028f7e445534592810fa5de06d592");
const getAnswersByQuestionId = createServerFn({
  method: "GET"
}).inputValidator((questionId) => z.uuid().parse(questionId)).handler(getAnswersByQuestionId_createServerFn_handler, async ({
  data: questionId
}) => {
  const supabase = getSupabaseServerClient();
  const {
    data,
    error
  } = await supabase.from("answers").select("*").eq("question_id", questionId).order("score", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data;
});
const createAnswer_createServerFn_handler = createSsrRpc("f6f849659e6310a46abe03205b1affe4a27f0637a699dd248137fe11cf6ce617");
const createAnswer = createServerFn({
  method: "POST"
}).inputValidator((input) => createAnswerSchema.parse(input)).handler(createAnswer_createServerFn_handler, async ({
  data
}) => {
  const supabase = getSupabaseServerClient();
  const {
    error
  } = await supabase.from("answers").insert(data);
  if (error) throw new Error(error.message);
});
const updateAnswer_createServerFn_handler = createSsrRpc("7b378dda31e177eef3f8fad7fb9533ef75d60fd096afb3a3e07860b94aa65f09");
const updateAnswer = createServerFn({
  method: "POST"
}).inputValidator((input) => updateAnswerSchema.parse(input)).handler(updateAnswer_createServerFn_handler, async ({
  data
}) => {
  const supabase = getSupabaseServerClient();
  const {
    id,
    ...updates
  } = data;
  const {
    error
  } = await supabase.from("answers").update(updates).eq("id", id);
  if (error) throw new Error(error.message);
});
const deleteAnswers_createServerFn_handler = createSsrRpc("902264e6135f311ffeaf16a67659711ec00e2a6577d026a915b7ec9461bac9c7");
const deleteAnswers = createServerFn({
  method: "POST"
}).inputValidator((input) => bulkDeleteSchema.parse(input)).handler(deleteAnswers_createServerFn_handler, async ({
  data
}) => {
  const supabase = getSupabaseServerClient();
  const {
    error
  } = await supabase.from("answers").delete().in("id", data.ids);
  if (error) throw new Error(error.message);
});
const $$splitComponentImporter$4 = () => import("./index-DhCmkQKD.js");
const questionnairesQueryOptions = queryOptions({
  queryKey: ["admin", "questionnaires"],
  queryFn: () => getQuestionnaires()
});
const Route$4 = createFileRoute("/admin/questionnaires/")({
  loader: async ({
    context
  }) => {
    const {
      queryClient
    } = context;
    await queryClient.ensureQueryData(questionnairesQueryOptions);
  },
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const getDashboardSummary_createServerFn_handler = createSsrRpc("31be1e1d2d362bd89cbc7da6f88d35c6f2d4e201de6e7f3f2ee89f8c95bf65f4");
const getDashboardSummary = createServerFn({
  method: "GET"
}).handler(getDashboardSummary_createServerFn_handler, async () => {
  const supabase = getSupabaseServerClient();
  const [qResult, rResult, sResult, pResult] = await Promise.all([supabase.from("questionnaires").select("id", {
    count: "exact",
    head: true
  }), supabase.from("questionnaires").select("id", {
    count: "exact",
    head: true
  }).eq("is_active", true), supabase.from("responses").select("total_score"), supabase.from("profiles").select("class")]);
  if (qResult.error) throw new Error(`Failed to load questionnaire summary: ${qResult.error.message}`);
  if (rResult.error) throw new Error(`Failed to load active summary: ${rResult.error.message}`);
  if (sResult.error) throw new Error(`Failed to load response summary: ${sResult.error.message}`);
  if (pResult.error) throw new Error(`Failed to load class summary: ${pResult.error.message}`);
  const classRows = pResult.data ?? [];
  const uniqueClasses = new Set(classRows.map((p) => p.class).filter((v) => typeof v === "string"));
  const responseData = sResult.data ?? [];
  const totalScore = responseData.reduce((acc, curr) => acc + (curr.total_score ?? 0), 0);
  const count = responseData.length;
  const averageScore = count > 0 ? totalScore / count : 0;
  return {
    totalQuestionnaires: qResult.count ?? 0,
    activeQuestionnaires: rResult.count ?? 0,
    totalResponses: count,
    averageScore,
    totalClasses: uniqueClasses.size
  };
});
const getDashboardBreakdown_createServerFn_handler = createSsrRpc("6cf315d311faa1ac025a91e738dff247aea5e4dce166e46385cdb15b9b191a3f");
const getDashboardBreakdown = createServerFn({
  method: "GET"
}).handler(getDashboardBreakdown_createServerFn_handler, async () => {
  const supabase = getSupabaseServerClient();
  const [qResult, cResult] = await Promise.all([supabase.from("responses").select(`
        questionnaire_id,
        total_score,
        questionnaires (
          id,
          title
        )
      `), supabase.from("responses").select(`
        total_score,
        profiles!inner (
          class
        )
      `)]);
  if (qResult.error) throw new Error(`Failed to load questionnaire breakdown: ${qResult.error.message}`);
  if (cResult.error) throw new Error(`Failed to load class breakdown: ${cResult.error.message}`);
  const questionnaireRows = qResult.data ?? [];
  const questionnaireMap = {};
  for (const row of questionnaireRows) {
    const q = Array.isArray(row.questionnaires) ? row.questionnaires[0] : row.questionnaires;
    if (!q) continue;
    if (!questionnaireMap[q.id]) {
      questionnaireMap[q.id] = {
        id: q.id,
        title: q.title,
        totalResponses: 0,
        totalScore: 0
      };
    }
    questionnaireMap[q.id].totalResponses += 1;
    questionnaireMap[q.id].totalScore += row.total_score ?? 0;
  }
  const questionnaireStats = Object.values(questionnaireMap).map((q) => ({
    id: q.id,
    title: q.title,
    totalResponses: q.totalResponses,
    averageScore: q.totalResponses > 0 ? q.totalScore / q.totalResponses : 0
  }));
  const classRows = cResult.data ?? [];
  const classMap = {};
  for (const row of classRows) {
    const p = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const cls = p?.class;
    if (!cls) continue;
    if (!classMap[cls]) {
      classMap[cls] = {
        className: cls,
        totalResponses: 0,
        totalScore: 0
      };
    }
    classMap[cls].totalResponses += 1;
    classMap[cls].totalScore += row.total_score ?? 0;
  }
  const classStats = Object.values(classMap).map((c) => ({
    className: c.className,
    totalResponses: c.totalResponses,
    averageScore: c.totalResponses > 0 ? c.totalScore / c.totalResponses : 0
  }));
  return {
    questionnaires: questionnaireStats,
    classes: classStats
  };
});
const getAnalyticsDetails_createServerFn_handler = createSsrRpc("5f70027ea85b5069399ec9bfec69093a0defb10ca9515a4194590d955ef2909a");
const getAnalyticsDetails = createServerFn({
  method: "GET"
}).handler(getAnalyticsDetails_createServerFn_handler, async () => {
  const supabase = getSupabaseServerClient();
  const [qResult, aResult, tResult, vResult] = await Promise.all([supabase.from("response_details").select(`
        question_id,
        score,
        questions (
          id,
          question_text,
          order_number
        )
      `), supabase.from("response_details").select(`
        answer_id,
        score,
        answers (
          id,
          answer_text,
          question_id
        )
      `), supabase.from("responses").select(`
        created_at,
        total_score
      `), supabase.from("responses").select("id", {
    count: "exact",
    head: true
  }).not("video_path", "is", null)]);
  if (qResult.error) throw new Error(`Failed to load question analytics: ${qResult.error.message}`);
  if (aResult.error) throw new Error(`Failed to load answer analytics: ${aResult.error.message}`);
  if (tResult.error) throw new Error(`Failed to load response timeline: ${tResult.error.message}`);
  if (vResult.error) throw new Error(`Failed to load video analytics: ${vResult.error.message}`);
  const questionRows = qResult.data ?? [];
  const questionMap = {};
  for (const row of questionRows) {
    const q = Array.isArray(row.questions) ? row.questions[0] : row.questions;
    if (!q) continue;
    if (!questionMap[q.id]) {
      questionMap[q.id] = {
        id: q.id,
        text: q.question_text,
        order: q.order_number ?? null,
        totalScore: 0,
        totalResponses: 0
      };
    }
    questionMap[q.id].totalScore += row.score ?? 0;
    questionMap[q.id].totalResponses += 1;
  }
  const questions = Object.values(questionMap).map((q) => ({
    id: q.id,
    text: q.text,
    order: q.order,
    averageScore: q.totalResponses > 0 ? q.totalScore / q.totalResponses : 0
  }));
  const answerRows = aResult.data ?? [];
  const answerMap = {};
  for (const row of answerRows) {
    const ans = Array.isArray(row.answers) ? row.answers[0] : row.answers;
    if (!ans) continue;
    if (!answerMap[ans.id]) {
      answerMap[ans.id] = {
        id: ans.id,
        text: ans.answer_text,
        questionId: ans.question_id ?? null,
        totalScore: 0,
        totalResponses: 0
      };
    }
    answerMap[ans.id].totalScore += row.score ?? 0;
    answerMap[ans.id].totalResponses += 1;
  }
  const answers = Object.values(answerMap).map((a) => ({
    id: a.id,
    text: a.text,
    questionId: a.questionId,
    totalResponses: a.totalResponses,
    averageScore: a.totalResponses > 0 ? a.totalScore / a.totalResponses : 0
  }));
  const timelineRaw = tResult.data ?? [];
  const timelineMap = {};
  for (const row of timelineRaw) {
    const key = row.created_at.slice(0, 10);
    if (!timelineMap[key]) {
      timelineMap[key] = {
        date: key,
        totalResponses: 0,
        totalScore: 0
      };
    }
    timelineMap[key].totalResponses += 1;
    timelineMap[key].totalScore += row.total_score ?? 0;
  }
  const timeline = Object.values(timelineMap).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0).map((t) => ({
    date: t.date,
    totalResponses: t.totalResponses,
    averageScore: t.totalResponses > 0 ? t.totalScore / t.totalResponses : 0
  }));
  return {
    questions,
    answers,
    timeline,
    video: {
      withVideo: vResult.count ?? 0,
      total: timeline.reduce((acc, t) => acc + t.totalResponses, 0)
    }
  };
});
const $$splitComponentImporter$3 = () => import("./index-8Ilfa4Wy.js");
const summaryOptions = queryOptions({
  queryKey: ["dashboard", "summary"],
  queryFn: () => getDashboardSummary()
});
const breakdownOptions = queryOptions({
  queryKey: ["dashboard", "breakdown"],
  queryFn: () => getDashboardBreakdown()
});
const analyticsOptions = queryOptions({
  queryKey: ["dashboard", "analytics"],
  queryFn: () => getAnalyticsDetails()
});
const Route$3 = createFileRoute("/admin/dashboard/")({
  loader: async ({
    context
  }) => {
    const {
      queryClient
    } = context;
    await Promise.all([queryClient.ensureQueryData(summaryOptions), queryClient.ensureQueryData(breakdownOptions), queryClient.ensureQueryData(analyticsOptions)]);
  },
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./index-CVCH5Oze.js");
const Route$2 = createFileRoute("/admin/responses/$responseId/")({
  loader: async ({
    params
  }) => {
    const response = await getResponseById({
      data: params.responseId
    });
    return {
      response
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./index-Dsevmgxf.js");
const Route$1 = createFileRoute("/admin/questionnaires/$questionnaireId/")({
  loader: async ({
    context,
    params
  }) => {
    const {
      queryClient
    } = context;
    const {
      questionnaireId
    } = params;
    const questionnaireOptions = queryOptions({
      queryKey: ["admin", "questionnaire", questionnaireId],
      queryFn: () => getQuestionnaireById({
        data: questionnaireId
      })
    });
    const questionsOptions = queryOptions({
      queryKey: ["admin", "questions", questionnaireId],
      queryFn: () => getQuestionsByQuestionnaireId({
        data: questionnaireId
      })
    });
    await Promise.all([queryClient.ensureQueryData(questionnaireOptions), queryClient.ensureQueryData(questionsOptions)]);
  },
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-C-WK_ubF.js");
const Route = createFileRoute("/admin/questionnaires/$questionnaireId/$questionId/")({
  loader: async ({
    context,
    params
  }) => {
    const {
      queryClient
    } = context;
    const {
      questionId
    } = params;
    const questionOptions = queryOptions({
      queryKey: ["admin", "question", questionId],
      queryFn: () => getQuestionById({
        data: questionId
      })
    });
    const answersOptions = queryOptions({
      queryKey: ["admin", "answers", questionId],
      queryFn: () => getAnswersByQuestionId({
        data: questionId
      })
    });
    await Promise.all([queryClient.ensureQueryData(questionOptions), queryClient.ensureQueryData(answersOptions)]);
  },
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SignupRoute = Route$d.update({
  id: "/signup",
  path: "/signup",
  getParentRoute: () => Route$e
});
const LogoutRoute = Route$c.update({
  id: "/logout",
  path: "/logout",
  getParentRoute: () => Route$e
});
const LoginRoute = Route$b.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$e
});
const AdminRouteRoute = Route$a.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$e
});
const IndexRoute = Route$9.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$e
});
const SuccessIndexRoute = Route$8.update({
  id: "/success/",
  path: "/success/",
  getParentRoute: () => Route$e
});
const QuestionnaireIndexRoute = Route$7.update({
  id: "/questionnaire/",
  path: "/questionnaire/",
  getParentRoute: () => Route$e
});
const QuestionnaireSegmentedIndexRoute = Route$6.update({
  id: "/questionnaire/segmented/",
  path: "/questionnaire/segmented/",
  getParentRoute: () => Route$e
});
const AdminResponsesIndexRoute = Route$5.update({
  id: "/responses/",
  path: "/responses/",
  getParentRoute: () => AdminRouteRoute
});
const AdminQuestionnairesIndexRoute = Route$4.update({
  id: "/questionnaires/",
  path: "/questionnaires/",
  getParentRoute: () => AdminRouteRoute
});
const AdminDashboardIndexRoute = Route$3.update({
  id: "/dashboard/",
  path: "/dashboard/",
  getParentRoute: () => AdminRouteRoute
});
const AdminResponsesResponseIdIndexRoute = Route$2.update({
  id: "/responses/$responseId/",
  path: "/responses/$responseId/",
  getParentRoute: () => AdminRouteRoute
});
const AdminQuestionnairesQuestionnaireIdIndexRoute = Route$1.update({
  id: "/questionnaires/$questionnaireId/",
  path: "/questionnaires/$questionnaireId/",
  getParentRoute: () => AdminRouteRoute
});
const AdminQuestionnairesQuestionnaireIdQuestionIdIndexRoute = Route.update({
  id: "/questionnaires/$questionnaireId/$questionId/",
  path: "/questionnaires/$questionnaireId/$questionId/",
  getParentRoute: () => AdminRouteRoute
});
const AdminRouteRouteChildren = {
  AdminDashboardIndexRoute,
  AdminQuestionnairesIndexRoute,
  AdminResponsesIndexRoute,
  AdminQuestionnairesQuestionnaireIdIndexRoute,
  AdminResponsesResponseIdIndexRoute,
  AdminQuestionnairesQuestionnaireIdQuestionIdIndexRoute
};
const AdminRouteRouteWithChildren = AdminRouteRoute._addFileChildren(
  AdminRouteRouteChildren
);
const rootRouteChildren = {
  IndexRoute,
  AdminRouteRoute: AdminRouteRouteWithChildren,
  LoginRoute,
  LogoutRoute,
  SignupRoute,
  QuestionnaireIndexRoute,
  SuccessIndexRoute,
  QuestionnaireSegmentedIndexRoute
};
const routeTree = Route$e._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: {
      queryClient
    },
    scrollRestoration: true
  });
  setupRouterSsrQueryIntegration({
    router: router2,
    queryClient
  });
  return router2;
}
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  getQuestionsByQuestionnaireId as A,
  deleteAnswers as B,
  createAnswer as C,
  updateAnswer as D,
  Route as E,
  getQuestionById as F,
  getAnswersByQuestionId as G,
  router as H,
  Route$5 as R,
  setCookie as a,
  useDirection as b,
  useQuestionnaireStore as c,
  submitQuestionnaire as d,
  createSsrRpc as e,
  getResponsesFiltered as f,
  getCookie as g,
  deleteResponses as h,
  createQuestionnaire as i,
  deleteQuestionnaires as j,
  updateQuestionnaire as k,
  loginFn as l,
  getQuestionnaires as m,
  getResponses as n,
  getDashboardSummary as o,
  getDashboardBreakdown as p,
  getAnalyticsDetails as q,
  Route$2 as r,
  signupFn as s,
  deleteQuestions as t,
  useTheme as u,
  createQuestion as v,
  updateQuestion as w,
  getResponsesByQuestionnaireId as x,
  Route$1 as y,
  getQuestionnaireById as z
};
