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
  setFolderName: (name: string) => void;
  addAnswer: (qId: string, data: AnswerData) => void;
  reset: () => void;
}

export const useQuestionnaireStore = create<QuestionnaireState>((set) => ({
  folderName: "",
  answers: {},
  setFolderName: (name) => set({ folderName: name }),
  addAnswer: (qId, data) =>
    set((state) => ({
      answers: { ...state.answers, [qId]: data },
    })),
  reset: () => set({ folderName: "", answers: {} }),
}));
