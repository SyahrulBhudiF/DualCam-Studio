import { Effect } from "effect";
import { createServerFn } from "@tanstack/react-start";
import { Schema } from "@effect/schema";
import {
	ProfileService,
	QuestionnaireService,
	ResponseService,
	runEffect,
} from "@/infrastructure";

const UuidSchema = Schema.UUID;

const BulkDeleteInput = Schema.Struct({
	ids: Schema.mutable(Schema.Array(Schema.UUID)),
});

const ResponseFilterInput = Schema.Struct({
	questionnaireId: Schema.optional(Schema.UUID),
	className: Schema.optional(Schema.String),
	startDate: Schema.optional(Schema.String),
	endDate: Schema.optional(Schema.String),
	name: Schema.optional(Schema.String),
});

export const getResponses = createServerFn({ method: "GET" }).handler(
	async () => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* ResponseService;
				const responses = yield* service.getAll;
				return responses.map((r) => ({
					id: r.id,
					totalScore: r.totalScore,
					videoPath: r.videoPath,
					createdAt: r.createdAt.toISOString(),
					questionnaireId: r.questionnaireId,
					questionnaireTitle: r.questionnaire?.title ?? null,
					profile: r.profile
						? {
								id: r.profile.id,
								name: r.profile.name,
								class: r.profile.class,
								email: r.profile.email,
								nim: r.profile.nim,
								semester: r.profile.semester,
								gender: r.profile.gender,
								age: r.profile.age,
							}
						: null,
				}));
			}),
		);
	},
);

export const getResponseById = createServerFn({ method: "GET" })
	.inputValidator((id: string) => Schema.decodeUnknownSync(UuidSchema)(id))
	.handler(async ({ data: id }) => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* ResponseService;
				const r = yield* service.getById(id);
				return {
					id: r.id,
					totalScore: r.totalScore,
					videoPath: r.videoPath,
					createdAt: r.createdAt.toISOString(),
					questionnaire: r.questionnaire
						? {
								id: r.questionnaire.id,
								title: r.questionnaire.title,
								description: r.questionnaire.description,
							}
						: null,
					profile: r.profile
						? {
								id: r.profile.id,
								name: r.profile.name,
								class: r.profile.class,
								email: r.profile.email,
								nim: r.profile.nim,
								semester: r.profile.semester,
								gender: r.profile.gender,
								age: r.profile.age,
							}
						: null,
					details: r.details.map((d) => {
						// Convert jsonb videoSegmentPath to string
						let videoSegmentPath: string | null = null;
						if (d.videoSegmentPath != null) {
							if (typeof d.videoSegmentPath === "string") {
								videoSegmentPath = d.videoSegmentPath;
							} else if (typeof d.videoSegmentPath === "object") {
								videoSegmentPath = JSON.stringify(d.videoSegmentPath);
							}
						}
						return {
							id: d.id,
							questionId: d.questionId,
							answerId: d.answerId,
							score: d.score,
							videoSegmentPath,
							questionText: d.questionText,
							orderNumber: d.orderNumber,
							answerText: d.answerText,
							maxScore: d.score,
						};
					}),
				};
			}),
		);
	});

export const getResponsesByQuestionnaireId = createServerFn({ method: "GET" })
	.inputValidator((questionnaireId: string) =>
		Schema.decodeUnknownSync(UuidSchema)(questionnaireId),
	)
	.handler(async ({ data: questionnaireId }) => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* ResponseService;
				const responses = yield* service.getByQuestionnaireId(questionnaireId);
				return responses.map((r) => ({
					id: r.id,
					totalScore: r.totalScore,
					videoPath: r.videoPath,
					createdAt: r.createdAt.toISOString(),
					profile: r.profile
						? {
								id: r.profile.id,
								name: r.profile.name,
								class: r.profile.class,
								email: r.profile.email,
								nim: r.profile.nim,
								semester: r.profile.semester,
								gender: r.profile.gender,
								age: r.profile.age,
							}
						: null,
				}));
			}),
		);
	});

export const deleteResponses = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) =>
		Schema.decodeUnknownSync(BulkDeleteInput)(input),
	)
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* ResponseService;
				return yield* service.delete(data.ids);
			}),
		);
	});

export const getResponsesFiltered = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) =>
		Schema.decodeUnknownSync(ResponseFilterInput)(input),
	)
	.handler(async ({ data: filters }) => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* ResponseService;
				const responses = yield* service.getFiltered({
					questionnaireId: filters.questionnaireId,
					className: filters.className,
					name: filters.name,
					startDate: filters.startDate,
					endDate: filters.endDate,
				});
				return responses.map((r) => ({
					id: r.id,
					totalScore: r.totalScore,
					videoPath: r.videoPath,
					createdAt: r.createdAt.toISOString(),
					questionnaireId: r.questionnaireId,
					questionnaireTitle: r.questionnaire?.title ?? null,
					profile: r.profile
						? {
								id: r.profile.id,
								name: r.profile.name,
								class: r.profile.class,
								email: r.profile.email,
								nim: r.profile.nim,
								semester: r.profile.semester,
								gender: r.profile.gender,
								age: r.profile.age,
							}
						: null,
				}));
			}),
		);
	});

export const getAllResponsesWithDetails = createServerFn({
	method: "GET",
}).handler(async () => {
	return runEffect(
		Effect.gen(function* () {
			const service = yield* ResponseService;
			const responses = yield* service.getAllWithDetails;
			return responses.map((r) => ({
				id: r.id,
				totalScore: r.totalScore,
				videoPath: r.videoPath,
				createdAt: r.createdAt.toISOString(),
				questionnaireTitle: r.questionnaire?.title ?? null,
				profile: r.profile
					? {
							name: r.profile.name,
							class: r.profile.class,
							email: r.profile.email,
							nim: r.profile.nim,
							semester: r.profile.semester,
							gender: r.profile.gender,
							age: r.profile.age,
						}
					: null,
				details: r.details
					.map((d) => ({
						questionText: d.questionText,
						orderNumber: d.orderNumber,
						answerText: d.answerText,
						score: d.score,
					}))
					.sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0)),
			}));
		}),
	);
});

export const getFilterOptions = createServerFn({ method: "GET" }).handler(
	async () => {
		return runEffect(
			Effect.gen(function* () {
				const questionnaireService = yield* QuestionnaireService;
				const profileService = yield* ProfileService;

				const [questionnaires, profiles, uniqueClasses] = yield* Effect.all([
					questionnaireService.getAll,
					profileService.getAll,
					profileService.getUniqueClasses,
				]);

				return {
					questionnaires: questionnaires.map((q) => ({
						id: q.id,
						title: q.title,
					})),
					classes: uniqueClasses,
					names: profiles
						.map((p) => p.name)
						.filter((n): n is string => typeof n === "string"),
				};
			}),
		);
	},
);
