import asyncio
import logging
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

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger(__name__)

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
            RuntimeConfig(
                threshold=settings.threshold,
                aggregation=settings.aggregation,
                decode_workers=settings.effective_decode_workers,
                infer_workers=settings.infer_workers,
                max_frames=settings.max_frames,
            ),
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

        videos = list(request.videos)
        results = list(
            await asyncio.gather(
                *(self.predict_ref(request, ref, context) for ref in videos),
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

    async def PredictVideo(
        self,
        request: prediction_pb2.PredictVideoRequest,
        context: grpc.aio.ServicerContext[Any, Any],
    ) -> prediction_pb2.PredictVideoResponse:
        if not request.prediction_id:
            await context.abort(grpc.StatusCode.INVALID_ARGUMENT, "prediction_id is required")
        if not request.video.path:
            await context.abort(grpc.StatusCode.INVALID_ARGUMENT, "video.path is required")

        try:
            video = resolve_video(self.settings.upload_root, request.video)
            pred_ref = make_ref(
                request.prediction_id,
                "anonymous",
                video.question_id or "single",
                video.kind or "main",
                video.path,
                video.source,
            )
            output = await self.runtime.predict_video_detail(pred_ref)
            final_prediction = prediction_pb2.VideoPredictionFinal(
                label=output.prediction.label,
                probability_anxiety_tinggi=output.prediction.probability_anxiety_tinggi,
                frame_count=int(output.pipeline.meta.get("frame_count", 0)),
                duration_seconds=float(output.pipeline.meta.get("duration_seconds", 0.0)),
                fps=float(output.pipeline.meta.get("fps", 0.0)),
                status="ok",
                error_message="",
                path=video.rel_path,
            )
            return prediction_pb2.PredictVideoResponse(
                prediction_id=request.prediction_id,
                model_version=f"tabr:{self.settings.exp_name}:{self.settings.evaluation_seed}",
                exp_name=self.settings.exp_name,
                threshold=self.settings.threshold,
                aggregation=self.settings.aggregation,
                final_prediction=final_prediction,
                frames=[],
                events=[
                    prediction_pb2.EventPredictionDetail(
                        event_no=event.event_no,
                        onset_frame=event.onset_frame,
                        apex_frame=event.apex_frame,
                        offset_frame=event.offset_frame,
                        onset_time_seconds=event.onset_time_seconds,
                        apex_time_seconds=event.apex_time_seconds,
                        offset_time_seconds=event.offset_time_seconds,
                        duration_frames=event.duration_frames,
                        duration_seconds=event.duration_seconds,
                        probability_anxiety_tinggi=event.probability_anxiety_tinggi,
                        label=event.label,
                    )
                    for event in output.events
                ],
                spotting_signal=prediction_pb2.SpottingSignal(
                    fps=float(output.pipeline.meta.get("fps", 0.0)),
                    height_threshold=float(output.pipeline.meta.get("height_threshold") or 0.0),
                    points=[
                        prediction_pb2.SpottingSignalPoint(
                            frame_index=point.frame_index,
                            signal_index=point.signal_index,
                            time_seconds=point.time_seconds,
                            raw_magnitude=point.raw_magnitude,
                            smoothed_magnitude=point.smoothed_magnitude,
                            event_no=point.event_no,
                            event_marker=point.event_marker,
                        )
                        for point in output.spotting_signal
                    ],
                ),
            )
        except Exception as err:
            return prediction_pb2.PredictVideoResponse(
                prediction_id=request.prediction_id,
                model_version=f"tabr:{self.settings.exp_name}:{self.settings.evaluation_seed}",
                exp_name=self.settings.exp_name,
                threshold=self.settings.threshold,
                aggregation=self.settings.aggregation,
                final_prediction=prediction_pb2.VideoPredictionFinal(
                    label="",
                    probability_anxiety_tinggi=0.0,
                    frame_count=0,
                    duration_seconds=0.0,
                    fps=0.0,
                    status="failed",
                    error_message=str(err),
                    path=str(getattr(request.video, "path", "")),
                ),
            )

    async def predict_ref(
        self,
        request: prediction_pb2.PredictQuizRequest,
        ref: prediction_pb2.VideoRef,
        context: grpc.aio.ServicerContext[Any, Any],
    ) -> prediction_pb2.PredictionResult:
        if context.cancelled():
            return prediction_pb2.PredictionResult(
                question_id=ref.question_id,
                video_kind=ref.kind,
                status="failed",
                error_message="request cancelled",
                path=ref.path,
            )
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
            return prediction_pb2.PredictionResult(
                question_id=video.question_id,
                video_kind=video.kind,
                label=output.prediction.label,
                probability_anxiety_tinggi=output.prediction.probability_anxiety_tinggi,
                frame_count=int(output.pipeline.meta.get("frame_count", 0)),
                duration_seconds=float(output.pipeline.meta.get("duration_seconds", 0.0)),
                status="ok",
                error_message="",
                path=video.rel_path,
            )
        except Exception as err:  # preserve partial failures per video
            failed = failed_video(ref, str(err))
            return prediction_pb2.PredictionResult(
                question_id=failed.question_id,
                video_kind=failed.kind,
                label="",
                probability_anxiety_tinggi=0.0,
                frame_count=0,
                duration_seconds=0.0,
                status="failed",
                error_message=failed.message,
                path=str(getattr(ref, "path", "")),
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
    logger.info("Predictor gRPC server listening on %s", settings.bind_address)

    stop_event = asyncio.Event()
    bind_stop(stop_event, (signal.SIGINT, signal.SIGTERM))
    await stop_event.wait()

    logger.info("Stopping predictor gRPC server")
    await set_health(health_svc, health_pb2.HealthCheckResponse.NOT_SERVING)
    await server.stop(grace=5)


async def set_health(health_svc: Any, status: int) -> None:
    await health_svc.set("", status)
    await health_svc.set(Svc.full_name, status)


def print_config(settings: PredictorSettings) -> None:
    logger.info("QUIS predictor config")
    for key, value in settings.safe_summary().items():
        logger.info("%s=%s", key, value)
    logger.info("QUIS predictor artifacts")
    for key, value in resolve_artifacts(settings).as_map().items():
        logger.info("%s=%s", key, value)


def print_bundle(bundle: Bundle) -> None:
    logger.info("QUIS predictor model")
    for key, value in bundle.summary().items():
        logger.info("%s=%s", key, value)


def bind_stop(stop_event: asyncio.Event, signals: Sequence[signal.Signals]) -> None:
    loop = asyncio.get_running_loop()
    for sig in signals:
        try:
            loop.add_signal_handler(sig, stop_event.set)
        except NotImplementedError:
            signal.signal(sig, lambda _signum, _frame: stop_event.set())
