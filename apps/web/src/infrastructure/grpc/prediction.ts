import { Effect } from "effect";
import { GrpcClientLayer } from "./client";
import type {
	PredictionRequestError,
	PredictionUnavailableError,
} from "../errors";
import type {
	PredictionHealth,
	PredictQuizRequest,
	PredictQuizResponse,
	PredictVideoRequest,
	PredictVideoResponse,
} from "../schemas/prediction";

type PredictionGrpcError = PredictionRequestError | PredictionUnavailableError;

export const PredictionGrpc = {
	health: (): Effect.Effect<
		PredictionHealth,
		PredictionGrpcError,
		GrpcClientLayer
	> =>
		GrpcClientLayer.asEffect().pipe(
			Effect.flatMap((client) =>
				client.call<PredictionHealth>("healthCheck", {}),
			),
		),

	predictQuiz: (
		request: PredictQuizRequest,
	): Effect.Effect<PredictQuizResponse, PredictionGrpcError, GrpcClientLayer> =>
		GrpcClientLayer.asEffect().pipe(
			Effect.flatMap((client) =>
				client.call<PredictQuizResponse>("predictQuiz", request),
			),
		),

	predictVideo: (
		request: PredictVideoRequest,
	): Effect.Effect<PredictVideoResponse, PredictionGrpcError, GrpcClientLayer> =>
		GrpcClientLayer.asEffect().pipe(
			Effect.flatMap((client) =>
				client.call<PredictVideoResponse>("predictVideo", request),
			),
		),
};
