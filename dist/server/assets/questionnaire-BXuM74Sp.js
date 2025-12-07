import { a as createServerRpc, c as createServerFn } from "../server.js";
import fs from "node:fs";
import path from "node:path";
import { s as submissionSchema } from "./questionnaire-DGzIDWUe.js";
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
const getActiveQuestionnaire_createServerFn_handler = createServerRpc("f5f348858b0f538d7a03206b70b71bc050feded4b8e1b425434c8a5c5c0eafaa", (opts, signal) => {
  return getActiveQuestionnaire.__executeServer(opts, signal);
});
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
const submitQuestionnaire_createServerFn_handler = createServerRpc("46df931824726e3e5ebc7a81cf1e7e9a24519f57175c41c69bf47fb6f8668677", (opts, signal) => {
  return submitQuestionnaire.__executeServer(opts, signal);
});
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
export {
  getActiveQuestionnaire_createServerFn_handler,
  submitQuestionnaire_createServerFn_handler
};
