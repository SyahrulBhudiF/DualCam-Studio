import importlib.util
import sys
from pathlib import Path
from typing import Any

import numpy as np

from predictor.core.quadran import Quadran, compute_quadrants_from_vectors

SRC_ROOT = Path(__file__).resolve().parent.parent / "vendor" / "convat"
SRC = SRC_ROOT / "features_extraction" / "quadran.py"


def load_old() -> Any:
    root = str(SRC_ROOT)
    if root not in sys.path:
        sys.path.insert(0, root)
    spec = importlib.util.spec_from_file_location("old_quadran", SRC)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_quadran_matches_old() -> None:
    vectors = np.array(
        [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 2, 1],
            [0, 0, 0, 0, -2, 1],
            [0, 0, 0, 0, -2, -1],
            [0, 0, 0, 0, 2, -1],
            [0, 0, 0, 0, 0, 2],
        ],
        dtype=float,
    )

    old = load_old().Quadran(vectors).getQuadran()
    new = Quadran(vectors).getQuadran()
    direct = compute_quadrants_from_vectors(vectors).quadrants

    np.testing.assert_array_equal(new, old)
    np.testing.assert_array_equal(direct, old)


def test_quadran_rejects_bad_vector_shape() -> None:
    try:
        compute_quadrants_from_vectors(np.zeros((2, 5)))
    except ValueError as err:
        assert ">=6" in str(err)
    else:
        raise AssertionError("expected ValueError")
