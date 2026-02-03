import { Schema } from "@effect/schema";
import { createServerFn } from "@tanstack/react-start";
import { Effect } from "effect";
import {
	AnswerService,
	QuestionnaireService,
	QuestionService,
	runEffect,
} from "@/infrastructure";
import {
	BulkDeleteSchema,
	CreateAnswerSchema,
	CreateQuestionnaireSchema,
	CreateQuestionSchema,
	UpdateAnswerSchema,
	UpdateQuestionnaireSchema,
	UpdateQuestionSchema,
	UUID,
} from "@/infrastructure/schemas/questionnaire";

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
	.inputValidator(Schema.decodeUnknownSync(UUID))
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
	.inputValidator(Schema.decodeUnknownSync(CreateQuestionnaireSchema))
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
	.inputValidator(Schema.decodeUnknownSync(UpdateQuestionnaireSchema))
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
	.inputValidator(Schema.decodeUnknownSync(BulkDeleteSchema))
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* QuestionnaireService;

				return yield* service.delete(data.ids);
			}),
		);
	});

export const setQuestionnaireActive = createServerFn({ method: "POST" })
	.inputValidator(Schema.decodeUnknownSync(UUID))
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
	.inputValidator(Schema.decodeUnknownSync(UUID))
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
	.inputValidator(Schema.decodeUnknownSync(UUID))
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
	.inputValidator(Schema.decodeUnknownSync(CreateQuestionSchema))
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
	.inputValidator(Schema.decodeUnknownSync(UpdateQuestionSchema))
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
	.inputValidator(Schema.decodeUnknownSync(BulkDeleteSchema))
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
	.inputValidator(Schema.decodeUnknownSync(UUID))
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
	.inputValidator(Schema.decodeUnknownSync(CreateAnswerSchema))
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
	.inputValidator(Schema.decodeUnknownSync(UpdateAnswerSchema))
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
	.inputValidator(Schema.decodeUnknownSync(BulkDeleteSchema))
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				const service = yield* AnswerService;

				return yield* service.delete(data.ids);
			}),
		);
	});
