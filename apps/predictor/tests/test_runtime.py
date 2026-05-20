import asyncio
from pathlib import Path
from types import SimpleNamespace
from typing import Any

import numpy as np

from predictor.features.pipeline import VideoRef
from predictor.runtime import RuntimeConfig, make_ref


def test_make_ref(tmp_path: Path) -> None:
    path = tmp_path / "a.webm"
    ref = make_ref("r1", "p1", "q1", "segmented", path, "manifest")

    assert ref.response_id == "r1"
    assert ref.participant_id == "p1"
    assert ref.question_id == "q1"
    assert ref.video_kind == "segmented"
    assert ref.path == path
    assert ref.source == "manifest"


def test_runtime_config_defaults() -> None:
    cfg = RuntimeConfig(threshold=0.235, aggregation="mean")

    assert cfg.decode_workers == 1
    assert cfg.infer_workers == 1
    assert cfg.max_frames is None


def test_runtime_predict_video_with_fake_runtime(tmp_path: Path) -> None:
    from predictor import runtime as mod

    rows = [{"a": 1.0, "b": 2.0}, {"a": 3.0, "b": 4.0}]
    pipeline = SimpleNamespace(
        table=SimpleNamespace(rows=rows, columns=["a", "b"], empty=False),
        meta={"frame_count": 3},
    )
    bundle = SimpleNamespace(feat_count=2)

    def fake_extract(
        ref: VideoRef,
        roi: Any,
        cfg: Any,
        max_frames: int | None = None,
    ) -> Any:
        assert ref.path == tmp_path / "a.webm"
        assert max_frames == 5
        return pipeline

    def fake_predict(bundle_arg: Any, matrix: Any, threshold: float) -> Any:
        assert bundle_arg is bundle
        np.testing.assert_allclose(matrix, np.array([[1, 2], [3, 4]], dtype=np.float32))
        assert threshold == 0.5
        return [SimpleNamespace(probability_anxiety_tinggi=0.25)]

    old_extract = mod.extract_video_file
    old_predict = mod.predict_events
    mod.extract_video_file = fake_extract
    mod.predict_events = fake_predict
    try:
        rt = mod.PredictionRuntime(
            bundle,  # type: ignore[arg-type]
            ["a", "b"],
            RuntimeConfig(threshold=0.5, aggregation="mean", max_frames=5),
            roi=SimpleNamespace(),  # type: ignore[arg-type]
        )
        result = asyncio.run(
            rt.predict_video(VideoRef("r1", "p1", "q1", "segmented", tmp_path / "a.webm"))
        )
    finally:
        mod.extract_video_file = old_extract
        mod.predict_events = old_predict

    assert result.pipeline is pipeline
    assert result.prediction.probability_anxiety_tinggi == 0.25
