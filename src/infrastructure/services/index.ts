import { Layer } from "effect";
import { AnswerServiceLive } from "./answer";
import { AuthServiceLive } from "./auth";
import { DashboardServiceLive } from "./dashboard";
import { FileUploadServiceLive } from "./file-upload";
import { ProfileServiceLive } from "./profile";
import { QuestionServiceLive } from "./question";
import { QuestionnaireServiceLive } from "./questionnaire";
import { RateLimitServiceLive } from "./rate-limit";
import { ResponseServiceLive } from "./response";

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
	QuestionnaireServiceLive,
	QuestionServiceLive,
	AnswerServiceLive,
	ProfileServiceLive,
	ResponseServiceLive,
	DashboardServiceLive,
	FileUploadServiceLive,
	AuthServiceLive,
	RateLimitServiceLive,
);
