
import numpy as np

from predictor.config import VENDOR_ROOT
from predictor.features.extractor import FeatureTable, load_feature_cols
from predictor.features.parity import (
    ParityError,
    compare_predictions,
    compare_tables,
    table_from_csv,
)
from predictor.features.schema import FeatureSchema

DATA = VENDOR_ROOT / "data" / "convat_apex_anxiety_qwalk_q12_q3_q4"


def test_reference_csv_matches_feature_cols_order() -> None:
    cols = load_feature_cols(DATA / "feature_cols.json")
    table = table_from_csv(DATA / "train_split.csv", limit=2)
    schema = FeatureSchema(cols)
    matrix = schema.make_matrix(table)

    assert matrix.values.shape == (2, 392)
    assert matrix.values.dtype == np.float32
    assert matrix.meta.feature_cols == cols


def test_compare_tables_passes_identical_reference() -> None:
    cols = load_feature_cols(DATA / "feature_cols.json")
    table = table_from_csv(DATA / "train_split.csv", limit=2)
    report = compare_tables(
        table,
        table,
        FeatureSchema(cols),
        metadata_cols=["participant", "question", "event_no", "frame"],
    )

    assert report.row_count == 2
    assert report.feature_columns == 392
    assert report.max_abs_diff == 0.0


def test_compare_tables_fails_feature_drift() -> None:
    cols = load_feature_cols(DATA / "feature_cols.json")
    ref = table_from_csv(DATA / "train_split.csv", limit=1)
    changed = FeatureTable([dict(ref.rows[0])])
    changed.rows[0][cols[0]] = float(changed.rows[0][cols[0]]) + 1.0

    try:
        compare_tables(changed, ref, FeatureSchema(cols), metadata_cols=[])
    except ParityError as err:
        assert "feature values differ" in str(err)
    else:
        raise AssertionError("expected ParityError")


def test_compare_predictions() -> None:
    assert compare_predictions([0.1, 0.2], [0.1, 0.20000001])
    assert not compare_predictions([0.1, 0.2], [0.1, 0.3])
