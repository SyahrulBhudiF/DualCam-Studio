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
