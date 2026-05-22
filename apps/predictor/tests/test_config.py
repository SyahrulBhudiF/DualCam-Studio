from predictor.config import PredictorSettings


def test_effective_decode_workers_uses_explicit_value() -> None:
    settings = PredictorSettings(decode_workers=1)

    assert settings.effective_decode_workers == 1


def test_effective_decode_workers_auto_is_bounded() -> None:
    settings = PredictorSettings(decode_workers=0)

    assert settings.effective_decode_workers in (1, 2)
