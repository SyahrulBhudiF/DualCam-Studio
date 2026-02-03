import { type Effect, Layer, ManagedRuntime } from "effect";
import { DrizzleLive } from "../layers/database";
import {
	AllServicesLive,
	type AnswerService,
	type AuthService,
	type DashboardService,
	type FileUploadService,
	type ProfileService,
	type QuestionnaireService,
	type QuestionService,
	type ResponseService,
} from "../services";

const AppLayer = AllServicesLive.pipe(Layer.provide(DrizzleLive));

const AppRuntime = ManagedRuntime.make(AppLayer);

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
