import { a as createServerRpc, c as createServerFn } from "../server.js";
import { z } from "zod";
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
const getResponses_createServerFn_handler = createServerRpc("7a1329b1a12481f02ee132e314df924b3a454551fb4068240f89334c897f4300", (opts, signal) => {
  return getResponses.__executeServer(opts, signal);
});
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
const getResponseById_createServerFn_handler = createServerRpc("d91d66b5f9e75cae63df6735b12886343545f7fdd148613d178e1dc46d022cdd", (opts, signal) => {
  return getResponseById.__executeServer(opts, signal);
});
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
const getResponsesByQuestionnaireId_createServerFn_handler = createServerRpc("dfc57c314271a67778cbd574504c6a2f33c4d0584eb5d677f9bc89165d8f32a6", (opts, signal) => {
  return getResponsesByQuestionnaireId.__executeServer(opts, signal);
});
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
const deleteResponses_createServerFn_handler = createServerRpc("29b255e74ff36b54081e4184e128576155b89190e873db423c676abdb4e3e8f4", (opts, signal) => {
  return deleteResponses.__executeServer(opts, signal);
});
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
const getResponsesFiltered_createServerFn_handler = createServerRpc("760b8b09a8b9e6912bed111d063a6c4d1dfd4aa67df90b586d7298e8dae794c9", (opts, signal) => {
  return getResponsesFiltered.__executeServer(opts, signal);
});
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
const getFilterOptions_createServerFn_handler = createServerRpc("2151d4a87186934f74d5f76057b31d03b779bce8de7ea04d182a26f8b01fc65a", (opts, signal) => {
  return getFilterOptions.__executeServer(opts, signal);
});
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
export {
  deleteResponses_createServerFn_handler,
  getFilterOptions_createServerFn_handler,
  getResponseById_createServerFn_handler,
  getResponsesByQuestionnaireId_createServerFn_handler,
  getResponsesFiltered_createServerFn_handler,
  getResponses_createServerFn_handler
};
