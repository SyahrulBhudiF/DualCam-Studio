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
