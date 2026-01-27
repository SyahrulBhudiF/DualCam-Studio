import { Effect } from "effect";
import { createServerFn } from "@tanstack/react-start";
import { Schema } from "@effect/schema";
import {
	AnswerService,
	FileUploadService,
	ProfileService,
	ResponseService,
	runEffect,
} from "@/infrastructure";

const UploadChunkInput = Schema.Struct({
	folderName: Schema.String,
	fileName: Schema.String,
	fileBase64: Schema.String,
});

const AnswerSubmission = Schema.Struct({
	questionId: Schema.UUID,
	answerId: Schema.UUID,
	videoMainPath: Schema.optional(Schema.String),
	videoSecPath: Schema.optional(Schema.String),
});

const FinalSubmitInput = Schema.Struct({
	questionnaireId: Schema.UUID,
	userEmail: Schema.String,
	userName: Schema.String,
	userClass: Schema.String,
	userSemester: Schema.optional(Schema.String),
	userNim: Schema.optional(Schema.String),
	userGender: Schema.optional(Schema.String),
	userAge: Schema.optional(Schema.Number),
	folderName: Schema.String,
	answers: Schema.Array(AnswerSubmission),
});

export const uploadVideoChunk = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) =>
		Schema.decodeUnknownSync(UploadChunkInput)(data),
	)
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* FileUploadService;
				return yield* service.uploadChunk({
					folderName: data.folderName,
					fileName: data.fileName,
					fileBase64: data.fileBase64,
				});
			}),
		);
	});

export const submitSegmentedResponse = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) =>
		Schema.decodeUnknownSync(FinalSubmitInput)(data),
	)
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				const answerService = yield* AnswerService;
				const profileService = yield* ProfileService;
				const responseService = yield* ResponseService;

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
				const totalScore = dbAnswers.reduce(
					(acc, curr) => acc + curr.score,
					0,
				);

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

				return { success: true, responseId: response.id };
			}),
		);
	});
