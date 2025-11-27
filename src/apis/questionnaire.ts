import fs from "node:fs";
import path from "node:path";
import { createServerFn } from "@tanstack/react-start";
import {
	type submission,
	submissionSchema,
} from "@/libs/schemas/questionnaire";
import { getSupabaseServerClient } from "@/utils/supabase";

export const getActiveQuestionnaire = createServerFn({ method: "GET" }).handler(
	async () => {
		const supabase = getSupabaseServerClient();

		const { data: questionnaire, error: qError } = await supabase
			.from("questionnaires")
			.select("id, title, description")
			.eq("is_active", true)
			.limit(1)
			.maybeSingle();

		if (qError) {
			throw new Error(`Supabase Error: ${qError.message}`);
		}

		if (!questionnaire) {
			throw new Error("Questionnaire is Empty");
		}

		const { data: questions, error: questionsError } = await supabase
			.from("questions")
			.select(
				`
        id,
        question_text,
        order_number,
        answers (
          id,
          answer_text,
          score
        )
      `,
			)
			.eq("questionnaire_id", questionnaire.id)
			.order("order_number", { ascending: true });

		if (questionsError) {
			throw new Error(`Gagal load questions: ${questionsError.message}`);
		}

		return {
			questionnaire,
			questions,
		};
	},
);

export const submitQuestionnaire = createServerFn({ method: "POST" })
	.inputValidator((data: submission) => submissionSchema.parse(data))
	.handler(async ({ data }) => {
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
		const bufferMain = Buffer.from(
			data.videoBase64Main.split(",")[1],
			"base64",
		);

		try {
			fs.writeFileSync(filePathMain, bufferMain);
		} catch (_err) {
			throw new Error("Server failed to save main video file");
		}

		let filePathSecondary = "";

		if (data.videoBase64Secondary === "SAVED_ON_SERVER") {
			filePathSecondary = path.join(userFolder, "recording_realsense.avi");
		} else if (
			data.videoBase64Secondary &&
			data.videoBase64Secondary.trim().length > 20
		) {
			filePathSecondary = path.join(userFolder, "recording_realsense.webm");
			const bufferSecondary = Buffer.from(
				data.videoBase64Secondary.split(",")[1],
				"base64",
			);
			try {
				fs.writeFileSync(filePathSecondary, bufferSecondary);
			} catch (_err) {
				throw new Error("Server failed to save secondary video file");
			}
		}

		const storedPathObject = {
			main: `/video_uploads/${folderName}/recording_main.webm`,
			secondary: filePathSecondary
				? `/video_uploads/${folderName}/${path.basename(filePathSecondary)}`
				: null,
		};

		const storedPathString = JSON.stringify(storedPathObject);

		const answerIds = Object.values(data.answers);
		const { data: dbAnswers, error: ansError } = await supabase
			.from("answers")
			.select("id, score, question_id")
			.in("id", answerIds);

		if (ansError) throw new Error("Failed to validate answers");

		const totalScore = dbAnswers.reduce((acc, curr) => acc + curr.score, 0);

		const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.insert({
				name: data.userName,
				class: data.userClass,
			})
			.select("id")
			.single();

		if (profileError) {
			throw new Error(`Failed to save profile: ${profileError.message}`);
		}

		const { data: response, error: respError } = await supabase
			.from("responses")
			.insert({
				user_id: profile.id,
				questionnaire_id: data.questionnaireId,
				video_path: storedPathString,
				total_score: totalScore,
			})
			.select()
			.single();

		if (respError) throw new Error(respError.message);

		const details = Object.entries(data.answers).map(([qId, aId]) => {
			const ans = dbAnswers.find((a) => a.id === aId);
			return {
				response_id: response.id,
				question_id: qId,
				answer_id: aId,
				score: ans?.score || 0,
			};
		});

		await supabase.from("response_details").insert(details);

		return { success: true, responseId: response.id };
	});
