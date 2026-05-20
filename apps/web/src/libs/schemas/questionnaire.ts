import z from "zod";

export const createQuestionnaireSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional().nullable(),
	isActive: z.boolean().default(false),
});

export const createQuestionSchema = z.object({
	questionnaireId: z.uuid(),
	questionText: z.string().min(1, "Question text is required"),
	orderNumber: z.coerce.number().int().default(0),
});

export const createAnswerSchema = z.object({
	questionId: z.uuid(),
	answerText: z.string().min(1, "Answer text is required"),
	score: z.coerce.number().int().default(0),
});
