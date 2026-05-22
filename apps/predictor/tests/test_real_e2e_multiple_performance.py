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


def upload_root() -> Path:
    return Path(os.environ.get("PREDICTOR_UPLOAD_ROOT", project_root() / "video_uploads"))


def real_video_paths() -> list[Path]:
    raw = os.environ.get("PREDICTOR_PERF_VIDEOS")
    if raw:
        return [Path(item).expanduser().resolve() for item in raw.split(os.pathsep) if item]

    root = upload_root()
    limit = int(os.environ.get("PREDICTOR_PERF_VIDEO_COUNT", "4"))
    paths = sorted(root.glob("segmented/*/q1/*_main.webm"))
    if len(paths) < limit:
        paths.extend(sorted(root.glob("**/*.webm")))
    seen: set[Path] = set()
    result: list[Path] = []
    for path in paths:
        resolved = path.resolve()
        if resolved in seen or not resolved.is_file():
            continue
        seen.add(resolved)
        result.append(resolved)
        if len(result) >= limit:
            break
    return result


def relative_upload_path(path: Path) -> str:
    return path.relative_to(upload_root()).as_posix()


@pytest.mark.performance
@pytest.mark.e2e
def test_real_predict_quiz_multiple_videos_e2e_performance() -> None:
    paths = real_video_paths()
    if not paths:
        pytest.skip("set PREDICTOR_PERF_VIDEOS or put real videos under video_uploads")

    settings = PredictorSettings(
        project_root=project_root(),
        upload_root=upload_root(),
        device=os.environ.get("PREDICTOR_DEVICE", "cpu"),  # type: ignore[arg-type]
        decode_workers=int(os.environ.get("PREDICTOR_DECODE_WORKERS", "0")),
        infer_workers=int(os.environ.get("PREDICTOR_INFER_WORKERS", "1")),
    )
    bundle_started = time.perf_counter()
    bundle = load_bundle(settings)
    bundle_elapsed = time.perf_counter() - bundle_started

    service = PredictionService(settings, bundle)
    request = prediction_pb2.PredictQuizRequest(
        response_id="perf-response-multiple",
        participant_id="perf-participant",
        videos=[
            prediction_pb2.VideoRef(
                question_id=f"perf-question-{index}",
                kind="main",
                path=relative_upload_path(path),
                source="performance-test",
            )
            for index, path in enumerate(paths, start=1)
        ],
    )

    process = psutil.Process()
    rss_before = process.memory_info().rss
    started = time.perf_counter()
    response = asyncio.run(service.PredictQuiz(request, FakeContext()))  # type: ignore[arg-type]
    elapsed = time.perf_counter() - started
    rss_after = process.memory_info().rss

    frame_count = sum(result.frame_count for result in response.results)
    failed = [result.error_message for result in response.results if result.status != "ok"]
    processing_fps = frame_count / elapsed if elapsed > 0 else 0.0
    rss_delta_mb = (rss_after - rss_before) / 1024 / 1024

    print(
        "\nreal_e2e_multi_perf"
        f" video_count={len(paths)}"
        f" device={bundle.device}"
        f" decode_workers={settings.effective_decode_workers}"
        f" infer_workers={settings.infer_workers}"
        f" bundle_load_seconds={bundle_elapsed:.3f}"
        f" frame_count={frame_count}"
        f" elapsed_seconds={elapsed:.3f}"
        f" processing_fps={processing_fps:.2f}"
        f" rss_before_mb={rss_before / 1024 / 1024:.1f}"
        f" rss_after_mb={rss_after / 1024 / 1024:.1f}"
        f" rss_delta_mb={rss_delta_mb:.1f}"
        f" paths={[path.as_posix() for path in paths]}"
    )

    assert not failed, failed
    assert len(response.results) == len(paths)
    assert frame_count >= len(paths) * 2
    assert processing_fps > 0
