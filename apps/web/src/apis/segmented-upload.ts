import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import {
	AnswerService,
	ProfileService,
	ResponseService,
	ResultAccessService,
	runEffect,
} from "@/infrastructure";
import { FinalSubmitSchema, inputValidator } from "@/infrastructure/schemas";
import { verifyCsrfOrigin } from "@/utils/csrf";

export const submitSegmentedResponse = createServerFn({ method: "POST" })
	.inputValidator(inputValidator(FinalSubmitSchema))
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				yield* verifyCsrfOrigin;

				const answerService = yield* AnswerService.asEffect();
				const profileService = yield* ProfileService.asEffect();
				const responseService = yield* ResponseService.asEffect();
				const resultAccessService = yield* ResultAccessService.asEffect();

				// Upsert profile with all fields
				const profile = yield* profileService.upsertByEmail(data.userEmail, {
					name: data.userName,
					class: data.userClass,
					semester: data.userSemester ?? null,
					nim: data.userNim ?? null,
					gender: data.userGender ?? null,
					age: data.userAge ?? null,
				});

				// Get answer scores
				const answerIds = data.answers.map((a) => a.answerId);
				const dbAnswers = yield* answerService.getByIds(answerIds);
				const totalScore = dbAnswers.reduce((acc, curr) => acc + curr.score, 0);

				// Create response details
				const details = data.answers.map((ans) => {
					const score =
						dbAnswers.find((d) => d.id === ans.answerId)?.score || 0;
					const videoJson = JSON.stringify({
						main: ans.videoMainPath ?? null,
						secondary: ans.videoSecPath ?? null,
					});

					return {
						questionId: ans.questionId,
						answerId: ans.answerId,
						score,
						videoSegmentPath: videoJson,
					};
				});

				// Create response
				const response = yield* responseService.create(
					{
						userId: profile.id,
						questionnaireId: data.questionnaireId,
						videoPath: data.folderName,
						totalScore,
					},
					details,
				);

				const resultAccess = yield* resultAccessService.createForResponse(
					response.id,
					{ predictionOptIn: data.predictionOptIn ?? false },
				);

				return {
					resultToken: resultAccess.token,
					responseId: response.id,
					success: true,
				};
			}),
		);
	});
