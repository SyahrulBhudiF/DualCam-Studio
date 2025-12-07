export type Questionnaire = {
	id: string;
	title: string;
	description: string | null;
	is_active: boolean;
	created_at: string;
};

export type Question = {
	id: string;
	questionnaire_id: string;
	question_text: string;
	order_number: number | null;
	created_at: string;
};

export type Answer = {
	id: string;
	question_id: string;
	answer_text: string;
	score: number;
	created_at: string;
};

export type CreateQuestionnaireInput = {
	title: string;
	description?: string | null;
	is_active?: boolean;
};

export type UpdateQuestionnaireInput = Partial<CreateQuestionnaireInput> & {
	id: string;
};

export type CreateQuestionInput = {
	questionnaire_id: string;
	question_text: string;
	order_number?: number;
};

export type UpdateQuestionInput = Partial<
	Omit<CreateQuestionInput, "questionnaire_id">
> & {
	id: string;
};

export type CreateAnswerInput = {
	question_id: string;
	answer_text: string;
	score: number;
};

export type UpdateAnswerInput = Partial<
	Omit<CreateAnswerInput, "question_id">
> & {
	id: string;
};

export type BulkDeleteInput = {
	ids: string[];
};
