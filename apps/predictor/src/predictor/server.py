import asyncio
import signal
from collections.abc import Sequence
from typing import Any, cast

import grpc
from grpc_health.v1 import (  # pyright: ignore[reportMissingTypeStubs]
    health,
    health_pb2,
    health_pb2_grpc,
)
from grpc_reflection.v1alpha import reflection

from predictor.artifacts import resolve_artifacts
from predictor.config import PredictorSettings
from predictor.generated.prediction.v1 import (  # pyright: ignore[reportMissingTypeStubs]
    prediction_pb2,
    prediction_pb2_grpc,
)
from predictor.model import Bundle, load_bundle
from predictor.predict import PredictError, failed_video, resolve_video, validate_request
from predictor.runtime import PredictionRuntime, RuntimeConfig, make_ref

Svc = prediction_pb2.DESCRIPTOR.services_by_name["PredictionService"]
add_pred = cast(
    Any,
    prediction_pb2_grpc.add_PredictionServiceServicer_to_server,  # pyright: ignore[reportUnknownMemberType]
)
add_health = cast(
    Any,
    health_pb2_grpc.add_HealthServicer_to_server,  # pyright: ignore[reportUnknownMemberType]
)
health_aio = cast(Any, health).aio


class PredictionService(prediction_pb2_grpc.PredictionServiceServicer):
    def __init__(
        self,
        settings: PredictorSettings,
        bundle: Bundle,
        runtime: PredictionRuntime | None = None,
    ) -> None:
        self.settings = settings
        self.bundle = bundle
        self.runtime = runtime or PredictionRuntime(
            bundle,
            bundle.feat_cols,
            RuntimeConfig(threshold=settings.threshold, aggregation=settings.aggregation),
        )

    async def HealthCheck(
        self,
        request: prediction_pb2.HealthCheckRequest,
        context: grpc.aio.ServicerContext[Any, Any],
    ) -> prediction_pb2.HealthCheckResponse:
        return prediction_pb2.HealthCheckResponse(status="SERVING", version="0.1.0")

    async def PredictQuiz(
        self,
        request: prediction_pb2.PredictQuizRequest,
        context: grpc.aio.ServicerContext[Any, Any],
    ) -> prediction_pb2.PredictQuizResponse:
        try:
            validate_request(request.response_id, request.participant_id, len(request.videos))
        except PredictError as err:
            await context.abort(grpc.StatusCode.INVALID_ARGUMENT, str(err))

        results: list[Any] = []
        for ref in request.videos:
            if context.cancelled():
                break
            try:
                video = resolve_video(self.settings.upload_root, ref)
                pred_ref = make_ref(
                    request.response_id,
                    request.participant_id,
                    video.question_id,
                    video.kind,
                    video.path,
                    video.source,
                )
                output = await self.runtime.predict_video(pred_ref)
                results.append(
                    prediction_pb2.PredictionResult(
                        question_id=video.question_id,
                        video_kind=video.kind,
                        label=output.prediction.label,
                        probability_anxiety_tinggi=output.prediction.probability_anxiety_tinggi,
                        frame_count=int(output.pipeline.meta.get("frame_count", 0)),
                        duration_seconds=float(output.pipeline.meta.get("duration_seconds", 0.0)),
                        status="ok",
                        error_message="",
                    )
                )
            except Exception as err:  # preserve partial failures per video
                failed = failed_video(ref, str(err))
                results.append(
                    prediction_pb2.PredictionResult(
                        question_id=failed.question_id,
                        video_kind=failed.kind,
                        label="",
                        probability_anxiety_tinggi=0.0,
                        frame_count=0,
                        duration_seconds=0.0,
                        status="failed",
                        error_message=failed.message,
                    )
                )

        return prediction_pb2.PredictQuizResponse(
            response_id=request.response_id,
            model_version=f"tabr:{self.settings.exp_name}:{self.settings.evaluation_seed}",
            exp_name=self.settings.exp_name,
            threshold=self.settings.threshold,
            aggregation=self.settings.aggregation,
            results=results,
        )


async def serve(settings: PredictorSettings) -> None:
    settings.validate_runtime_paths()
    bundle = load_bundle(settings)

    server = grpc.aio.server()
    add_pred(PredictionService(settings, bundle), server)

    health_svc = health_aio.HealthServicer()
    add_health(health_svc, server)
    await set_health(health_svc, health_pb2.HealthCheckResponse.NOT_SERVING)

    services = (Svc.full_name, health.SERVICE_NAME, reflection.SERVICE_NAME)
    reflection.enable_server_reflection(services, server)
    server.add_insecure_port(settings.bind_address)

    print_config(settings)
    print_bundle(bundle)
    await server.start()
    await set_health(health_svc, health_pb2.HealthCheckResponse.SERVING)
    print(f"Predictor gRPC server listening on {settings.bind_address}")

    stop_event = asyncio.Event()
    bind_stop(stop_event, (signal.SIGINT, signal.SIGTERM))
    await stop_event.wait()

    print("Stopping predictor gRPC server")
    await set_health(health_svc, health_pb2.HealthCheckResponse.NOT_SERVING)
    await server.stop(grace=5)


async def set_health(health_svc: Any, status: int) -> None:
    await health_svc.set("", status)
    await health_svc.set(Svc.full_name, status)


def print_config(settings: PredictorSettings) -> None:
    print("QUIS predictor config")
    for key, value in settings.safe_summary().items():
        print(f"{key}: {value}")
    print("QUIS predictor artifacts")
    for key, value in resolve_artifacts(settings).as_map().items():
        print(f"{key}: {value}")


def print_bundle(bundle: Bundle) -> None:
    print("QUIS predictor model")
    for key, value in bundle.summary().items():
        print(f"{key}: {value}")


def bind_stop(stop_event: asyncio.Event, signals: Sequence[signal.Signals]) -> None:
    loop = asyncio.get_running_loop()
    for sig in signals:
        try:
            loop.add_signal_handler(sig, stop_event.set)
        except NotImplementedError:
            signal.signal(sig, lambda _signum, _frame: stop_event.set())
