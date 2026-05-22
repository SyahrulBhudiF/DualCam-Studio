import asyncio
import os
import time
from pathlib import Path

import grpc
import psutil
import pytest

from predictor.config import PredictorSettings
from predictor.generated.prediction.v1 import prediction_pb2
from predictor.model import load_bundle
from predictor.server import PredictionService


class FakeContext:
    def cancelled(self) -> bool:
        return False

    async def abort(self, code: grpc.StatusCode, details: str) -> None:
        raise RuntimeError(f"{code.name}: {details}")


def project_root() -> Path:
    return Path(__file__).resolve().parents[3]


def real_video_path() -> Path | None:
    raw = os.environ.get("PREDICTOR_PERF_VIDEO")
    if raw:
        path = Path(raw).expanduser().resolve()
        return path if path.is_file() else None

    root = Path(os.environ.get("PREDICTOR_UPLOAD_ROOT", project_root() / "video_uploads"))
    patterns = (
        "segmented/*/q1/*_main.webm",
        "segmented/*/q1/*_sec.avi",
        "**/*.webm",
        "**/*.avi",
        "**/*.mp4",
        "**/*.mov",
        "**/*.mkv",
    )
    for pattern in patterns:
        found = next(root.glob(pattern), None) if root.exists() else None
        if found is not None and found.is_file():
            return found.resolve()
    return None


def relative_upload_path(path: Path) -> str:
    return path.relative_to(project_root() / "video_uploads").as_posix()


@pytest.mark.performance
@pytest.mark.e2e
def test_real_predict_quiz_e2e_performance() -> None:
    path = real_video_path()
    if path is None:
        pytest.skip("set PREDICTOR_PERF_VIDEO=/path/to/video or put real video under video_uploads")

    settings = PredictorSettings(
        project_root=project_root(),
        upload_root=project_root() / "video_uploads",
        device=os.environ.get("PREDICTOR_DEVICE", "cpu"),  # type: ignore[arg-type]
        decode_workers=int(os.environ.get("PREDICTOR_DECODE_WORKERS", "0")),
        infer_workers=int(os.environ.get("PREDICTOR_INFER_WORKERS", "1")),
    )
    bundle_started = time.perf_counter()
    bundle = load_bundle(settings)
    bundle_elapsed = time.perf_counter() - bundle_started

    service = PredictionService(settings, bundle)
    request = prediction_pb2.PredictQuizRequest(
        response_id="perf-response",
        participant_id="perf-participant",
        videos=[
            prediction_pb2.VideoRef(
                question_id="perf-question",
                kind="main",
                path=relative_upload_path(path),
                source="performance-test",
            )
        ],
    )

    process = psutil.Process()
    rss_before = process.memory_info().rss
    started = time.perf_counter()
    response = asyncio.run(service.PredictQuiz(request, FakeContext()))  # type: ignore[arg-type]
    elapsed = time.perf_counter() - started
    rss_after = process.memory_info().rss

    result = response.results[0]
    processing_fps = result.frame_count / elapsed if elapsed > 0 else 0.0
    rss_delta_mb = (rss_after - rss_before) / 1024 / 1024

    print(
        "\nreal_e2e_perf"
        f" path={path}"
        f" device={bundle.device}"
        f" decode_workers={settings.effective_decode_workers}"
        f" infer_workers={settings.infer_workers}"
        f" bundle_load_seconds={bundle_elapsed:.3f}"
        f" status={result.status}"
        f" label={result.label}"
        f" probability={result.probability_anxiety_tinggi:.6f}"
        f" frame_count={result.frame_count}"
        f" duration_seconds={result.duration_seconds:.3f}"
        f" elapsed_seconds={elapsed:.3f}"
        f" processing_fps={processing_fps:.2f}"
        f" rss_before_mb={rss_before / 1024 / 1024:.1f}"
        f" rss_after_mb={rss_after / 1024 / 1024:.1f}"
        f" rss_delta_mb={rss_delta_mb:.1f}"
    )

    assert result.status == "ok", result.error_message
    assert result.frame_count >= 2
    assert result.path == relative_upload_path(path)
    assert processing_fps > 0
