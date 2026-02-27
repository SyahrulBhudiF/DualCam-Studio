import { Layer } from "effect";
import { NodeFileSystem } from "@effect/platform-node";
import { AnswerService } from "./answer";
import { AuthService } from "./auth";
import { DashboardService } from "./dashboard";
import { FileUploadService } from "./file-upload";
import { ProfileService } from "./profile";
import { QuestionService } from "./question";
import { QuestionnaireService } from "./questionnaire";
import { RateLimitService } from "./rate-limit";
import { ResponseService } from "./response";

export { AnswerService } from "./answer";
export { AuthService } from "./auth";
export { DashboardService } from "./dashboard";
export { FileUploadService } from "./file-upload";
export { ProfileService } from "./profile";
export { QuestionService } from "./question";
export { QuestionnaireService } from "./questionnaire";
export { RateLimitService } from "./rate-limit";
export { ResponseService } from "./response";

export const AllServicesLive = Layer.mergeAll(
	QuestionnaireService.Default,
	QuestionService.Default,
	AnswerService.Default,
	ProfileService.Default,
	ResponseService.Default,
	DashboardService.Default,
	FileUploadService.Default.pipe(Layer.provide(NodeFileSystem.layer)),
	AuthService.Default,
	RateLimitService.Default,
);
