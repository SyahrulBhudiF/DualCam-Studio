import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	bulkDeleteSchema,
	createAnswerSchema,
	createQuestionnaireSchema,
	createQuestionSchema,
	updateAnswerSchema,
	updateQuestionnaireSchema,
	updateQuestionSchema,
} from "@/libs/schemas/questionnaire";
import { getSupabaseServerClient } from "@/utils/supabase";

export const getQuestionnaires = createServerFn({ method: "GET" }).handler(
	async () => {
		const supabase = getSupabaseServerClient();
		const { data, error } = await supabase
			.from("questionnaires")
			.select("*")
			.order("created_at", { ascending: false });
		if (error) throw new Error(error.message);
		return data;
	},
);

export const getQuestionnaireById = createServerFn({ method: "GET" })
	.inputValidator((id: string) => z.uuid().parse(id))
	.handler(async ({ data: id }) => {
		const supabase = getSupabaseServerClient();
		const { data, error } = await supabase
			.from("questionnaires")
			.select("*")
			.eq("id", id)
			.single();
		if (error) throw new Error(error.message);
		return data;
	});

export const createQuestionnaire = createServerFn({ method: "POST" })
	.inputValidator((input) => createQuestionnaireSchema.parse(input))
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();
		if (data.is_active) {
			await supabase
				.from("questionnaires")
				.update({ is_active: false })
				.neq("id", "00000000-0000-0000-0000-000000000000");
		}
		const { error } = await supabase.from("questionnaires").insert(data);
		if (error) throw new Error(error.message);
	});

export const updateQuestionnaire = createServerFn({ method: "POST" })
	.inputValidator((input) => updateQuestionnaireSchema.parse(input))
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();
		const { id, ...updates } = data;
		if (updates.is_active) {
			await supabase
				.from("questionnaires")
				.update({ is_active: false })
				.neq("id", id);
		}
		const { error } = await supabase
			.from("questionnaires")
			.update(updates)
			.eq("id", id);
		if (error) throw new Error(error.message);
	});

export const deleteQuestionnaires = createServerFn({ method: "POST" })
	.inputValidator((input) => bulkDeleteSchema.parse(input))
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();
		const { error } = await supabase
			.from("questionnaires")
			.delete()
			.in("id", data.ids);
		if (error) throw new Error(error.message);
	});

export const getQuestionsByQuestionnaireId = createServerFn({ method: "GET" })
	.inputValidator((questionnaireId: string) =>
		z.string().uuid().parse(questionnaireId),
	)
	.handler(async ({ data: questionnaireId }) => {
		const supabase = getSupabaseServerClient();
		const { data, error } = await supabase
			.from("questions")
			.select("*")
			.eq("questionnaire_id", questionnaireId)
			.order("order_number", { ascending: true });
		if (error) throw new Error(error.message);
		return data;
	});

export const getQuestionById = createServerFn({ method: "GET" })
	.inputValidator((id: string) => z.uuid().parse(id))
	.handler(async ({ data: id }) => {
		const supabase = getSupabaseServerClient();
		const { data, error } = await supabase
			.from("questions")
			.select("*")
			.eq("id", id)
			.single();
		if (error) throw new Error(error.message);
		return data;
	});

export const createQuestion = createServerFn({ method: "POST" })
	.inputValidator((input) => createQuestionSchema.parse(input))
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();
		const { error } = await supabase.from("questions").insert(data);
		if (error) throw new Error(error.message);
	});

export const updateQuestion = createServerFn({ method: "POST" })
	.inputValidator((input) => updateQuestionSchema.parse(input))
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();
		const { id, ...updates } = data;
		const { error } = await supabase
			.from("questions")
			.update(updates)
			.eq("id", id);
		if (error) throw new Error(error.message);
	});

export const deleteQuestions = createServerFn({ method: "POST" })
	.inputValidator((input) => bulkDeleteSchema.parse(input))
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();
		const { error } = await supabase
			.from("questions")
			.delete()
			.in("id", data.ids);
		if (error) throw new Error(error.message);
	});

export const getAnswersByQuestionId = createServerFn({ method: "GET" })
	.inputValidator((questionId: string) => z.uuid().parse(questionId))
	.handler(async ({ data: questionId }) => {
		const supabase = getSupabaseServerClient();
		const { data, error } = await supabase
			.from("answers")
			.select("*")
			.eq("question_id", questionId)
			.order("score", { ascending: false });
		if (error) throw new Error(error.message);
		return data;
	});

export const createAnswer = createServerFn({ method: "POST" })
	.inputValidator((input) => createAnswerSchema.parse(input))
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();
		const { error } = await supabase.from("answers").insert(data);
		if (error) throw new Error(error.message);
	});

export const updateAnswer = createServerFn({ method: "POST" })
	.inputValidator((input) => updateAnswerSchema.parse(input))
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();
		const { id, ...updates } = data;
		const { error } = await supabase
			.from("answers")
			.update(updates)
			.eq("id", id);
		if (error) throw new Error(error.message);
	});

export const deleteAnswers = createServerFn({ method: "POST" })
	.inputValidator((input) => bulkDeleteSchema.parse(input))
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();
		const { error } = await supabase
			.from("answers")
			.delete()
			.in("id", data.ids);
		if (error) throw new Error(error.message);
	});
