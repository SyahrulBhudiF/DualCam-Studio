import { create } from "zustand";

interface AnswerData {
	questionId: string;
	answerId: string;
	videoMainPath: string;
	videoSecPath: string;
}

interface QuestionnaireState {
	folderName: string;
	answers: Record<string, AnswerData>;
	predictionOptIn: boolean;
	setFolderName: (name: string) => void;
	setPredictionOptIn: (enabled: boolean) => void;
	addAnswer: (qId: string, data: AnswerData) => void;
	reset: () => void;
}

export const useQuestionnaireStore = create<QuestionnaireState>((set) => ({
	folderName: "",
	answers: {},
	predictionOptIn: false,
	setFolderName: (name) => set({ folderName: name }),
	setPredictionOptIn: (enabled) => set({ predictionOptIn: enabled }),
	addAnswer: (qId, data) =>
		set((state) => ({
			answers: { ...state.answers, [qId]: data },
		})),
	reset: () => set({ answers: {}, folderName: "" }),
}));
