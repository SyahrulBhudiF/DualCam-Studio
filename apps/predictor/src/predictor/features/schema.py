from dataclasses import dataclass
from pathlib import Path
from typing import Any, Literal

import numpy as np

from predictor.features.extractor import FeatureTable, load_feature_cols

UnknownPolicy = Literal["ignore", "reject"]
Array = Any


class FeatureSchemaError(ValueError):
    pass


@dataclass(frozen=True)
class SchemaConfig:
    unknown_policy: UnknownPolicy = "ignore"
    dtype: type[np.float32] = np.float32


@dataclass(frozen=True)
class MatrixMeta:
    rows: int
    cols: int
    feature_cols: list[str]
    ignored_cols: list[str]


@dataclass(frozen=True)
class MatrixResult:
    values: Array
    meta: MatrixMeta


@dataclass(frozen=True)
class FeatureSchema:
    feature_cols: list[str]
    cfg: SchemaConfig = SchemaConfig()

    @classmethod
    def from_json(cls, path: Path, cfg: SchemaConfig | None = None) -> "FeatureSchema":
        return cls(load_feature_cols(path), cfg or SchemaConfig())

    def validate(self) -> None:
        if not self.feature_cols:
            raise FeatureSchemaError("feature schema is empty")
        duplicates = sorted({col for col in self.feature_cols if self.feature_cols.count(col) > 1})
        if duplicates:
            raise FeatureSchemaError("duplicate feature columns: " + ", ".join(duplicates))

    def make_matrix(self, table: FeatureTable) -> MatrixResult:
        self.validate()
        if table.empty:
            raise FeatureSchemaError("feature table is empty")

        available = set(table.columns)
        required = set(self.feature_cols)
        missing = [col for col in self.feature_cols if col not in available]
        if missing:
            raise FeatureSchemaError("missing feature columns: " + ", ".join(missing[:10]))

        unknown = sorted(available - required - META_COLS)
        if unknown and self.cfg.unknown_policy == "reject":
            raise FeatureSchemaError("unexpected feature columns: " + ", ".join(unknown[:10]))

        values: list[list[float]] = []
        for row_idx, row in enumerate(table.rows):
            out_row: list[float] = []
            for col in self.feature_cols:
                value = row[col]
                if isinstance(value, bool):
                    raise FeatureSchemaError(f"non-numeric value at row {row_idx}, column {col}")
                if isinstance(value, int | float):
                    numeric = float(value)
                elif isinstance(value, np.number):
                    numeric = float(np.asarray(value, dtype=float))
                else:
                    raise FeatureSchemaError(f"non-numeric value at row {row_idx}, column {col}")
                if not np.isfinite(numeric):
                    raise FeatureSchemaError(f"non-finite value at row {row_idx}, column {col}")
                out_row.append(numeric)
            values.append(out_row)

        matrix = np.asarray(values, dtype=self.cfg.dtype)
        return MatrixResult(
            values=matrix,
            meta=MatrixMeta(
                rows=int(matrix.shape[0]),
                cols=int(matrix.shape[1]),
                feature_cols=list(self.feature_cols),
                ignored_cols=unknown,
            ),
        )


META_COLS = {
    "response_id",
    "participant",
    "question",
    "video_kind",
    "video_path",
    "event_no",
    "source",
    "frame",
}
