from dataclasses import dataclass
from typing import Any, cast

import numpy as np

Array = Any


@dataclass(frozen=True)
class QuadranResult:
    quadrants: Array

    def legacy(self) -> Array:
        return self.quadrants


class Quadran:
    def __init__(self, coorData: Array) -> None:
        self.dataA = coorData[:, 4]
        self.dataB = coorData[:, 5]

    def getQuadran(self) -> Array:
        return compute_quadrants(self.dataA, self.dataB).legacy()


def compute_quadrants(x_values: Array, y_values: Array) -> QuadranResult:
    if len(x_values) != len(y_values):
        raise ValueError("x_values and y_values must have same length")

    data = np.empty((len(x_values), 6), dtype=object)
    for i in range(len(x_values)):
        x = np.int_(x_values[i])
        y = np.int_(y_values[i])
        theta = np.degrees(np.arctan2(y, x)) + 360 * (y < 0)
        magnitude = np.sqrt(np.power(x, 2) + np.power(y, 2))
        label = label_quadrant(x, y, theta)
        data[i, :] = [
            np.str_(i),
            x,
            y,
            fmt_np(theta),
            fmt_np(magnitude),
            label,
        ]
    return QuadranResult(data)


def compute_quadrants_from_vectors(vectors: Array) -> QuadranResult:
    if len(vectors.shape) != 2 or vectors.shape[1] < 6:
        raise ValueError("vectors must have shape (n, >=6)")
    return compute_quadrants(vectors[:, 4], vectors[:, 5])


def label_quadrant(x: Any, y: Any, theta: Any) -> str:
    if (x == 0) and (y == 0):
        return "No Quadran X Y = 0"
    if theta >= 0 and theta < 90:
        return "Q1"
    if theta >= 90 and theta < 180:
        return "Q2"
    if theta >= 180 and theta < 270:
        return "Q3"
    if theta >= 270 and theta < 360:
        return "Q4"
    return "No Quadran"


def fmt_np(number: Any) -> int | float:
    if isinstance(number, (np.integer, int)):
        return int(cast(Any, number))
    if isinstance(number, (np.floating, float)):
        return float(round(cast(float, number), 3))
    raise ValueError(f"Invalid number type: {type(number)}")
