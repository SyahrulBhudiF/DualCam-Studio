import os
import time
from pathlib import Path
from typing import Any

import cv2  # type: ignore[reportMissingTypeStubs]
import numpy as np
import pytest

from predictor.features.pipeline import VideoRef, extract_video_file


class FakeRoiExtractor:
    def extract(self, frame: Any) -> dict[str, np.ndarray]:
        del frame
        return {
            "mulut": np.full((35, 70), 20, dtype=np.uint8),
            "mata_kiri": np.full((32, 48), 30, dtype=np.uint8),
            "mata_kanan": np.full((32, 48), 40, dtype=np.uint8),
        }


def real_video_path() -> Path | None:
    raw = os.environ.get("PREDICTOR_PERF_VIDEO")
    if raw:
        path = Path(raw).expanduser().resolve()
        return path if path.is_file() else None

    root = Path(
        os.environ.get(
            "PREDICTOR_UPLOAD_ROOT",
            Path(__file__).resolve().parents[3] / "video_uploads",
        )
    )
    for ext in ("*.webm", "*.mp4", "*.avi", "*.mov", "*.mkv"):
        found = next(root.rglob(ext), None) if root.exists() else None
        if found is not None:
            return found.resolve()
    return None


@pytest.mark.performance
def test_real_video_streaming_decode_performance() -> None:
    path = real_video_path()
    if path is None:
        pytest.skip("set PREDICTOR_PERF_VIDEO=/path/to/video or put real video under video_uploads")

    cap = cv2.VideoCapture(str(path))
    try:
        source_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        fps = float(cap.get(cv2.CAP_PROP_FPS) or 0.0)
    finally:
        cap.release()

    ref = VideoRef("perf-response", "perf-participant", "perf-question", "main", path)
    started = time.perf_counter()
    result = extract_video_file(ref, FakeRoiExtractor())
    elapsed = time.perf_counter() - started

    frame_count = int(result.meta["frame_count"])
    row_count = len(result.table.rows)
    processing_fps = frame_count / elapsed if elapsed > 0 else 0.0

    print(
        "\nreal_video_perf"
        f" path={path}"
        f" source_frames={source_frames}"
        f" source_fps={fps:.2f}"
        f" frame_count={frame_count}"
        f" row_count={row_count}"
        f" elapsed_seconds={elapsed:.3f}"
        f" processing_fps={processing_fps:.2f}"
    )

    assert frame_count >= 2
    assert row_count == frame_count - 1
    assert processing_fps > 0
