import type { Effect } from "effect";
import { GrpcClientLayer } from "./client";
import type {
	PredictionRequestError,
	PredictionUnavailableError,
} from "../errors";
import type {
	PredictionHealth,
	PredictQuizRequest,
	PredictQuizResponse,
} from "../schemas/prediction";

type PredictionGrpcError = PredictionRequestError | PredictionUnavailableError;

export const PredictionGrpc = {
	health: (): Effect.Effect<
		PredictionHealth,
		PredictionGrpcError,
		GrpcClientLayer
	> => GrpcClientLayer.Service.call<PredictionHealth>("HealthCheck", {}),

	predictQuiz: (
		request: PredictQuizRequest,
	): Effect.Effect<PredictQuizResponse, PredictionGrpcError, GrpcClientLayer> =>
		GrpcClientLayer.Service.call<PredictQuizResponse>("PredictQuiz", request),
};
