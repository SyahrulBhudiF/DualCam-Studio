import { Layer } from "effect";
import { AnswerService, AnswerServiceLive } from "./answer";
import { AuthService, AuthServiceLive } from "./auth";
import { DashboardService, DashboardServiceLive } from "./dashboard";
import { FileUploadService, FileUploadServiceLive } from "./file-upload";
import { ProfileService, ProfileServiceLive } from "./profile";
import { QuestionService, QuestionServiceLive } from "./question";
import {
	QuestionnaireService,
	QuestionnaireServiceLive,
} from "./questionnaire";
import { ResponseService, ResponseServiceLive } from "./response";

export type { IAnswerService } from "./answer";
// Re-export services
export { AnswerService, AnswerServiceLive } from "./answer";
export type { IAuthService } from "./auth";
export { AuthService, AuthServiceLive } from "./auth";
export type {
	AnalyticsDetails,
	AnswerStats,
	ClassStats,
	DashboardBreakdown,
	DashboardSummary,
	IDashboardService,
	QuestionnaireStats,
	QuestionStats,
	TimelineEntry,
} from "./dashboard";
export { DashboardService, DashboardServiceLive } from "./dashboard";
export type { IFileUploadService } from "./file-upload";
export { FileUploadService, FileUploadServiceLive } from "./file-upload";
export type { IProfileService } from "./profile";
export { ProfileService, ProfileServiceLive } from "./profile";
export type { IQuestionService } from "./question";
export { QuestionService, QuestionServiceLive } from "./question";
export type { IQuestionnaireService } from "./questionnaire";
export {
	QuestionnaireService,
	QuestionnaireServiceLive,
} from "./questionnaire";
export type {
	IResponseService,
	ResponseDetail,
	ResponseFilter,
	ResponseFull,
	ResponseWithProfile,
} from "./response";
export { ResponseService, ResponseServiceLive } from "./response";

// Combined layer for all services
export const AllServicesLive = Layer.mergeAll(
	QuestionnaireServiceLive,
	QuestionServiceLive,
	AnswerServiceLive,
	ProfileServiceLive,
	ResponseServiceLive,
	DashboardServiceLive,
	FileUploadServiceLive,
	AuthServiceLive,
);
