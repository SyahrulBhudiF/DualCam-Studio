from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, cast

import numpy as np

from predictor.core.poc import compute_poc
from predictor.core.quadran import compute_quadrants_from_vectors
from predictor.core.vector import compute_vectors

Array = Any

REGIONS = ("mulut", "mata_kiri", "mata_kanan")
TARGET_SIZE = {
    "mulut": (70, 35),
    "mata_kiri": (48, 32),
    "mata_kanan": (48, 32),
}


@dataclass(frozen=True)
class ClipMeta:
    response_id: str
    participant_id: str
    question_id: str
    video_kind: str
    video_path: str
    event_no: int = 0
    source: str = "runtime"


@dataclass(frozen=True)
class ExtractConfig:
    block_size: int = 7
    regions: tuple[str, ...] = REGIONS
    target_size: dict[str, tuple[int, int]] = field(default_factory=lambda: dict(TARGET_SIZE))


@dataclass(frozen=True)
class FeatureTable:
    rows: list[dict[str, Any]]

    @property
    def empty(self) -> bool:
        return not self.rows

    @property
    def columns(self) -> list[str]:
        seen: dict[str, None] = {}
        for row in self.rows:
            for key in row:
                seen.setdefault(key, None)
        return list(seen)

    def numeric_matrix(self, columns: list[str]) -> Array:
        return np.asarray(
            [[row.get(column, 0.0) for column in columns] for row in self.rows], dtype=float
        )

    def to_records(self) -> list[dict[str, Any]]:
        return [dict(row) for row in self.rows]


def to_gray(image: Array) -> Array:
    if image.ndim == 2:
        return image
    if image.ndim != 3:
        raise ValueError("image must be 2D grayscale or 3D color")
    # Avoid mandatory cv2 dependency for unit/core pipeline. Input frames from cv2 are BGR,
    # but luminance weights are channel-order insensitive enough for metadata tests; real ROI path
    # can pass already-grayscale crops.
    return np.rint(image[..., 0] * 0.114 + image[..., 1] * 0.587 + image[..., 2] * 0.299).astype(
        image.dtype
    )


def extract_row(
    meta: ClipMeta,
    frame_no: int,
    rois: dict[str, Array],
    baseline_gray: dict[str, Array],
    cfg: ExtractConfig | None = None,
) -> dict[str, Any]:
    cfg = cfg or ExtractConfig()
    row: dict[str, Any] = {
        "response_id": meta.response_id,
        "participant": meta.participant_id,
        "question": meta.question_id,
        "video_kind": meta.video_kind,
        "video_path": meta.video_path,
        "event_no": meta.event_no,
        "source": meta.source,
        "frame": frame_no,
    }
    for comp in cfg.regions:
        if comp not in rois:
            raise KeyError(f"missing ROI: {comp}")
        if comp not in baseline_gray:
            raise KeyError(f"missing baseline ROI: {comp}")
        gray = to_gray(rois[comp])
        poc = compute_poc(baseline_gray[comp], gray, cfg.block_size)
        vec = compute_vectors(poc.poc, poc.origins, cfg.block_size)
        quad = compute_quadrants_from_vectors(vec.vectors).quadrants
        for block_id, block in enumerate(quad, start=1):
            row[f"{comp}_x{block_id}"] = block[1]
            row[f"{comp}_y{block_id}"] = block[2]
            row[f"{comp}_t{block_id}"] = block[3]
            row[f"{comp}_m{block_id}"] = block[4]
    return row


def extract_rows_from_rois(
    meta: ClipMeta,
    roi_frames: list[dict[str, Array]],
    cfg: ExtractConfig | None = None,
) -> FeatureTable:
    cfg = cfg or ExtractConfig()
    if len(roi_frames) < 2:
        raise ValueError("Need >= 2 ROI frames")
    baseline_gray = {name: to_gray(img) for name, img in roi_frames[0].items()}
    rows = [
        extract_row(meta, frame_no, rois, baseline_gray, cfg)
        for frame_no, rois in enumerate(roi_frames[1:], start=2)
    ]
    return FeatureTable(rows)


def load_feature_cols(path: Path) -> list[str]:
    import json

    cols: Any = json.loads(path.read_text())
    if not isinstance(cols, list):
        raise ValueError(f"Invalid feature column file: {path}")
    items = cast(list[object], cols)
    result: list[str] = []
    for item in items:
        if not isinstance(item, str):
            raise ValueError(f"Invalid feature column file: {path}")
        result.append(item)
    return result
