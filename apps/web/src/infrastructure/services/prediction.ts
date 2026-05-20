import { Context, Effect, Layer } from "effect";
import { GrpcClientLayer, GrpcClientLive } from "../layers/grpc-client";
import type {
	PredictionHealth,
	PredictQuizRequest,
	PredictQuizResponse,
} from "../schemas/prediction";

export class PredictionService extends Context.Service<PredictionService>()(
	"PredictionService",
	{
		make: Effect.gen(function* () {
			const grpc = yield* GrpcClientLayer;

			const health = Effect.fn("PredictionService.health")(function* () {
				return yield* grpc.call<PredictionHealth>("HealthCheck", {});
			});

			const predictQuiz = Effect.fn("PredictionService.predictQuiz")(
				function* (request: PredictQuizRequest) {
					return yield* grpc.call<PredictQuizResponse>("PredictQuiz", request);
				},
			);

			return { health, predictQuiz };
		}),
	},
) {
	static readonly layer = Layer.effect(this, this.make).pipe(
		Layer.provide(GrpcClientLive),
	);
}
