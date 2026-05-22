from dataclasses import dataclass
from typing import Any, Literal, cast

import numpy as np
import torch  # type: ignore[reportMissingTypeStubs]

from predictor.model import Bundle

Array = Any
Torch = cast(Any, torch)
Aggregation = Literal["mean", "median", "max", "p90"]
LABEL_LOW = "anxiety_rendah"
LABEL_HIGH = "anxiety_tinggi"


class InferenceError(RuntimeError):
    pass


@dataclass(frozen=True)
class EventPrediction:
    probability_anxiety_tinggi: float
    label: str


@dataclass(frozen=True)
class AggregatePrediction:
    probability_anxiety_tinggi: float
    label: str
    event_count: int
    aggregation: Aggregation


def predict_events(bundle: Bundle, matrix: Array, threshold: float) -> list[EventPrediction]:
    arr = np.asarray(matrix, dtype=np.float32)
    if arr.ndim != 2:
        raise InferenceError(f"feature matrix must be 2D, got shape={arr.shape}")
    if arr.shape[1] != bundle.feat_count:
        raise InferenceError(
            f"feature count mismatch: got={arr.shape[1]} expected={bundle.feat_count}"
        )
    if arr.shape[0] == 0:
        return []

    try:
        with Torch.inference_mode():
            x = Torch.as_tensor(arr, dtype=Torch.float32, device=bundle.device)
            logits = bundle.model(
                x_={"num": x},
                y=None,
                candidate_x_={"num": bundle.x_train},
                candidate_y=bundle.y_train,
                context_size=bundle.context_size,
                is_train=False,
            )
            if logits.shape[-1] == 1:
                probs = Torch.sigmoid(logits).reshape(-1).detach().cpu().tolist()
            else:
                probs = Torch.softmax(logits, dim=-1)[:, 1].detach().cpu().tolist()
    finally:
        if Torch.cuda.is_available():
            Torch.cuda.empty_cache()

    return [event_prediction(float(prob), threshold) for prob in probs]


def aggregate_predictions(
    predictions: list[EventPrediction],
    threshold: float,
    aggregation: Aggregation,
) -> AggregatePrediction:
    if not predictions:
        raise InferenceError("cannot aggregate empty predictions")
    values = np.asarray([item.probability_anxiety_tinggi for item in predictions], dtype=float)
    if aggregation == "mean":
        prob = float(values.mean())
    elif aggregation == "median":
        prob = float(np.median(values))
    elif aggregation == "max":
        prob = float(values.max())
    elif aggregation == "p90":
        prob = float(np.percentile(values, 90))
    else:
        raise InferenceError(f"unsupported aggregation: {aggregation}")
    return AggregatePrediction(
        probability_anxiety_tinggi=prob,
        label=label_for_probability(prob, threshold),
        event_count=len(predictions),
        aggregation=aggregation,
    )


def event_prediction(probability: float, threshold: float) -> EventPrediction:
    return EventPrediction(
        probability_anxiety_tinggi=probability,
        label=label_for_probability(probability, threshold),
    )


def label_for_probability(probability: float, threshold: float) -> str:
    return LABEL_HIGH if probability >= threshold else LABEL_LOW
