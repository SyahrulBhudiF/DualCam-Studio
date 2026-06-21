import { NodeFileSystem } from "@effect/platform-node";
import { Layer } from "effect";
import { AnswerService } from "./answer";
import { AuthService } from "./auth";
import { DashboardService } from "./dashboard";
import { FileUploadService } from "./file-upload";
import { PredictionResultService } from "./prediction-result";
import { ProfileService } from "./profile";
import { QuestionService } from "./question";
import { QuestionnaireService } from "./questionnaire";
import { RateLimitService } from "./rate-limit";
import { ResponseService } from "./response";
import { ResultAccessService } from "./result-access";
import { VideoPredictionService } from "./video-prediction";

export { AnswerService } from "./answer";
export { AuthService } from "./auth";
export { DashboardService } from "./dashboard";
export { FileUploadService } from "./file-upload";
export { PredictionResultService } from "./prediction-result";
export { ProfileService } from "./profile";
export { QuestionService } from "./question";
export { QuestionnaireService } from "./questionnaire";
export { RateLimitService } from "./rate-limit";
export { ResponseService } from "./response";
export { ResultAccessService } from "./result-access";
export { VideoPredictionService } from "./video-prediction";

export const AllServicesLive = Layer.mergeAll(
	QuestionnaireService.layer,
	QuestionService.layer,
	AnswerService.layer,
	ProfileService.layer,
	ResponseService.layer,
	ResultAccessService.layer,
	DashboardService.layer,
	FileUploadService.layer.pipe(Layer.provide(NodeFileSystem.layer)),
	PredictionResultService.layer,
	VideoPredictionService.layer,
	AuthService.layer,
	RateLimitService.layer,
);
