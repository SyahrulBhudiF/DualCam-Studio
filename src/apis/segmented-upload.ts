import fs from "node:fs";
import path from "node:path";
import { createServerFn } from "@tanstack/react-start";
import {
	type finalSubmit,
	finalSubmitSchema,
	type uploadChunk,
	uploadChunkSchema,
} from "@/libs/schemas/questionnaire";
import { getSupabaseServerClient } from "@/utils/supabase";

export const uploadVideoChunk = createServerFn({ method: "POST" })
	.inputValidator((data: uploadChunk) => uploadChunkSchema.parse(data))
	.handler(async ({ data }) => {
		const uploadRoot = path.join(process.cwd(), "video_uploads");
		const userFolder = path.join(uploadRoot, data.folderName);

		if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot);
		if (!fs.existsSync(userFolder)) fs.mkdirSync(userFolder);

		const filePath = path.join(userFolder, data.fileName);
		const fileDir = path.dirname(filePath);

		if (!fs.existsSync(fileDir)) {
			fs.mkdirSync(fileDir, { recursive: true });
		}

		const buffer = Buffer.from(data.fileBase64.split(",")[1], "base64");

		try {
			fs.writeFileSync(filePath, buffer);
			return {
				success: true,
				path: `/video_uploads/${data.folderName}/${data.fileName}`,
			};
		} catch (_e) {
			throw new Error("Failed to save chunk");
		}
	});

export const submitSegmentedResponse = createServerFn({ method: "POST" })
	.inputValidator((data: finalSubmit) => finalSubmitSchema.parse(data))
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();

		const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.insert({ name: data.userName, class: data.userClass })
			.select("id")
			.single();

		if (profileError) throw new Error(profileError.message);

		const answerIds = data.answers.map((a) => a.answerId);
		const { data: dbAnswers } = await supabase
			.from("answers")
			.select("id, score")
			.in("id", answerIds);

		const totalScore =
			dbAnswers?.reduce((acc, curr) => acc + curr.score, 0) || 0;

		const { data: response, error: respError } = await supabase
			.from("responses")
			.insert({
				user_id: profile.id,
				questionnaire_id: data.questionnaireId,
				video_path: data.folderName,
				total_score: totalScore,
			})
			.select("id")
			.single();

		if (respError) throw new Error(respError.message);

		const details = data.answers.map((ans) => {
			const score = dbAnswers?.find((d) => d.id === ans.answerId)?.score || 0;
			const videoJson = JSON.stringify({
				main: ans.videoMainPath,
				secondary: ans.videoSecPath,
			});

			return {
				response_id: response.id,
				question_id: ans.questionId,
				answer_id: ans.answerId,
				score: score,
				video_segment_path: videoJson,
			};
		});

		await supabase.from("response_details").insert(details);
		return { success: true, responseId: response.id };
	});
