import z from "zod";
const submissionSchema = z.object({
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
  folderName: z.string()
});
const finalSubmitSchema = z.object({
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
      videoSecPath: z.string()
    })
  )
});
const uploadChunkSchema = z.object({
  folderName: z.string(),
  fileName: z.string(),
  fileBase64: z.string()
});
const createQuestionnaireSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  is_active: z.boolean().default(false)
});
const updateQuestionnaireSchema = createQuestionnaireSchema.partial().extend({
  id: z.uuid()
});
const createQuestionSchema = z.object({
  questionnaire_id: z.uuid(),
  question_text: z.string().min(1, "Question text is required"),
  order_number: z.coerce.number().int().default(0)
});
const updateQuestionSchema = createQuestionSchema.omit({ questionnaire_id: true }).partial().extend({
  id: z.uuid()
});
const createAnswerSchema = z.object({
  question_id: z.uuid(),
  answer_text: z.string().min(1, "Answer text is required"),
  score: z.coerce.number().int().default(0)
});
const updateAnswerSchema = createAnswerSchema.omit({ question_id: true }).partial().extend({
  id: z.uuid()
});
const bulkDeleteSchema = z.object({
  ids: z.array(z.uuid())
});
export {
  updateQuestionSchema as a,
  bulkDeleteSchema as b,
  createQuestionnaireSchema as c,
  createAnswerSchema as d,
  updateAnswerSchema as e,
  createQuestionSchema as f,
  uploadChunkSchema as g,
  finalSubmitSchema as h,
  submissionSchema as s,
  updateQuestionnaireSchema as u
};
