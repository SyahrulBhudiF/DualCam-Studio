import { a as createServerRpc, c as createServerFn } from "../server.js";
import { z } from "zod";
import { c as createQuestionnaireSchema, u as updateQuestionnaireSchema, b as bulkDeleteSchema, f as createQuestionSchema, a as updateQuestionSchema, d as createAnswerSchema, e as updateAnswerSchema } from "./questionnaire-DGzIDWUe.js";
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
const getQuestionnaires_createServerFn_handler = createServerRpc("d4e9f6a71adb307cd6f0443a2087e8e28d583c455580fc59b05c5f4959c4bb45", (opts, signal) => {
  return getQuestionnaires.__executeServer(opts, signal);
});
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
const getQuestionnaireById_createServerFn_handler = createServerRpc("fef31e51cf696ef67d80ddc1c7ca7ee019dab8cc06954ad925dd049bd532ed65", (opts, signal) => {
  return getQuestionnaireById.__executeServer(opts, signal);
});
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
const createQuestionnaire_createServerFn_handler = createServerRpc("2d3e5f9ba282f60017732b1d74a3fbe3bf1c3175bc3906572c5bc3842e50cb8a", (opts, signal) => {
  return createQuestionnaire.__executeServer(opts, signal);
});
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
const updateQuestionnaire_createServerFn_handler = createServerRpc("bedf3ec58a548bc7f6de1dc6e70cd8de32e28b340dfd37b6badf1b4d011a5138", (opts, signal) => {
  return updateQuestionnaire.__executeServer(opts, signal);
});
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
const deleteQuestionnaires_createServerFn_handler = createServerRpc("ed79761e74bd29c43e4b1e5f3117a359dbccb80d6fc97fd7add5a2323f7f69f3", (opts, signal) => {
  return deleteQuestionnaires.__executeServer(opts, signal);
});
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
const getQuestionsByQuestionnaireId_createServerFn_handler = createServerRpc("caa23b2b9c63d73da9bba55f4b6b9aedd27e0439c81f14f38266df72965ee87e", (opts, signal) => {
  return getQuestionsByQuestionnaireId.__executeServer(opts, signal);
});
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
const getQuestionById_createServerFn_handler = createServerRpc("367f2cb38437a2da0055feb228b98c8f848b3a7575cd6056e7943c6f6b7b27c9", (opts, signal) => {
  return getQuestionById.__executeServer(opts, signal);
});
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
const createQuestion_createServerFn_handler = createServerRpc("274890f00997a4a090cb1dcd3fbb6f528523f4dbd070f5489111b01ff6d975ea", (opts, signal) => {
  return createQuestion.__executeServer(opts, signal);
});
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
const updateQuestion_createServerFn_handler = createServerRpc("91f5351acf24e4de38474d2a7fe7d8ae83b43cafeae60dd717b1eb75566baad4", (opts, signal) => {
  return updateQuestion.__executeServer(opts, signal);
});
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
const deleteQuestions_createServerFn_handler = createServerRpc("e27d155c42cca6cdd1251e96a01ec4f630be378ec9d166c628e1a9eb6eb635ec", (opts, signal) => {
  return deleteQuestions.__executeServer(opts, signal);
});
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
const getAnswersByQuestionId_createServerFn_handler = createServerRpc("ad7b8c3fe4a79426d62a7aa0f45d2348d78028f7e445534592810fa5de06d592", (opts, signal) => {
  return getAnswersByQuestionId.__executeServer(opts, signal);
});
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
const createAnswer_createServerFn_handler = createServerRpc("f6f849659e6310a46abe03205b1affe4a27f0637a699dd248137fe11cf6ce617", (opts, signal) => {
  return createAnswer.__executeServer(opts, signal);
});
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
const updateAnswer_createServerFn_handler = createServerRpc("7b378dda31e177eef3f8fad7fb9533ef75d60fd096afb3a3e07860b94aa65f09", (opts, signal) => {
  return updateAnswer.__executeServer(opts, signal);
});
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
const deleteAnswers_createServerFn_handler = createServerRpc("902264e6135f311ffeaf16a67659711ec00e2a6577d026a915b7ec9461bac9c7", (opts, signal) => {
  return deleteAnswers.__executeServer(opts, signal);
});
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
export {
  createAnswer_createServerFn_handler,
  createQuestion_createServerFn_handler,
  createQuestionnaire_createServerFn_handler,
  deleteAnswers_createServerFn_handler,
  deleteQuestionnaires_createServerFn_handler,
  deleteQuestions_createServerFn_handler,
  getAnswersByQuestionId_createServerFn_handler,
  getQuestionById_createServerFn_handler,
  getQuestionnaireById_createServerFn_handler,
  getQuestionnaires_createServerFn_handler,
  getQuestionsByQuestionnaireId_createServerFn_handler,
  updateAnswer_createServerFn_handler,
  updateQuestion_createServerFn_handler,
  updateQuestionnaire_createServerFn_handler
};
