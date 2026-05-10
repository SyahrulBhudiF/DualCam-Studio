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
import { requireAuth } from "@/utils/session";
import { inputValidator } from "../../infrastructure/schemas/validator";

// Questionnaire APIs
export const getQuestionnaires = createServerFn({ method: "GET" }).handler(
	async () => {
		return runEffect(
			Effect.gen(function* () {
				yield* requireAuth;
				const service = yield* QuestionnaireService.asEffect();
				const results = yield* service.getAll();
				return results.map((q) => ({
					...q,
					createdAt: q.createdAt.toISOString(),
				}));
			}),
		);
	},
);

export const getQuestionnaireById = createServerFn({ method: "GET" })
	.inputValidator(inputValidator(UUID))
	.handler(async ({ data: id }) => {
		return runEffect(
			Effect.gen(function* () {
				yield* requireAuth;
				const service = yield* QuestionnaireService.asEffect();
				const q = yield* service.getById(id);
				return {
					...q,
					createdAt: q.createdAt.toISOString(),
				};
			}),
		);
	});

export const createQuestionnaire = createServerFn({ method: "POST" })
	.inputValidator(inputValidator(CreateQuestionnaireSchema))
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				yield* requireAuth;
				const service = yield* QuestionnaireService.asEffect();

				return yield* service.create({
					title: data.title,
					description: data.description ?? null,
					isActive: data.isActive ?? false,
				});
			}),
		);
	});

export const updateQuestionnaire = createServerFn({ method: "POST" })
	.inputValidator(inputValidator(UpdateQuestionnaireSchema))
	.handler(async ({ data }) => {
		const { id, ...updates } = data;
		return runEffect(
			Effect.gen(function* () {
				yield* requireAuth;
				const service = yield* QuestionnaireService.asEffect();

				return yield* service.update(id, {
					title: updates.title,
					description: updates.description,
					isActive: updates.isActive,
				});
			}),
		);
	});

export const deleteQuestionnaires = createServerFn({ method: "POST" })
	.inputValidator(inputValidator(BulkDeleteSchema))
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				yield* requireAuth;
				const service = yield* QuestionnaireService.asEffect();

				return yield* service.delete([...data.ids]);
			}),
		);
	});

const _setQuestionnaireActive = createServerFn({ method: "POST" })
	.inputValidator(inputValidator(UUID))
	.handler(async ({ data: id }) => {
		return runEffect(
			Effect.gen(function* () {
				yield* requireAuth;
				const service = yield* QuestionnaireService.asEffect();

				return yield* service.setActive(id);
			}),
		);
	});

// Question APIs
export const getQuestionsByQuestionnaireId = createServerFn({ method: "GET" })
	.inputValidator(inputValidator(UUID))
	.handler(async ({ data: questionnaireId }) => {
		return runEffect(
			Effect.gen(function* () {
				yield* requireAuth;
				const service = yield* QuestionService.asEffect();
				const results = yield* service.getByQuestionnaireId(questionnaireId);

				return results.map((q) => ({
					...q,
					createdAt: q.createdAt.toISOString(),
				}));
			}),
		);
	});

export const getQuestionById = createServerFn({ method: "GET" })
	.inputValidator(inputValidator(UUID))
	.handler(async ({ data: id }) => {
		return runEffect(
			Effect.gen(function* () {
				yield* requireAuth;
				const service = yield* QuestionService.asEffect();
				const q = yield* service.getById(id);

				return {
					...q,
					createdAt: q.createdAt.toISOString(),
				};
			}),
		);
	});

export const createQuestion = createServerFn({ method: "POST" })
	.inputValidator(inputValidator(CreateQuestionSchema))
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				yield* requireAuth;
				const service = yield* QuestionService.asEffect();

				return yield* service.create({
					questionnaireId: data.questionnaireId,
					questionText: data.questionText,
					orderNumber: data.orderNumber,
				});
			}),
		);
	});

export const updateQuestion = createServerFn({ method: "POST" })
	.inputValidator(inputValidator(UpdateQuestionSchema))
	.handler(async ({ data }) => {
		const { id, ...updates } = data;
		return runEffect(
			Effect.gen(function* () {
				yield* requireAuth;
				const service = yield* QuestionService.asEffect();

				return yield* service.update(id, {
					questionText: updates.questionText,
					orderNumber: updates.orderNumber,
				});
			}),
		);
	});

export const deleteQuestions = createServerFn({ method: "POST" })
	.inputValidator(inputValidator(BulkDeleteSchema))
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				yield* requireAuth;
				const service = yield* QuestionService.asEffect();

				return yield* service.delete([...data.ids]);
			}),
		);
	});

// Answer APIs
export const getAnswersByQuestionId = createServerFn({ method: "GET" })
	.inputValidator(inputValidator(UUID))
	.handler(async ({ data: questionId }) => {
		return runEffect(
			Effect.gen(function* () {
				yield* requireAuth;
				const service = yield* AnswerService.asEffect();
				const results = yield* service.getByQuestionId(questionId);

				return results.map((a) => ({
					...a,
					createdAt: a.createdAt.toISOString(),
				}));
			}),
		);
	});

export const createAnswer = createServerFn({ method: "POST" })
	.inputValidator(inputValidator(CreateAnswerSchema))
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				yield* requireAuth;
				const service = yield* AnswerService.asEffect();

				return yield* service.create({
					questionId: data.questionId,
					answerText: data.answerText,
					score: data.score,
				});
			}),
		);
	});

export const updateAnswer = createServerFn({ method: "POST" })
	.inputValidator(inputValidator(UpdateAnswerSchema))
	.handler(async ({ data }) => {
		const { id, ...updates } = data;
		return runEffect(
			Effect.gen(function* () {
				yield* requireAuth;
				const service = yield* AnswerService.asEffect();

				return yield* service.update(id, {
					answerText: updates.answerText,
					score: updates.score,
				});
			}),
		);
	});

export const deleteAnswers = createServerFn({ method: "POST" })
	.inputValidator(inputValidator(BulkDeleteSchema))
	.handler(async ({ data }) => {
		return runEffect(
			Effect.gen(function* () {
				yield* requireAuth;
				const service = yield* AnswerService.asEffect();

				return yield* service.delete([...data.ids]);
			}),
		);
	});
