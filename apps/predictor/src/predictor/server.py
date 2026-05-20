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
    def __init__(self, settings: PredictorSettings) -> None:
        self.settings = settings

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
        await context.abort(grpc.StatusCode.UNIMPLEMENTED, "PredictQuiz is not implemented yet")


async def serve(settings: PredictorSettings) -> None:
    settings.validate_runtime_paths()
    bundle = load_bundle(settings)

    server = grpc.aio.server()
    add_pred(PredictionService(settings), server)

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
