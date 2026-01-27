import z from "zod";

export const submissionSchema = z.object({
	userEmail: z.email(),
	userName: z.string(),
	userClass: z.string(),
	userSemester: z.string(),
	userGender: z.string(),
	userAge: z.number(),
	userNim: z.string(),
	questionnaireId: z.string(),
	videoBase64Main: z.string().optional(),
	videoBase64Secondary: z.string().optional(),
	answers: z.record(z.string(), z.string()),
	folderName: z.string(),
});

export type submission = z.infer<typeof submissionSchema>;

export const finalSubmitSchema = z.object({
	userEmail: z.email(),
	userName: z.string(),
	userClass: z.string(),
	userSemester: z.string(),
	userGender: z.string(),
	userAge: z.number(),
	userNim: z.string(),
	questionnaireId: z.string(),
	folderName: z.string(),
	answers: z.array(
		z.object({
			questionId: z.string(),
			answerId: z.string(),
			videoMainPath: z.string(),
			videoSecPath: z.string(),
		}),
	),
});

export type finalSubmit = z.infer<typeof finalSubmitSchema>;

export const uploadChunkSchema = z.object({
	folderName: z.string(),
	fileName: z.string(),
	fileBase64: z.string(),
});

export type uploadChunk = z.infer<typeof uploadChunkSchema>;

export const createQuestionnaireSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional().nullable(),
	isActive: z.boolean().default(false),
});

export const updateQuestionnaireSchema = createQuestionnaireSchema
	.partial()
	.extend({
		id: z.uuid(),
	});

export const createQuestionSchema = z.object({
	questionnaireId: z.uuid(),
	questionText: z.string().min(1, "Question text is required"),
	orderNumber: z.coerce.number().int().default(0),
});

export const updateQuestionSchema = createQuestionSchema
	.omit({ questionnaireId: true })
	.partial()
	.extend({
		id: z.uuid(),
	});

export const createAnswerSchema = z.object({
	questionId: z.uuid(),
	answerText: z.string().min(1, "Answer text is required"),
	score: z.coerce.number().int().default(0),
});

export const updateAnswerSchema = createAnswerSchema
	.omit({ questionId: true })
	.partial()
	.extend({
		id: z.uuid(),
	});

export const bulkDeleteSchema = z.object({
	ids: z.array(z.uuid()),
});
