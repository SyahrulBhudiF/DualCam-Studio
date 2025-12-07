import { a as createServerRpc, c as createServerFn } from "../server.js";
import { g as getSupabaseServerClient } from "./supabase-0PR4I26a.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-router";
import "@supabase/ssr";
import "clsx";
import "tailwind-merge";
const getDashboardSummary_createServerFn_handler = createServerRpc("31be1e1d2d362bd89cbc7da6f88d35c6f2d4e201de6e7f3f2ee89f8c95bf65f4", (opts, signal) => {
  return getDashboardSummary.__executeServer(opts, signal);
});
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
const getDashboardBreakdown_createServerFn_handler = createServerRpc("6cf315d311faa1ac025a91e738dff247aea5e4dce166e46385cdb15b9b191a3f", (opts, signal) => {
  return getDashboardBreakdown.__executeServer(opts, signal);
});
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
const getAnalyticsDetails_createServerFn_handler = createServerRpc("5f70027ea85b5069399ec9bfec69093a0defb10ca9515a4194590d955ef2909a", (opts, signal) => {
  return getAnalyticsDetails.__executeServer(opts, signal);
});
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
export {
  getAnalyticsDetails_createServerFn_handler,
  getDashboardBreakdown_createServerFn_handler,
  getDashboardSummary_createServerFn_handler
};
