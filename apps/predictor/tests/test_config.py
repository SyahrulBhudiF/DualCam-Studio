from predictor.config import PROJECT_ROOT, VENDOR_ROOT, PredictorSettings, get_settings


def test_upload_root() -> None:
    settings = get_settings()

    assert settings.upload_root == (PROJECT_ROOT / "video_uploads").resolve()


def test_exp_config() -> None:
    settings = PredictorSettings()

    assert settings.tabr_root == VENDOR_ROOT.resolve()
    assert settings.exp_name == "convat_apex_anxiety_qwalk_q12_q3_q4"
    assert settings.evaluation_seed == 4
    assert settings.threshold == 0.235
    assert settings.aggregation == "mean"
    assert settings.device == "auto"
    assert settings.labels == {0: "anxiety_rendah", 1: "anxiety_tinggi"}
