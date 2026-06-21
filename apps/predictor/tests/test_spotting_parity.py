import sys
import types
from pathlib import Path

import numpy as np
import pytest

from predictor.features.pipeline import PipelineConfig, build_magnitude_signal

CONVAT_ROOT = Path(__file__).resolve().parents[1] / "vendor" / "convat"
if str(CONVAT_ROOT) not in sys.path:
    sys.path.insert(0, str(CONVAT_ROOT))

sys.modules.setdefault("matplotlib", types.ModuleType("matplotlib"))
sys.modules.setdefault("matplotlib.pyplot", types.ModuleType("matplotlib.pyplot"))

from features_extraction.poc import POC  # noqa: E402
from features_extraction.quadran import Quadran  # noqa: E402
from features_extraction.vektor import Vektor  # noqa: E402


def make_roi_frames() -> list[dict[str, np.ndarray]]:
    rng = np.random.default_rng(7)
    frames: list[dict[str, np.ndarray]] = []
    for _ in range(8):
        frames.append(
            {
                "mulut": rng.integers(0, 255, size=(35, 70), dtype=np.uint8),
                "mata_kiri": rng.integers(0, 255, size=(32, 48), dtype=np.uint8),
                "mata_kanan": rng.integers(0, 255, size=(32, 48), dtype=np.uint8),
            }
        )
    return frames


def reference_region_magnitude(
    prev_roi: np.ndarray,
    curr_roi: np.ndarray,
    block_size: int,
) -> float:
    poc = POC(prev_roi, curr_roi, block_size)
    vec = Vektor(poc.getPOC(), block_size)
    quad = Quadran(vec.getVektor()).getQuadran()
    magnitudes = [float(block[4]) for block in quad]
    return float(np.mean(magnitudes)) if magnitudes else 0.0


def reference_process_all_datasets_signal(
    roi_frames: list[dict[str, np.ndarray]],
    cfg: PipelineConfig,
) -> list[float]:
    magnitudes: list[float] = []
    prev_rois = roi_frames[0]
    for curr_rois in roi_frames[1:]:
        roi_magnitudes = [
            reference_region_magnitude(prev_rois[region], curr_rois[region], cfg.extract.block_size)
            for region in cfg.extract.regions
        ]
        magnitudes.append(float(np.mean(roi_magnitudes)))
        prev_rois = curr_rois
    return magnitudes


def reference_first_frame_baseline_signal(
    roi_frames: list[dict[str, np.ndarray]],
    cfg: PipelineConfig,
) -> list[float]:
    baseline = roi_frames[0]
    return [
        float(
            np.mean(
                [
                    reference_region_magnitude(
                        baseline[region], curr_rois[region], cfg.extract.block_size
                    )
                    for region in cfg.extract.regions
                ]
            )
        )
        for curr_rois in roi_frames[1:]
    ]


def test_spotting_magnitude_matches_process_all_datasets_notebook_consecutive_poc() -> None:
    cfg = PipelineConfig()
    roi_frames = make_roi_frames()

    runtime = build_magnitude_signal(roi_frames, cfg)
    notebook = reference_process_all_datasets_signal(roi_frames, cfg)

    assert runtime == pytest.approx(notebook)


def test_spotting_magnitude_is_not_first_frame_feature_baseline() -> None:
    cfg = PipelineConfig()
    roi_frames = make_roi_frames()

    runtime = build_magnitude_signal(roi_frames, cfg)
    first_frame_baseline = reference_first_frame_baseline_signal(roi_frames, cfg)

    assert runtime != pytest.approx(first_frame_baseline)
