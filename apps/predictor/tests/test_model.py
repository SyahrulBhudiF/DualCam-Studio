from predictor.config import PredictorSettings
from predictor.model import load_bundle, pick_device


def test_pick_cpu() -> None:
    assert str(pick_device("cpu")) == "cpu"


def test_load_bundle() -> None:
    bundle = load_bundle(PredictorSettings(device="cpu"))

    assert bundle.feat_count == bundle.x_train.shape[1]
    assert bundle.train_count == bundle.y_train.shape[0]
    assert bundle.device.type == "cpu"
    assert "model" in bundle.ckpt
