import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseServerClient } from "@/utils/supabase";

export const getResponses = createServerFn({ method: "GET" }).handler(
	async () => {
		const supabase = getSupabaseServerClient();

		const { data, error } = await supabase
			.from("responses")
			.select(
				`
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
      `,
			)
			.order("created_at", { ascending: false });

		if (error) throw new Error(error.message);

		return data.map((r) => {
			const questionnaire = Array.isArray(r.questionnaires)
				? r.questionnaires[0]
				: r.questionnaires;
			const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;

			return {
				id: r.id,
				totalScore: r.total_score,
				videoPath: r.video_path,
				createdAt: r.created_at,
				questionnaireId: r.questionnaire_id,
				questionnaireTitle: questionnaire?.title ?? null,
				profile: profile
					? {
							id: profile.id,
							name: profile.name,
							class: profile.class,
							email: profile.email,
							nim: profile.nim,
							semester: profile.semester,
							gender: profile.gender,
							age: profile.age,
						}
					: null,
			};
		});
	},
);

export const getResponseById = createServerFn({ method: "GET" })
	.inputValidator((id: string) => z.uuid().parse(id))
	.handler(async ({ data: id }) => {
		const supabase = getSupabaseServerClient();

		const { data: response, error: responseError } = await supabase
			.from("responses")
			.select(
				`
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
      `,
			)
			.eq("id", id)
			.single();

		if (responseError) throw new Error(responseError.message);

		const { data: details, error: detailsError } = await supabase
			.from("response_details")
			.select(
				`
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
      `,
			)
			.eq("response_id", id)
			.order("question_id", { ascending: true });

		if (detailsError) throw new Error(detailsError.message);

		const questionnaire = Array.isArray(response.questionnaires)
			? response.questionnaires[0]
			: response.questionnaires;
		const profile = Array.isArray(response.profiles)
			? response.profiles[0]
			: response.profiles;

		return {
			id: response.id,
			totalScore: response.total_score,
			videoPath: response.video_path,
			createdAt: response.created_at,
			questionnaire: questionnaire
				? {
						id: questionnaire.id,
						title: questionnaire.title,
						description: questionnaire.description,
					}
				: null,
			profile: profile
				? {
						id: profile.id,
						name: profile.name,
						class: profile.class,
						email: profile.email,
						nim: profile.nim,
						semester: profile.semester,
						gender: profile.gender,
						age: profile.age,
					}
				: null,
			details: details.map((d) => {
				const question = Array.isArray(d.questions)
					? d.questions[0]
					: d.questions;
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
					maxScore: answer?.score ?? null,
				};
			}),
		};
	});

export const getResponsesByQuestionnaireId = createServerFn({ method: "GET" })
	.inputValidator((questionnaireId: string) =>
		z.string().uuid().parse(questionnaireId),
	)
	.handler(async ({ data: questionnaireId }) => {
		const supabase = getSupabaseServerClient();

		const { data, error } = await supabase
			.from("responses")
			.select(
				`
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
      `,
			)
			.eq("questionnaire_id", questionnaireId)
			.order("created_at", { ascending: false });

		if (error) throw new Error(error.message);

		return data.map((r) => {
			const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;

			return {
				id: r.id,
				totalScore: r.total_score,
				videoPath: r.video_path,
				createdAt: r.created_at,
				profile: profile
					? {
							id: profile.id,
							name: profile.name,
							class: profile.class,
							email: profile.email,
							nim: profile.nim,
							semester: profile.semester,
							gender: profile.gender,
							age: profile.age,
						}
					: null,
			};
		});
	});

export const deleteResponses = createServerFn({ method: "POST" })
	.inputValidator((input: { ids: string[] }) =>
		z.object({ ids: z.array(z.uuid()) }).parse(input),
	)
	.handler(async ({ data }) => {
		const supabase = getSupabaseServerClient();

		const { error: detailsError } = await supabase
			.from("response_details")
			.delete()
			.in("response_id", data.ids);

		if (detailsError) throw new Error(detailsError.message);

		const { error } = await supabase
			.from("responses")
			.delete()
			.in("id", data.ids);

		if (error) throw new Error(error.message);
	});

export const getResponsesFiltered = createServerFn({ method: "POST" })
	.inputValidator(
		(input: {
			questionnaireId?: string;
			className?: string;
			startDate?: string;
			endDate?: string;
		}) =>
			z
				.object({
					questionnaireId: z.string().uuid().optional(),
					className: z.string().optional(),
					startDate: z.string().optional(),
					endDate: z.string().optional(),
				})
				.parse(input),
	)
	.handler(async ({ data: filters }) => {
		const supabase = getSupabaseServerClient();

		let query = supabase
			.from("responses")
			.select(
				`
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
      `,
			)
			.order("created_at", { ascending: false });

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

		const { data, error } = await query;

		if (error) throw new Error(error.message);

		return data.map((r) => {
			const questionnaire = Array.isArray(r.questionnaires)
				? r.questionnaires[0]
				: r.questionnaires;
			const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;

			return {
				id: r.id,
				totalScore: r.total_score,
				videoPath: r.video_path,
				createdAt: r.created_at,
				questionnaireId: r.questionnaire_id,
				questionnaireTitle: questionnaire?.title ?? null,
				profile: profile
					? {
							id: profile.id,
							name: profile.name,
							class: profile.class,
							email: profile.email,
							nim: profile.nim,
							semester: profile.semester,
							gender: profile.gender,
							age: profile.age,
						}
					: null,
			};
		});
	});

export const getFilterOptions = createServerFn({ method: "GET" }).handler(
	async () => {
		const supabase = getSupabaseServerClient();

		const [questionnaireResult, classResult] = await Promise.all([
			supabase
				.from("questionnaires")
				.select("id, title")
				.order("created_at", { ascending: false }),
			supabase.from("profiles").select("class"),
		]);

		if (questionnaireResult.error)
			throw new Error(questionnaireResult.error.message);
		if (classResult.error) throw new Error(classResult.error.message);

		const uniqueClasses = [
			...new Set(
				classResult.data
					.map((p) => p.class)
					.filter((c): c is string => typeof c === "string"),
			),
		].sort();

		return {
			questionnaires: questionnaireResult.data,
			classes: uniqueClasses,
		};
	},
);
