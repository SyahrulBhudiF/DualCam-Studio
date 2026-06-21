import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type {
	answers,
	predictionResults,
	profiles,
	videoPredictionEvents,
	videoPredictions,
	questionnaires,
	questions,
	responseDetails,
	responseResultAccess,
	responses,
	sessions,
	users,
} from "./schema";

export type Questionnaire = InferSelectModel<typeof questionnaires>;
export type Question = InferSelectModel<typeof questions>;
export type Answer = InferSelectModel<typeof answers>;
export type PredictionResult = InferSelectModel<typeof predictionResults>;
export type VideoPrediction = InferSelectModel<typeof videoPredictions>;
export type VideoPredictionEvent = InferSelectModel<typeof videoPredictionEvents>;
export type Profile = InferSelectModel<typeof profiles>;
export type Response = InferSelectModel<typeof responses>;
export type ResponseResultAccess = InferSelectModel<
	typeof responseResultAccess
>;
export type User = InferSelectModel<typeof users>;
export type Session = InferSelectModel<typeof sessions>;

export type NewQuestionnaire = InferInsertModel<typeof questionnaires>;
export type NewQuestion = InferInsertModel<typeof questions>;
export type NewAnswer = InferInsertModel<typeof answers>;
export type NewPredictionResult = InferInsertModel<typeof predictionResults>;
export type NewVideoPrediction = InferInsertModel<typeof videoPredictions>;
export type NewVideoPredictionEvent = InferInsertModel<typeof videoPredictionEvents>;
export type NewProfile = InferInsertModel<typeof profiles>;
export type NewResponse = InferInsertModel<typeof responses>;
export type NewResponseResultAccess = InferInsertModel<
	typeof responseResultAccess
>;
export type NewResponseDetail = InferInsertModel<typeof responseDetails>;
export type NewUser = InferInsertModel<typeof users>;
export type NewSession = InferInsertModel<typeof sessions>;
