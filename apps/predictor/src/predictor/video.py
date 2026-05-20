from collections.abc import Iterator
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Protocol

import cv2  # type: ignore[reportMissingTypeStubs]
import dlib as dlib_raw  # type: ignore[reportMissingTypeStubs]
import numpy as np

REGIONS = {
    "mulut": list(range(48, 68)),
    "mata_kiri": list(range(17, 22)) + list(range(36, 42)),
    "mata_kanan": list(range(22, 27)) + list(range(42, 48)),
}

TARGET_SIZE = {
    "mulut": (70, 35),
    "mata_kiri": (48, 32),
    "mata_kanan": (48, 32),
}

PREDICTOR_PATH = (
    Path(__file__).resolve().parents[2]
    / "vendor"
    / "convat"
    / "shape_predictor_68_face_landmarks.dat"
)

Array = Any
dlib: Any = dlib_raw


def area(rect: Any) -> int:
    return int(rect.width() * rect.height())


class VideoError(RuntimeError):
    pass


@dataclass(frozen=True)
class VideoInfo:
    fps: float
    frame_count: int
    duration_seconds: float


@dataclass(frozen=True)
class RoiConfig:
    predictor_path: Path = PREDICTOR_PATH
    regions: dict[str, list[int]] = field(default_factory=lambda: dict(REGIONS))
    target_size: dict[str, tuple[int, int]] = field(default_factory=lambda: dict(TARGET_SIZE))
    padding_x: int = 6
    padding_y: int = 8


class RoiExtractor(Protocol):
    def extract(self, frame: Array) -> dict[str, Array]: ...


class DlibRoiExtractor:
    def __init__(self, cfg: RoiConfig | None = None) -> None:
        self.cfg = cfg or RoiConfig()
        if not self.cfg.predictor_path.is_file():
            raise FileNotFoundError(f"shape predictor not found: {self.cfg.predictor_path}")
        self.detector: Any = dlib.get_frontal_face_detector()
        self.predictor: Any = dlib.shape_predictor(str(self.cfg.predictor_path))

    def extract(self, frame: Array) -> dict[str, Array]:
        image = np.asarray(frame)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces: list[Any] = list(self.detector(gray))
        if len(faces) == 0:
            raise VideoError("no face detected")
        face = max(faces, key=area)
        marks = self.predictor(gray, face)
        rois: dict[str, Array] = {}
        for name, indices in self.cfg.regions.items():
            roi = self._region(image, marks, indices)
            if roi.size == 0:
                raise VideoError(f"empty ROI for region: {name}")
            rois[name] = cv2.resize(roi, self.cfg.target_size[name])
        return rois

    def _region(self, image: Array, marks: Any, indices: list[int]) -> Array:
        pts = [(marks.part(idx).x, marks.part(idx).y) for idx in indices]
        xs, ys = zip(*pts, strict=True)
        left = max(0, min(xs) - self.cfg.padding_x)
        top = max(0, min(ys) - self.cfg.padding_y)
        right = min(image.shape[1], max(xs) + self.cfg.padding_x)
        bottom = min(image.shape[0], max(ys) + self.cfg.padding_y)
        return image[top:bottom, left:right]


def read_video(path: Path, max_frames: int | None = None) -> tuple[list[Array], VideoInfo]:
    cap = cv2.VideoCapture(str(path))
    if not cap.isOpened():
        raise VideoError(f"cannot open video: {path}")
    try:
        fps = float(cap.get(cv2.CAP_PROP_FPS) or 0.0)
        total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        frames: list[Array] = []
        for frame in iter_frames(cap):
            frames.append(frame)
            if max_frames is not None and len(frames) >= max_frames:
                break
        if not frames:
            raise VideoError(f"video has no readable frames: {path}")
        count = len(frames)
        duration = count / fps if fps > 0 else 0.0
        return frames, VideoInfo(fps=fps, frame_count=total or count, duration_seconds=duration)
    finally:
        cap.release()


def iter_frames(cap: Any) -> Iterator[Array]:
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        yield frame


def extract_video_rois(
    path: Path,
    extractor: RoiExtractor,
    max_frames: int | None = None,
) -> tuple[list[dict[str, Array]], VideoInfo]:
    frames, info = read_video(path, max_frames=max_frames)
    rois = [extractor.extract(frame) for frame in frames]
    return rois, info
