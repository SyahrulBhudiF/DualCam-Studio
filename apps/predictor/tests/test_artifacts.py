from predictor.artifacts import resolve_artifacts
from predictor.config import PredictorSettings


def test_artifact_map() -> None:
    art = resolve_artifacts(PredictorSettings())

    assert art.seed_cfg.name == "4.toml"
    assert art.ckpt.name == "checkpoint.pt"
    assert art.feat_cols.name == "feature_cols.json"
    assert art.x_train.name == "X_num_train.npy"
    assert art.y_train.name == "Y_train.npy"


def test_artifacts_exist() -> None:
    resolve_artifacts(PredictorSettings()).validate()
