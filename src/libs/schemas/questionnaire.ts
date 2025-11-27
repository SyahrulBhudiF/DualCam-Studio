import z from "zod";

export const submissionSchema = z.object({
	userName: z.string(),
	userClass: z.string(),
	questionnaireId: z.string(),
	videoBase64Main: z.string(),
	videoBase64Secondary: z.string().optional(),
	answers: z.record(z.string(), z.string()),
	folderName: z.string(),
});

export type submission = z.infer<typeof submissionSchema>;

export const finalSubmitSchema = z.object({
	userName: z.string(),
	userClass: z.string(),
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
