from pathlib import Path

import numpy as np

from predictor.core.spotting import signal_index_to_frame_index
from predictor.features.extractor import ClipMeta, ExtractConfig, extract_rows_from_rois
from predictor.features.pipeline import (
    PipelineConfig,
    VideoRef,
    build_pipeline_result,
    extract_from_roi_frames,
    extract_from_roi_stream,
)


def roi_frame(delta: int) -> dict[str, np.ndarray]:
    return {
        "mulut": np.full((14, 14), delta, dtype=np.uint8),
        "mata_kiri": np.full((14, 14), delta + 1, dtype=np.uint8),
        "mata_kanan": np.full((14, 14), delta + 2, dtype=np.uint8),
    }


def test_extract_rows_from_rois() -> None:
    meta = ClipMeta(
        response_id="r1",
        participant_id="p1",
        question_id="q1",
        video_kind="segmented",
        video_path="segmented/p1/q1/a.webm",
    )
    table = extract_rows_from_rois(meta, [roi_frame(0), roi_frame(4)], ExtractConfig())

    assert len(table.rows) == 1
    row = table.rows[0]
    assert row["response_id"] == "r1"
    assert row["frame"] == 2
    assert "mulut_x1" in row
    assert "mata_kiri_m4" in row
    assert table.numeric_matrix(["mulut_x1", "mulut_m1"]).shape == (1, 2)


def test_extract_from_roi_frames_meta() -> None:
    ref = VideoRef(
        response_id="r1",
        participant_id="p1",
        question_id="q1",
        video_kind="segmented",
        path=Path("segmented/p1/q1/a.webm"),
    )
    frames = [roi_frame(0), roi_frame(2), roi_frame(4)]
    result = build_pipeline_result(
        ref,
        frames,
        magnitudes=[0.0, 1.0],
        cfg=PipelineConfig(),
        events=[
            {"event_no": 1, "onset_signal": 0, "apex_signal": 1, "offset_signal": 1, "duration": 1}
        ],
    )

    assert len(result.table.rows) == 2
    assert result.table.rows[0]["event_no"] == 1
    assert result.table.rows[0]["frame"] == signal_index_to_frame_index(0)
    assert result.meta["frame_count"] == 3
    assert result.meta["row_count"] == 2
    assert result.meta["magnitude_count"] == 2
    assert result.meta["raw_magnitudes"] == [0.0, 1.0]
    assert result.meta["smoothed_magnitudes"] == []
    assert result.meta["height_threshold"] is None


def test_extract_from_roi_stream_matches_batch() -> None:
    ref = VideoRef(
        response_id="r1",
        participant_id="p1",
        question_id="q1",
        video_kind="segmented",
        path=Path("segmented/p1/q1/a.webm"),
    )
    frames = [roi_frame(0), roi_frame(2), roi_frame(4)]

    batch = extract_from_roi_frames(ref, frames)
    stream = extract_from_roi_stream(ref, iter(frames))

    assert stream.table.rows == batch.table.rows
    assert stream.meta["frame_count"] == batch.meta["frame_count"]
    assert stream.meta["row_count"] == batch.meta["row_count"]
    assert stream.meta["magnitude_count"] == batch.meta["magnitude_count"]
