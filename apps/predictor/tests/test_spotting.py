import importlib
import sys
from pathlib import Path
from typing import Any, cast

import numpy as np

from predictor.core.spotting import ApexPhase, ApexSmoother, SpotConfig, detect_events

SRC_ROOT = Path("/home/ryuko/skripsi/Skripsi/Convat-1st")


def load_old() -> tuple[Any, Any]:
    root = str(SRC_ROOT)
    if root not in sys.path:
        sys.path.insert(0, root)
    apex = importlib.import_module("apex")
    return cast(Any, apex).ApexSmoother, cast(Any, apex).ApexPhase


def test_smoother_matches_old() -> None:
    old_smoother, _ = load_old()
    signal = [float(np.sin(i / 3) + i * 0.01) for i in range(80)]

    np.testing.assert_allclose(ApexSmoother.smooth(signal), old_smoother.smooth(signal))
    assert ApexSmoother.calculate_window_length(80) == old_smoother.calculate_window_length(80)


def test_phase_matches_old() -> None:
    _, old_phase_type = load_old()
    signal = [0.0, 0.1, 0.4, 1.0, 0.3, 0.1, 0.0, 0.2, 1.2, 0.2, 0.0, 0.1]
    new = ApexPhase(distance_threshold=1, prominence_threshold=0.05, cutoff_ratio=0.3)
    old = old_phase_type(distance_threshold=1, prominence_threshold=0.05, cutoff_ratio=0.3)

    new_apex = new.find_top_k_apex(signal, k=2, height=0.2)
    old_apex = old.find_top_k_apex(signal, k=2, height=0.2)

    assert new_apex == old_apex
    assert new.find_phase(signal, new_apex) == old.find_phase(signal, old_apex)


def test_detect_events_shape() -> None:
    signal = [0.0] * 20 + [0.2, 0.6, 1.0, 0.5, 0.1] + [0.0] * 25
    result = detect_events(signal, SpotConfig(top_k_apex=1, prominence_threshold=0.005))

    assert set(result.meta) == {"window_length", "polyorder", "height_threshold"}
    for event in result.events:
        assert event.onset_signal <= event.apex_signal <= event.offset_signal
        assert event.duration >= 2
