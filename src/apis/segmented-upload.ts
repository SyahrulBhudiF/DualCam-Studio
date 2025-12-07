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
		} catch (e) {
			throw new Error(
				`Failed to save chunk: ${e instanceof Error ? e.message : String(e)}`,
			);
		}
	});

export const submitSegmentedResponse = createServerFn({ method: "POST" })
	.inputValidator((data: finalSubmit) => finalSubmitSchema.parse(data))
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();

		const { data: existing, error: checkErr } = await supabase
			.from("profiles")
			.select("id")
			.eq("email", data.userEmail)
			.maybeSingle();

		if (checkErr) throw new Error(checkErr.message);

		let profileId = existing?.id;

		if (!profileId) {
			const { data: created, error: createErr } = await supabase
				.from("profiles")
				.insert({
					name: data.userName,
					class: data.userClass,
					semester: data.userSemester,
					nim: data.userNim,
					gender: data.userGender,
					age: data.userAge,
					email: data.userEmail,
				})
				.select("id")
				.single();

			if (createErr) throw new Error(createErr.message);
			profileId = created.id;
		}

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
				user_id: profileId,
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
