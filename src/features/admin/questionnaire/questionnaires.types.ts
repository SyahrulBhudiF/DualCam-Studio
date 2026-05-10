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

type CreateQuestionnaireInput = {
	title: string;
	description?: string | null;
	isActive?: boolean;
};

type UpdateQuestionnaireInput = Partial<CreateQuestionnaireInput> & {
	id: string;
};

type CreateQuestionInput = {
	questionnaireId: string;
	questionText: string;
	orderNumber?: number;
};

type UpdateQuestionInput = Partial<
	Omit<CreateQuestionInput,"questionnaireId">
> & {
	id: string;
};

type CreateAnswerInput = {
	questionId: string;
	answerText: string;
	score: number;
};

type UpdateAnswerInput = Partial<Omit<CreateAnswerInput,"questionId">> & {
	id: string;
};

type BulkDeleteInput = {
	ids: string[];
};
