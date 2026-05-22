import { beforeEach, describe, expect, it } from "vitest";
import { useQuestionnaireStore } from "@/libs/store/QuestionnaireStore";

const initialState = useQuestionnaireStore.getInitialState();

describe("useQuestionnaireStore", () => {
	beforeEach(() => {
		useQuestionnaireStore.setState(initialState, true);
	});

	it("keeps prediction opt-in when resetting questionnaire session data", () => {
		const store = useQuestionnaireStore.getState();

		store.setPredictionOptIn(true);
		store.setFolderName("segmented/test");
		store.addAnswer("question-id", {
			questionId: "question-id",
			answerId: "answer-id",
			videoMainPath: "/video_uploads/main.webm",
			videoSecPath: "/video_uploads/sec.avi",
		});

		useQuestionnaireStore.getState().reset();

		expect(useQuestionnaireStore.getState()).toMatchObject({
			answers: {},
			folderName: "",
			predictionOptIn: true,
		});
	});
});
