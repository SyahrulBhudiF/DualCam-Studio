import importlib.util
from pathlib import Path
from typing import Any

import numpy as np

from predictor.core.vector import Vektor, compute_vectors

SRC = Path("/home/ryuko/skripsi/Skripsi/Convat-1st/features_extraction/vektor.py")


def load_old() -> Any:
    spec = importlib.util.spec_from_file_location("old_vector", SRC)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_vector_matches_old() -> None:
    poc = np.zeros((7, 7, 3))
    poc[3, 3, 0] = 1.0
    poc[2, 4, 1] = 1.0
    poc[5, 1, 2] = 1.0
    origins = np.array([[7, 7], [14, 7], [7, 14]], dtype=float)
    poc_output = [poc, origins, np.zeros((3, 4))]

    old = load_old().Vektor(poc_output, 7).getVektor()
    new = Vektor(poc_output, 7).getVektor()
    direct = compute_vectors(poc, origins, 7).vectors

    np.testing.assert_allclose(new, old)
    np.testing.assert_allclose(direct, old)


def test_vector_rejects_bad_block_size() -> None:
    poc = np.zeros((7, 7, 1))
    origins = np.zeros((1, 2))

    try:
        compute_vectors(poc, origins, 0)
    except ValueError as err:
        assert "block_size" in str(err)
    else:
        raise AssertionError("expected ValueError")
