export type Questionnaire = {
	id: string;
	title: string;
	description: string | null;
	isActive: boolean;
	createdAt: string;
};

export type Question = {
	id: string;
	questionnaireId: string;
	questionText: string;
	orderNumber: number | null;
	createdAt: string;
};

export type Answer = {
	id: string;
	questionId: string;
	answerText: string;
	score: number;
	createdAt: string;
};

export type CreateQuestionnaireInput = {
	title: string;
	description?: string | null;
	isActive?: boolean;
};

export type UpdateQuestionnaireInput = Partial<CreateQuestionnaireInput> & {
	id: string;
};

export type CreateQuestionInput = {
	questionnaireId: string;
	questionText: string;
	orderNumber?: number;
};

export type UpdateQuestionInput = Partial<
	Omit<CreateQuestionInput, "questionnaireId">
> & {
	id: string;
};

export type CreateAnswerInput = {
	questionId: string;
	answerText: string;
	score: number;
};

export type UpdateAnswerInput = Partial<
	Omit<CreateAnswerInput, "questionId">
> & {
	id: string;
};

export type BulkDeleteInput = {
	ids: string[];
};
