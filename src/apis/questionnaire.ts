import path from "node:path";
import { Schema } from "effect";
import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import {
	AnswerService,
	FileUploadService,
	ProfileService,
	QuestionnaireService,
	ResponseService,
	runEffect,
} from "@/infrastructure";
import { SubmissionSchema } from "@/infrastructure/schemas/questionnaire";
import { verifyCsrfOrigin } from "@/utils/csrf";

export const getActiveQuestionnaire = createServerFn({ method: "GET" }).handler(
	async () => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				const result = yield* service.getActive();

				return {
					questionnaire: {
						id: result.questionnaire.id,
						title: result.questionnaire.title,
						description: result.questionnaire.description,
					},
					questions: result.questions.map((q) => ({
						id: q.id,
						question_text: q.questionText,
						order_number: q.orderNumber,
						answers: q.answers.map((a) => ({
							id: a.id,
							answer_text: a.answerText,
							score: a.score,
						})),
					})),
				};
			}),
		);
	},
);

export const submitQuestionnaire = createServerFn({ method: "POST" })
	.inputValidator(Schema.decodeUnknownSync(SubmissionSchema))
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				yield* verifyCsrfOrigin;

				const fileUploadService = yield* FileUploadService;
				const answerService = yield* AnswerService;
				const profileService = yield* ProfileService;
				const responseService = yield* ResponseService;

				const folderName = data.folderName;
				const uploadRoot = yield* fileUploadService.getUploadRoot();

				// Ensure directories exist
				yield* fileUploadService.ensureDirectory(uploadRoot);
				const userFolder = path.join(uploadRoot, folderName);
				yield* fileUploadService.ensureDirectory(userFolder);

				// Save main video if provided
				const storedPathObject: {
					main: string | null;
					secondary: string | null;
				} = { main: null, secondary: null };

				if (data.videoBase64Main) {
					const mainFileName = "recording_main.webm";
					const mainResult = yield* fileUploadService.uploadChunk({
						folderName,
						fileName: mainFileName,
						fileBase64: data.videoBase64Main,
					});
					storedPathObject.main = mainResult.path;
				}

				// Save secondary video if provided
				if (data.videoBase64Secondary === "SAVED_ON_SERVER") {
					storedPathObject.secondary = `/video_uploads/${folderName}/recording_realsense.avi`;
				} else if (
					data.videoBase64Secondary &&
					data.videoBase64Secondary.trim().length > 20
				) {
					const secondaryFileName = "recording_realsense.webm";
					const secondaryResult = yield* fileUploadService.uploadChunk({
						folderName,
						fileName: secondaryFileName,
						fileBase64: data.videoBase64Secondary,
					});
					storedPathObject.secondary = secondaryResult.path;
				}

				const storedPathString = JSON.stringify(storedPathObject);

				// Get answer scores
				const answerIds = Object.values(data.answers);
				const dbAnswers = yield* answerService.getByIds(answerIds);
				const totalScore = dbAnswers.reduce((acc, curr) => acc + curr.score, 0);

				// Upsert profile
				const profile = yield* profileService.upsertByEmail(data.userEmail, {
					name: data.userName,
					class: data.userClass,
				});

				// Create response with details
				const details = Object.entries(data.answers).map(([qId, aId]) => {
					const ans = dbAnswers.find((a) => a.id === aId);
					return {
						questionId: qId,
						answerId: aId,
						score: ans?.score || 0,
						videoSegmentPath: null,
					};
				});

				const response = yield* responseService.create(
					{
						userId: profile.id,
						questionnaireId: data.questionnaireId,
						videoPath: storedPathString,
						totalScore,
					},
					details,
				);

				return { success: true, responseId: response.id };
			}),
		);
	});
