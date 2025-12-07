import { a as createServerRpc, c as createServerFn } from "../server.js";
import fs from "node:fs";
import path from "node:path";
import { g as uploadChunkSchema, h as finalSubmitSchema } from "./questionnaire-DGzIDWUe.js";
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
import "zod";
import "@supabase/ssr";
import "clsx";
import "tailwind-merge";
const uploadVideoChunk_createServerFn_handler = createServerRpc("3e8463c2903c7b1d998228770fd196c4f38b030596578bf6a4a4fe5d9dc87c44", (opts, signal) => {
  return uploadVideoChunk.__executeServer(opts, signal);
});
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
const submitSegmentedResponse_createServerFn_handler = createServerRpc("6e10dc167003492fe41b5184f0702cab32b56085f4fe3d4ec79d1a719175f784", (opts, signal) => {
  return submitSegmentedResponse.__executeServer(opts, signal);
});
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
export {
  submitSegmentedResponse_createServerFn_handler,
  uploadVideoChunk_createServerFn_handler
};
