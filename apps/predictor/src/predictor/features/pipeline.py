from dataclasses import dataclass
from pathlib import Path
from typing import Any, Protocol

from predictor.core.spotting import SpotConfig, detect_events
from predictor.features.extractor import (
    ClipMeta,
    ExtractConfig,
    FeatureTable,
    extract_rows_from_rois,
)

Array = Any


class RoiExtractor(Protocol):
    def extract_rois(self, frame: Array) -> dict[str, Array]: ...


class VideoRoiExtractor(Protocol):
    def extract(self, frame: Array) -> dict[str, Array]: ...


@dataclass(frozen=True)
class VideoRef:
    response_id: str
    participant_id: str
    question_id: str
    video_kind: str
    path: Path
    source: str = "runtime"


@dataclass(frozen=True)
class PipelineConfig:
    extract: ExtractConfig = ExtractConfig()
    spot: SpotConfig = SpotConfig()


@dataclass(frozen=True)
class PipelineResult:
    table: FeatureTable
    events: list[dict[str, int]]
    meta: dict[str, Any]


def compute_frame_magnitude(rois: dict[str, Array], baseline: dict[str, Array]) -> float:
    import numpy as np

    values: list[float] = []
    for name, image in rois.items():
        if name not in baseline:
            continue
        image_arr = np.asarray(image, dtype=float)
        base_arr = np.asarray(baseline[name], dtype=float)
        diff = image_arr - base_arr
        values.append(float(np.mean(np.abs(diff))))
    return float(np.mean(values)) if values else 0.0


def build_magnitude_signal(roi_frames: list[dict[str, Array]]) -> list[float]:
    if len(roi_frames) < 2:
        return []
    baseline = roi_frames[0]
    return [compute_frame_magnitude(frame, baseline) for frame in roi_frames[1:]]


def extract_from_roi_frames(
    ref: VideoRef,
    roi_frames: list[dict[str, Array]],
    cfg: PipelineConfig | None = None,
) -> PipelineResult:
    cfg = cfg or PipelineConfig()
    meta = ClipMeta(
        response_id=ref.response_id,
        participant_id=ref.participant_id,
        question_id=ref.question_id,
        video_kind=ref.video_kind,
        video_path=ref.path.as_posix(),
        source=ref.source,
    )
    table = extract_rows_from_rois(meta, roi_frames, cfg.extract)
    magnitudes = build_magnitude_signal(roi_frames)
    spot = detect_events(magnitudes, cfg.spot) if len(magnitudes) >= 6 else None
    return PipelineResult(
        table=table,
        events=[] if spot is None else [event.as_dict() for event in spot.events],
        meta={
            "response_id": ref.response_id,
            "participant_id": ref.participant_id,
            "question_id": ref.question_id,
            "video_kind": ref.video_kind,
            "video_path": ref.path.as_posix(),
            "frame_count": len(roi_frames),
            "row_count": len(table.rows),
            "magnitude_count": len(magnitudes),
        },
    )


def extract_video(
    ref: VideoRef,
    frames: list[Array],
    roi: RoiExtractor,
    cfg: PipelineConfig | None = None,
) -> PipelineResult:
    roi_frames = [roi.extract_rois(frame) for frame in frames]
    return extract_from_roi_frames(ref, roi_frames, cfg)


def extract_video_file(
    ref: VideoRef,
    roi: VideoRoiExtractor,
    cfg: PipelineConfig | None = None,
    max_frames: int | None = None,
) -> PipelineResult:
    from predictor.video import extract_video_rois

    roi_frames, info = extract_video_rois(ref.path, roi, max_frames=max_frames)
    result = extract_from_roi_frames(ref, roi_frames, cfg)
    result.meta["fps"] = info.fps
    result.meta["duration_seconds"] = info.duration_seconds
    result.meta["source_frame_count"] = info.frame_count
    return result
