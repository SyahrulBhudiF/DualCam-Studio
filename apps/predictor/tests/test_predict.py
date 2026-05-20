from pathlib import Path
from types import SimpleNamespace

from predictor.predict import PredictError, resolve_video, strip_upload_prefix, validate_request


def ref(path: str) -> SimpleNamespace:
    return SimpleNamespace(question_id="q1", kind="segmented", path=path, source="manifest")


def test_validate_request() -> None:
    validate_request("r1", "p1", 1)
    for args in (("", "p1", 1), ("r1", "", 1), ("r1", "p1", 0)):
        try:
            validate_request(*args)
        except PredictError:
            pass
        else:
            raise AssertionError("expected PredictError")


def test_strip_upload_prefix() -> None:
    assert strip_upload_prefix("/video_uploads/segmented/a.webm") == "segmented/a.webm"
    assert strip_upload_prefix("segmented/a.webm") == "segmented/a.webm"


def test_resolve_video_rejects_unsafe(tmp_path: Path) -> None:
    for path in ("/tmp/a.webm", "../a.webm", "q1/../../a.webm", "a.txt"):
        try:
            resolve_video(tmp_path, ref(path))
        except PredictError:
            pass
        else:
            raise AssertionError("expected PredictError")


def test_resolve_video_accepts_existing(tmp_path: Path) -> None:
    video = tmp_path / "segmented" / "q1" / "a.webm"
    video.parent.mkdir(parents=True)
    video.write_bytes(b"x")

    result = resolve_video(tmp_path, ref("/video_uploads/segmented/q1/a.webm"))

    assert result.path == video.resolve()
    assert result.rel_path == "segmented/q1/a.webm"
    assert result.question_id == "q1"
