from predictor.config import PredictorSettings, get_settings


def test_default_upload_root_points_to_workspace_storage() -> None:
    settings = get_settings()

    assert settings.upload_root.as_posix() == "/home/ryuko/skripsi/QUIS/video_uploads"


def test_default_experiment_config() -> None:
    settings = PredictorSettings()

    assert settings.tabr_root.as_posix() == "/home/ryuko/skripsi/Skripsi/Convat-1st"
    assert settings.exp_name == "convat_apex_anxiety_qwalk_q12_q3_q4"
    assert settings.evaluation_seed == 4
    assert settings.threshold == 0.235
    assert settings.aggregation == "mean"
    assert settings.device == "auto"
    assert settings.labels == {0: "anxiety_rendah", 1: "anxiety_tinggi"}
