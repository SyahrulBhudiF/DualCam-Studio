import importlib.util
import sys
from pathlib import Path
from typing import Any, cast

import numpy as np

from predictor.core.poc import POC, compute_poc

SRC = Path("/home/ryuko/skripsi/Skripsi/Convat-1st/features_extraction/poc.py")


def load_old() -> Any:
    spec = importlib.util.spec_from_file_location("old_poc", SRC)
    assert spec is not None and spec.loader is not None
    mpl = sys.modules.setdefault("matplotlib", type(sys)("matplotlib"))
    pyplot = sys.modules.setdefault("matplotlib.pyplot", type(sys)("matplotlib.pyplot"))
    cast(Any, mpl).pyplot = pyplot
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_poc_matches_old() -> None:
    rng = np.random.default_rng(42)
    cur = rng.integers(0, 255, size=(21, 14), dtype=np.uint8)
    ref = rng.integers(0, 255, size=(21, 14), dtype=np.uint8)

    old = load_old().POC(cur, ref, 7).getPOC()
    new = POC(cur, ref, 7).getPOC()
    direct = compute_poc(cur, ref, 7)

    for old_part, new_part in zip(old, new, strict=True):
        np.testing.assert_allclose(new_part, old_part)
    np.testing.assert_allclose(direct.poc, old[0])
    np.testing.assert_allclose(direct.origins, old[1])
    np.testing.assert_allclose(direct.rects, old[2])


def test_poc_rejects_bad_shape() -> None:
    cur = np.zeros((7, 7))
    ref = np.zeros((7, 8))

    try:
        compute_poc(cur, ref, 7)
    except ValueError as err:
        assert "same shape" in str(err)
    else:
        raise AssertionError("expected ValueError")
