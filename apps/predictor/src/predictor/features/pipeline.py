from collections.abc import Iterator
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Protocol

from predictor.core.spotting import SpotConfig, detect_events, signal_index_to_frame_index
from predictor.features.extractor import (
    ClipMeta,
    ExtractConfig,
    FeatureTable,
    extract_row,
    to_gray,
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


def compute_frame_magnitude(
    prev_rois: dict[str, Array],
    curr_rois: dict[str, Array],
    cfg: PipelineConfig,
) -> float:
    import numpy as np

    from predictor.core.poc import compute_poc
    from predictor.core.quadran import compute_quadrants_from_vectors
    from predictor.core.vector import compute_vectors

    roi_magnitudes: list[float] = []
    for region_name in cfg.extract.regions:
        if region_name not in prev_rois or region_name not in curr_rois:
            continue
        try:
            roi_prev = to_gray(prev_rois[region_name])
            roi_curr = to_gray(curr_rois[region_name])
            if roi_prev.size == 0 or roi_curr.size == 0:
                return 0.0
            poc = compute_poc(roi_prev, roi_curr, cfg.extract.block_size)
            vec = compute_vectors(poc.poc, poc.origins, cfg.extract.block_size)
            quad = compute_quadrants_from_vectors(vec.vectors).quadrants
            magnitudes = [float(block[4]) for block in quad]
            roi_magnitudes.append(float(np.mean(magnitudes)) if magnitudes else 0.0)
        except Exception:
            return 0.0
    return float(np.mean(roi_magnitudes)) if roi_magnitudes else 0.0


def build_magnitude_signal(
    roi_frames: list[dict[str, Array]],
    cfg: PipelineConfig | None = None,
) -> list[float]:
    cfg = cfg or PipelineConfig()
    if len(roi_frames) < 3:
        return []
    magnitudes: list[float] = []
    prev_rois = roi_frames[0]
    for curr_rois in roi_frames[1:]:
        magnitudes.append(compute_frame_magnitude(prev_rois, curr_rois, cfg))
        prev_rois = curr_rois
    return magnitudes


def make_clip_meta(ref: VideoRef, event_no: int = 0) -> ClipMeta:
    return ClipMeta(
        response_id=ref.response_id,
        participant_id=ref.participant_id,
        question_id=ref.question_id,
        video_kind=ref.video_kind,
        video_path=ref.path.as_posix(),
        event_no=event_no,
        source=ref.source,
    )


def build_event_feature_table(
    ref: VideoRef,
    roi_frames: list[dict[str, Array]],
    events: list[dict[str, int]],
    cfg: PipelineConfig,
) -> FeatureTable:
    rows: list[dict[str, Any]] = []
    for event in events:
        event_no = int(event.get("event_no", 0))
        onset_frame = min(
            signal_index_to_frame_index(int(event.get("onset_signal", 0))), len(roi_frames)
        )
        offset_frame = min(
            signal_index_to_frame_index(int(event.get("offset_signal", 0))), len(roi_frames)
        )
        if onset_frame < 1 or offset_frame < onset_frame:
            continue
        baseline = roi_frames[onset_frame - 1]
        baseline_gray = {name: to_gray(img) for name, img in baseline.items()}
        meta = make_clip_meta(ref, event_no)
        for frame_no in range(onset_frame, offset_frame + 1):
            rows.append(
                extract_row(meta, frame_no, roi_frames[frame_no - 1], baseline_gray, cfg.extract)
            )
    return FeatureTable(rows)


def build_pipeline_result(
    ref: VideoRef,
    roi_frames: list[dict[str, Array]],
    magnitudes: list[float],
    cfg: PipelineConfig,
    events: list[dict[str, int]] | None = None,
) -> PipelineResult:
    spot = detect_events(magnitudes, cfg.spot) if events is None and len(magnitudes) >= 6 else None
    detected_events = [] if spot is None else [event.as_dict() for event in spot.events]
    events = detected_events if events is None else events
    table = build_event_feature_table(ref, roi_frames, events, cfg)
    smoothed_magnitudes = [] if spot is None else spot.smoothed
    spot_meta = {} if spot is None else spot.meta
    return PipelineResult(
        table=table,
        events=events,
        meta={
            "response_id": ref.response_id,
            "participant_id": ref.participant_id,
            "question_id": ref.question_id,
            "video_kind": ref.video_kind,
            "video_path": ref.path.as_posix(),
            "frame_count": len(roi_frames),
            "row_count": len(table.rows),
            "magnitude_count": len(magnitudes),
            "raw_magnitudes": magnitudes,
            "smoothed_magnitudes": smoothed_magnitudes,
            "height_threshold": spot_meta.get("height_threshold"),
            "event_signal_frame_offset": signal_index_to_frame_index(0),
        },
    )


def extract_from_roi_frames(
    ref: VideoRef,
    roi_frames: list[dict[str, Array]],
    cfg: PipelineConfig | None = None,
) -> PipelineResult:
    cfg = cfg or PipelineConfig()
    magnitudes = build_magnitude_signal(roi_frames, cfg)
    return build_pipeline_result(ref, roi_frames, magnitudes, cfg)


def extract_from_roi_stream(
    ref: VideoRef,
    roi_frames: Iterator[dict[str, Array]],
    cfg: PipelineConfig | None = None,
) -> PipelineResult:
    cfg = cfg or PipelineConfig()
    frames = list(roi_frames)
    if len(frames) < 2:
        raise ValueError("Need >= 2 ROI frames")
    magnitudes = build_magnitude_signal(frames, cfg)
    return build_pipeline_result(ref, frames, magnitudes, cfg)


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
    from predictor.video import stream_video_rois

    roi_frames, info = stream_video_rois(ref.path, roi, max_frames=max_frames)
    result = extract_from_roi_stream(ref, roi_frames, cfg)
    result.meta["fps"] = info.fps
    result.meta["duration_seconds"] = info.duration_seconds
    result.meta["source_frame_count"] = info.frame_count
    return result
