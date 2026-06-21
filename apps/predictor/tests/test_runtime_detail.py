from types import SimpleNamespace

import pytest

from predictor.infer import EventPrediction
from predictor.runtime import build_event_details, build_frame_details


def test_build_frame_details_aligns_predictions_signal_and_markers() -> None:
    pipeline = SimpleNamespace(
        table=SimpleNamespace(rows=[{"frame": 2}, {"frame": 3}, {"frame": 4}]),
        events=[{"event_no": 1, "onset_signal": 0, "apex_signal": 1, "offset_signal": 2}],
        meta={
            "fps": 10.0,
            "height_threshold": 0.4,
            "raw_magnitudes": [0.1, 0.2, 0.3],
            "smoothed_magnitudes": [0.11, 0.22, 0.33],
        },
    )
    predictions = [
        EventPrediction(0.2, "anxiety_rendah"),
        EventPrediction(0.8, "anxiety_tinggi"),
        EventPrediction(0.5, "anxiety_tinggi"),
    ]

    frames = build_frame_details(pipeline, predictions, 0.5)

    assert [frame.frame_index for frame in frames] == [2, 3, 4]
    assert [frame.signal_index for frame in frames] == [1, 2, 3]
    assert frames[0].time_seconds == 0.1
    assert frames[0].event_marker == "apex"
    assert frames[1].event_marker == "offset"


def test_build_event_details_aggregates_frames_between_onset_offset() -> None:
    pipeline = SimpleNamespace(
        table=SimpleNamespace(rows=[{"frame": 1}, {"frame": 2}, {"frame": 3}]),
        events=[{"event_no": 1, "onset_signal": 0, "apex_signal": 1, "offset_signal": 2}],
        meta={
            "fps": 10.0,
            "height_threshold": 0.4,
            "raw_magnitudes": [0.1, 0.2, 0.3],
            "smoothed_magnitudes": [0.11, 0.22, 0.33],
        },
    )
    frames = build_frame_details(
        pipeline,
        [
            EventPrediction(0.2, "anxiety_rendah"),
            EventPrediction(0.8, "anxiety_tinggi"),
            EventPrediction(0.6, "anxiety_tinggi"),
        ],
        0.5,
    )

    events = build_event_details(pipeline, frames, 0.5, "mean")

    assert len(events) == 1
    assert events[0].probability_anxiety_tinggi == pytest.approx((0.2 + 0.8 + 0.6) / 3)
    assert events[0].label == "anxiety_tinggi"
    assert events[0].onset_frame == 1
    assert events[0].apex_frame == 2
    assert events[0].offset_frame == 3
