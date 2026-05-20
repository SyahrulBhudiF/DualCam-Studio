import csv
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np

from predictor.features.extractor import FeatureTable
from predictor.features.schema import FeatureSchema

Array = Any


class ParityError(AssertionError):
    pass


@dataclass(frozen=True)
class CsvSample:
    rows: list[dict[str, Any]]
    columns: list[str]


@dataclass(frozen=True)
class ParityReport:
    row_count: int
    metadata_columns: list[str]
    feature_columns: int
    max_abs_diff: float
    predictions_match: bool | None = None


def load_csv_sample(path: Path, limit: int | None = None) -> CsvSample:
    rows: list[dict[str, Any]] = []
    with path.open(newline="") as file:
        reader = csv.DictReader(file)
        columns = list(reader.fieldnames or [])
        for row in reader:
            rows.append(dict(row))
            if limit is not None and len(rows) >= limit:
                break
    return CsvSample(rows=rows, columns=columns)


def table_from_csv(path: Path, limit: int | None = None) -> FeatureTable:
    sample = load_csv_sample(path, limit)
    rows = [coerce_row(row) for row in sample.rows]
    return FeatureTable(rows)


def coerce_row(row: dict[str, Any]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in row.items():
        if value == "":
            result[key] = value
            continue
        try:
            result[key] = float(value)
        except (TypeError, ValueError):
            result[key] = value
    return result


def compare_tables(
    new: FeatureTable,
    reference: FeatureTable,
    schema: FeatureSchema,
    metadata_cols: list[str],
    atol: float = 1e-6,
) -> ParityReport:
    if len(new.rows) != len(reference.rows):
        raise ParityError(f"row count mismatch: new={len(new.rows)} ref={len(reference.rows)}")

    for idx, (new_row, ref_row) in enumerate(zip(new.rows, reference.rows, strict=True)):
        for col in metadata_cols:
            if str(new_row.get(col)) != str(ref_row.get(col)):
                raise ParityError(f"metadata mismatch row={idx} column={col}")

    new_matrix = schema.make_matrix(new).values
    ref_matrix = schema.make_matrix(reference).values
    diff = np.abs(new_matrix - ref_matrix)
    max_abs_diff = float(diff.max()) if diff.size else 0.0
    if max_abs_diff > atol:
        raise ParityError(f"feature values differ: max_abs_diff={max_abs_diff} atol={atol}")

    return ParityReport(
        row_count=len(new.rows),
        metadata_columns=metadata_cols,
        feature_columns=len(schema.feature_cols),
        max_abs_diff=max_abs_diff,
    )


def compare_predictions(
    new_probs: Array,
    ref_probs: Array,
    atol: float = 1e-6,
) -> bool:
    return bool(np.allclose(np.asarray(new_probs), np.asarray(ref_probs), atol=atol))
