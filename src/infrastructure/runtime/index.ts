import { type Effect, Layer, ManagedRuntime } from "effect";
import { DrizzleLive } from "../layers/database";
import {
	AllServicesLive,
	AnswerService,
	AuthService,
	DashboardService,
	FileUploadService,
	ProfileService,
	QuestionnaireService,
	QuestionService,
	ResponseService,
} from "../services";

// Combined layer with database and all services
export const AppLayer = AllServicesLive.pipe(Layer.provide(DrizzleLive));

// Managed runtime for server functions
export const AppRuntime = ManagedRuntime.make(AppLayer);

// Helper function to run an Effect with the app runtime
export const runEffect = <A, E>(
	effect: Effect.Effect<
		A,
		E,
		| QuestionnaireService
		| QuestionService
		| AnswerService
		| ProfileService
		| ResponseService
		| DashboardService
		| FileUploadService
		| AuthService
	>,
): Promise<A> => AppRuntime.runPromise(effect);

// Helper function to run an Effect and get Exit result
export const runEffectExit = <A, E>(
	effect: Effect.Effect<
		A,
		E,
		| QuestionnaireService
		| QuestionService
		| AnswerService
		| ProfileService
		| ResponseService
		| DashboardService
		| FileUploadService
		| AuthService
	>,
) => AppRuntime.runPromiseExit(effect);

// Export service getters for convenience
export const getQuestionnaireService = () =>
	runEffect(QuestionnaireService);

export const getQuestionService = () =>
	runEffect(QuestionService);

export const getAnswerService = () =>
	runEffect(AnswerService);

export const getProfileService = () =>
	runEffect(ProfileService);

export const getResponseService = () =>
	runEffect(ResponseService);

export const getDashboardService = () =>
	runEffect(DashboardService);

export const getFileUploadService = () =>
	runEffect(FileUploadService);

export const getAuthService = () =>
	runEffect(AuthService);
