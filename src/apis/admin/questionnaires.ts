import { Effect } from "effect";
import { createServerFn } from "@tanstack/react-start";
import { Schema } from "@effect/schema";
import {
	AnswerService,
	QuestionnaireService,
	QuestionService,
	runEffect,
} from "@/infrastructure";

// Input schemas using Effect Schema
const UuidSchema = Schema.UUID;

const CreateQuestionnaireInput = Schema.Struct({
	title: Schema.String,
	description: Schema.optional(Schema.String),
	isActive: Schema.optional(Schema.Boolean),
});

const UpdateQuestionnaireInput = Schema.Struct({
	id: Schema.UUID,
	title: Schema.optional(Schema.String),
	description: Schema.optional(Schema.String),
	isActive: Schema.optional(Schema.Boolean),
});

const BulkDeleteInput = Schema.Struct({
	ids: Schema.mutable(Schema.Array(Schema.UUID)),
});

const CreateQuestionInput = Schema.Struct({
	questionnaireId: Schema.UUID,
	questionText: Schema.String,
	orderNumber: Schema.Number,
});

const UpdateQuestionInput = Schema.Struct({
	id: Schema.UUID,
	questionText: Schema.optional(Schema.String),
	orderNumber: Schema.optional(Schema.Number),
});

const CreateAnswerInput = Schema.Struct({
	questionId: Schema.UUID,
	answerText: Schema.String,
	score: Schema.Number,
});

const UpdateAnswerInput = Schema.Struct({
	id: Schema.UUID,
	answerText: Schema.optional(Schema.String),
	score: Schema.optional(Schema.Number),
});

// Questionnaire APIs
export const getQuestionnaires = createServerFn({ method: "GET" }).handler(
	async () => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				const results = yield* service.getAll;
				return results.map((q) => ({
					...q,
					createdAt: q.createdAt.toISOString(),
				}));
			}),
		);
	},
);

export const getQuestionnaireById = createServerFn({ method: "GET" })
	.inputValidator((id: string) => Schema.decodeUnknownSync(UuidSchema)(id))
	.handler(async ({ data: id }) => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				const q = yield* service.getById(id);
				return {
					...q,
					createdAt: q.createdAt.toISOString(),
				};
			}),
		);
	});

export const createQuestionnaire = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) =>
		Schema.decodeUnknownSync(CreateQuestionnaireInput)(input),
	)
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				return yield* service.create({
					title: data.title,
					description: data.description ?? null,
					isActive: data.isActive ?? false,
				});
			}),
		);
	});

export const updateQuestionnaire = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) =>
		Schema.decodeUnknownSync(UpdateQuestionnaireInput)(input),
	)
	.handler(async ({ data }) => {
		const { id, ...updates } = data;
		return runEffect(
			Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				return yield* service.update(id, {
					title: updates.title,
					description: updates.description,
					isActive: updates.isActive,
				});
			}),
		);
	});

export const deleteQuestionnaires = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) =>
		Schema.decodeUnknownSync(BulkDeleteInput)(input),
	)
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				return yield* service.delete(data.ids);
			}),
		);
	});

export const setQuestionnaireActive = createServerFn({ method: "POST" })
	.inputValidator((id: string) => Schema.decodeUnknownSync(UuidSchema)(id))
	.handler(async ({ data: id }) => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* QuestionnaireService;
				return yield* service.setActive(id);
			}),
		);
	});

// Question APIs
export const getQuestionsByQuestionnaireId = createServerFn({ method: "GET" })
	.inputValidator((questionnaireId: string) =>
		Schema.decodeUnknownSync(UuidSchema)(questionnaireId),
	)
	.handler(async ({ data: questionnaireId }) => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* QuestionService;
				const results = yield* service.getByQuestionnaireId(questionnaireId);
				return results.map((q) => ({
					...q,
					createdAt: new Date().toISOString(),
				}));
			}),
		);
	});

export const getQuestionById = createServerFn({ method: "GET" })
	.inputValidator((id: string) => Schema.decodeUnknownSync(UuidSchema)(id))
	.handler(async ({ data: id }) => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* QuestionService;
				const q = yield* service.getById(id);
				return {
					...q,
					createdAt: new Date().toISOString(),
				};
			}),
		);
	});

export const createQuestion = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) =>
		Schema.decodeUnknownSync(CreateQuestionInput)(input),
	)
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* QuestionService;
				return yield* service.create({
					questionnaireId: data.questionnaireId,
					questionText: data.questionText,
					orderNumber: data.orderNumber,
				});
			}),
		);
	});

export const updateQuestion = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) =>
		Schema.decodeUnknownSync(UpdateQuestionInput)(input),
	)
	.handler(async ({ data }) => {
		const { id, ...updates } = data;
		return runEffect(
			Effect.gen(function* () {
				const service = yield* QuestionService;
				return yield* service.update(id, {
					questionText: updates.questionText,
					orderNumber: updates.orderNumber,
				});
			}),
		);
	});

export const deleteQuestions = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) =>
		Schema.decodeUnknownSync(BulkDeleteInput)(input),
	)
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* QuestionService;
				return yield* service.delete(data.ids);
			}),
		);
	});

// Answer APIs
export const getAnswersByQuestionId = createServerFn({ method: "GET" })
	.inputValidator((questionId: string) =>
		Schema.decodeUnknownSync(UuidSchema)(questionId),
	)
	.handler(async ({ data: questionId }) => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* AnswerService;
				const results = yield* service.getByQuestionId(questionId);
				return results.map((a) => ({
					...a,
					createdAt: new Date().toISOString(),
				}));
			}),
		);
	});

export const createAnswer = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) =>
		Schema.decodeUnknownSync(CreateAnswerInput)(input),
	)
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* AnswerService;
				return yield* service.create({
					questionId: data.questionId,
					answerText: data.answerText,
					score: data.score,
				});
			}),
		);
	});

export const updateAnswer = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) =>
		Schema.decodeUnknownSync(UpdateAnswerInput)(input),
	)
	.handler(async ({ data }) => {
		const { id, ...updates } = data;
		return runEffect(
			Effect.gen(function* () {
				const service = yield* AnswerService;
				return yield* service.update(id, {
					answerText: updates.answerText,
					score: updates.score,
				});
			}),
		);
	});

export const deleteAnswers = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) =>
		Schema.decodeUnknownSync(BulkDeleteInput)(input),
	)
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* AnswerService;
				return yield* service.delete(data.ids);
			}),
		);
	});
