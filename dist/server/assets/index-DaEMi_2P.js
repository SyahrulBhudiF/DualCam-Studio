import { jsxs, jsx } from "react/jsx-runtime";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { B as Button } from "./button-CmIj-cVl.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from "./card-BHTzFMfN.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-a33jwLhQ.js";
import { I as Input } from "./input-DtwcC6CR.js";
import { L as Label } from "./label-Bk8qxaEw.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-WKwWO3Fr.js";
import { p as profileSchema } from "./user-B3mpcRFy.js";
import { c as useQuestionnaireStore } from "./router-BmiHf_ZJ.js";
import { u as useUserStore } from "./UserStore-Bda0L9F1.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./supabase-0PR4I26a.js";
import "@supabase/ssr";
import "clsx";
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
import "@radix-ui/react-dialog";
import "lucide-react";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "zod";
import "@tanstack/react-query";
import "@tanstack/react-router-ssr-query";
import "@tanstack/react-router-devtools";
import "next-themes";
import "sonner";
import "@radix-ui/react-direction";
import "js-cookie";
import "node:fs";
import "node:path";
import "./questionnaire-DGzIDWUe.js";
import "zustand";
import "zustand/middleware";
function Profile() {
  const navigate = useNavigate();
  const store = useUserStore();
  const questionnaireStore = useQuestionnaireStore();
  const [showInstructions, setShowInstructions] = useState(false);
  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
      nim: "",
      class: "",
      semester: "",
      age: "",
      gender: "",
      mode: "segmented"
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = profileSchema.safeParse({
          email: value.email,
          name: value.name,
          nim: value.nim,
          class: value.class,
          semester: value.semester,
          age: Number(value.age),
          gender: value.gender
        });
        if (!result.success) {
          return result.error.issues.reduce(
            (acc, issue) => {
              const path = issue.path[0];
              acc[path] = issue.message;
              return acc;
            },
            {}
          );
        }
        return void 0;
      }
    },
    onSubmit: async ({ value }) => {
      store.setUser({
        email: value.email,
        name: value.name,
        nim: value.nim,
        class: value.class,
        semester: value.semester,
        age: Number(value.age),
        gender: value.gender
      });
      questionnaireStore.reset();
      setShowInstructions(true);
    }
  });
  const handleStart = () => {
    const mode = form.getFieldValue("mode");
    if (mode === "segmented") {
      navigate({ to: "/questionnaire/segmented" });
    } else {
      navigate({ to: "/questionnaire" });
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex items-center justify-center bg-muted/40 p-4", children: [
    /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md shadow-lg", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "text-center", children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl font-bold", children: "Student Profile" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Enter your details to start the questionnaire." })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(
        "form",
        {
          onSubmit: (e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          },
          className: "space-y-6",
          children: [
            /* @__PURE__ */ jsx(form.Field, { name: "email", children: (field) => /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "email",
                  placeholder: "ahmad@example.com",
                  value: field.state.value,
                  onBlur: field.handleBlur,
                  onChange: (e) => field.handleChange(e.target.value)
                }
              ),
              field.state.meta.errors?.[0] && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: field.state.meta.errors[0] })
            ] }) }),
            /* @__PURE__ */ jsx(form.Field, { name: "name", children: (field) => /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Full Name" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "name",
                  placeholder: "Ahmad",
                  value: field.state.value,
                  onBlur: field.handleBlur,
                  onChange: (e) => field.handleChange(e.target.value)
                }
              ),
              field.state.meta.errors?.[0] && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: field.state.meta.errors[0] })
            ] }) }),
            /* @__PURE__ */ jsx(form.Field, { name: "nim", children: (field) => /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "nim", children: "NIM" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "nim",
                  placeholder: "2141720000",
                  type: "number",
                  value: field.state.value,
                  onBlur: field.handleBlur,
                  onChange: (e) => field.handleChange(e.target.value)
                }
              ),
              field.state.meta.errors?.[0] && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: field.state.meta.errors[0] })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsx(form.Field, { name: "class", children: (field) => /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "class", children: "Class" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "class",
                    placeholder: "TI-4G",
                    value: field.state.value,
                    onBlur: field.handleBlur,
                    onChange: (e) => field.handleChange(e.target.value)
                  }
                ),
                field.state.meta.errors?.[0] && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: field.state.meta.errors[0] })
              ] }) }),
              /* @__PURE__ */ jsx(form.Field, { name: "semester", children: (field) => /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "semester", children: "Semester" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "semester",
                    placeholder: "8",
                    value: field.state.value,
                    onBlur: field.handleBlur,
                    onChange: (e) => field.handleChange(e.target.value)
                  }
                ),
                field.state.meta.errors?.[0] && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: field.state.meta.errors[0] })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsx(form.Field, { name: "age", children: (field) => /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "age", children: "Age" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "age",
                    type: "number",
                    placeholder: "21",
                    value: field.state.value,
                    onBlur: field.handleBlur,
                    onChange: (e) => field.handleChange(e.target.value)
                  }
                ),
                field.state.meta.errors?.[0] && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: field.state.meta.errors[0] })
              ] }) }),
              /* @__PURE__ */ jsx(form.Field, { name: "gender", children: (field) => /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(Label, { htmlFor: "gender", children: "Gender" }),
                /* @__PURE__ */ jsxs(
                  Select,
                  {
                    value: field.state.value,
                    onValueChange: field.handleChange,
                    children: [
                      /* @__PURE__ */ jsx(SelectTrigger, { id: "gender", className: "w-full", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select" }) }),
                      /* @__PURE__ */ jsxs(SelectContent, { children: [
                        /* @__PURE__ */ jsx(SelectItem, { value: "L", children: "Laki-laki" }),
                        /* @__PURE__ */ jsx(SelectItem, { value: "P", children: "Perempuan" })
                      ] })
                    ]
                  }
                ),
                field.state.meta.errors?.[0] && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: field.state.meta.errors[0] })
              ] }) })
            ] }),
            /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full cursor-pointer", size: "lg", children: "Next Step" })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: showInstructions, onOpenChange: setShowInstructions, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl max-h-[80vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { className: "text-xl font-bold text-center mb-2", children: "Petunjuk Pengerjaan Kuesioner Kebutuhan Psikologis" }),
        /* @__PURE__ */ jsx(DialogDescription, { className: "sr-only", children: "Instruksi pengisian kuesioner." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-sm text-muted-foreground leading-relaxed", children: [
        /* @__PURE__ */ jsx("p", { children: "Kuesioner ini berisi pernyataan-pernyataan tentang perasaan dan pengalaman anda dalam kehidupan sehari-hari, terutama terkait dengan kehidupan yang anda rasakan di Sekolah. Tidak ada jawaban yang benar atau salah. Kami hanya ingin mengetahui apa yang sedang anda alami saat ini." }),
        /* @__PURE__ */ jsxs("div", { className: "bg-muted/50 p-4 rounded-lg border border-border", children: [
          /* @__PURE__ */ jsx("strong", { className: "block mb-2 text-foreground", children: "Cara mengisi:" }),
          /* @__PURE__ */ jsxs("ol", { className: "list-decimal pl-5 space-y-2", children: [
            /* @__PURE__ */ jsx("li", { children: "Bacalah setiap pernyataan dengan cermat." }),
            /* @__PURE__ */ jsx("li", { children: "Isi identitas diri yang diminta." }),
            /* @__PURE__ */ jsx("li", { children: "Tentukan seberapa besar anda setuju atau tidak setuju dengan pernyataan tersebut." }),
            /* @__PURE__ */ jsx("li", { children: "Beri tanda (V) atau pilih salah satu angka dari 1 hingga 4 di sebelah pernyataan yang sesuai dengan perasaan anda." }),
            /* @__PURE__ */ jsxs("li", { children: [
              "Skala yang digunakan adalah sebagai berikut:",
              /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-5 mt-1 space-y-1", children: [
                /* @__PURE__ */ jsxs("li", { children: [
                  /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: "1" }),
                  " = Sangat Tidak Setuju"
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: "2" }),
                  " = Tidak Setuju"
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: "3" }),
                  " = Setuju"
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: "4" }),
                  " = Sangat Setuju"
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "italic", children: "Tidak perlu terlalu lama berpikir, jawablah sesuai dengan apa yang anda rasakan secara spontan. Jawaban anda akan sangat membantu dalam memahami perasaan anda terkait kebutuhan psikologis dalam kehidupan sehari-hari." }),
        /* @__PURE__ */ jsxs("div", { className: "p-3 rounded border-2 border-primary/50 text-red-400 text-xs", children: [
          /* @__PURE__ */ jsx("strong", { children: "Contoh:" }),
          " Jika pernyataan berbunyi",
          " ",
          /* @__PURE__ */ jsx("em", { children: '"Saya merasa aman di sekolah"' }),
          ", dan kamu merasa bahwa pernyataan ini sangat sesuai dengan dirimu, maka kamu dapat memilih angka 4 pada skala tersebut."
        ] })
      ] }),
      /* @__PURE__ */ jsx(DialogFooter, { className: "mt-6 sm:justify-center", children: /* @__PURE__ */ jsx(
        Button,
        {
          onClick: handleStart,
          size: "lg",
          className: "w-full sm:w-auto cursor-pointer",
          children: "Mulai Mengerjakan"
        }
      ) })
    ] }) })
  ] });
}
const SplitComponent = Profile;
export {
  SplitComponent as component
};
