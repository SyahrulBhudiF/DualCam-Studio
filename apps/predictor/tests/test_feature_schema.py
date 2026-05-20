import numpy as np

from predictor.features.extractor import FeatureTable
from predictor.features.schema import FeatureSchema, FeatureSchemaError, SchemaConfig


def test_schema_orders_float32_matrix() -> None:
    table = FeatureTable(
        [
            {"participant": "p1", "b": 2, "a": 1.5, "extra": "ignored"},
            {"participant": "p2", "b": 4, "a": 3.5, "extra": "ignored"},
        ]
    )
    result = FeatureSchema(["a", "b"]).make_matrix(table)

    assert result.values.dtype == np.float32
    np.testing.assert_allclose(result.values, np.array([[1.5, 2], [3.5, 4]], dtype=np.float32))
    assert result.meta.rows == 2
    assert result.meta.cols == 2
    assert result.meta.ignored_cols == ["extra"]


def test_schema_fails_missing_column() -> None:
    table = FeatureTable([{"a": 1}])

    try:
        FeatureSchema(["a", "b"]).make_matrix(table)
    except FeatureSchemaError as err:
        assert "missing feature columns" in str(err)
    else:
        raise AssertionError("expected FeatureSchemaError")


def test_schema_rejects_unknown_policy() -> None:
    table = FeatureTable([{"a": 1, "b": 2}])
    schema = FeatureSchema(["a"], SchemaConfig(unknown_policy="reject"))

    try:
        schema.make_matrix(table)
    except FeatureSchemaError as err:
        assert "unexpected feature columns" in str(err)
    else:
        raise AssertionError("expected FeatureSchemaError")


def test_schema_rejects_bad_values() -> None:
    for bad in ("x", np.nan):
        table = FeatureTable([{"a": bad}])
        try:
            FeatureSchema(["a"]).make_matrix(table)
        except FeatureSchemaError:
            pass
        else:
            raise AssertionError("expected FeatureSchemaError")
