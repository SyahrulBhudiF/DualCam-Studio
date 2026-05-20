import numpy as np

from predictor.config import PredictorSettings
from predictor.infer import (
    InferenceError,
    aggregate_predictions,
    event_prediction,
    label_for_probability,
    predict_events,
)
from predictor.model import load_bundle


def test_label_for_probability() -> None:
    assert label_for_probability(0.1, 0.2) == "anxiety_rendah"
    assert label_for_probability(0.2, 0.2) == "anxiety_tinggi"


def test_aggregate_predictions() -> None:
    items = [event_prediction(0.1, 0.5), event_prediction(0.9, 0.5), event_prediction(0.8, 0.5)]

    assert aggregate_predictions(items, 0.5, "mean").probability_anxiety_tinggi == 0.6
    assert aggregate_predictions(items, 0.5, "median").probability_anxiety_tinggi == 0.8
    assert aggregate_predictions(items, 0.5, "max").probability_anxiety_tinggi == 0.9


def test_predict_events_rejects_bad_shape() -> None:
    bundle = load_bundle(PredictorSettings(device="cpu"))

    try:
        predict_events(bundle, np.zeros((1, bundle.feat_count + 1), dtype=np.float32), 0.5)
    except InferenceError as err:
        assert "feature count mismatch" in str(err)
    else:
        raise AssertionError("expected InferenceError")


def test_predict_events_runs_original_tabr() -> None:
    bundle = load_bundle(PredictorSettings(device="cpu"))
    matrix = bundle.x_train[:2].detach().cpu().numpy()

    predictions = predict_events(bundle, matrix, 0.235)

    assert len(predictions) == 2
    assert all(0.0 <= item.probability_anxiety_tinggi <= 1.0 for item in predictions)
    assert all(item.label in {"anxiety_rendah", "anxiety_tinggi"} for item in predictions)
