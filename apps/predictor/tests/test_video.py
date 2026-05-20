from pathlib import Path
from typing import Any

import cv2 as cv2_raw  # type: ignore[reportMissingTypeStubs]
import numpy as np

from predictor.video import PREDICTOR_PATH, RoiConfig, VideoError, read_video

cv2: Any = cv2_raw


def test_shape_predictor_is_vendored() -> None:
    assert PREDICTOR_PATH.is_file()
    assert PREDICTOR_PATH.name == "shape_predictor_68_face_landmarks.dat"


def test_roi_config_final_regions() -> None:
    cfg = RoiConfig()

    assert list(cfg.regions) == ["mulut", "mata_kiri", "mata_kanan"]
    assert cfg.target_size["mulut"] == (70, 35)
    assert cfg.target_size["mata_kiri"] == (48, 32)
    assert cfg.target_size["mata_kanan"] == (48, 32)


def test_read_video(tmp_path: Path) -> None:
    path = tmp_path / "sample.avi"
    writer = cv2.VideoWriter(
        str(path),
        cv2.VideoWriter_fourcc(*"MJPG"),
        5.0,
        (16, 16),
    )
    assert writer.isOpened()
    for i in range(3):
        frame = np.full((16, 16, 3), i * 40, dtype=np.uint8)
        writer.write(frame)
    writer.release()

    frames, info = read_video(path)

    assert len(frames) == 3
    assert info.fps == 5.0
    assert info.duration_seconds == 0.6


def test_read_video_rejects_missing(tmp_path: Path) -> None:
    try:
        read_video(tmp_path / "missing.webm")
    except VideoError as err:
        assert "cannot open video" in str(err)
    else:
        raise AssertionError("expected VideoError")
