from predictor.config import get_settings


def test_default_upload_root_points_to_workspace_storage() -> None:
    settings = get_settings()

    assert settings.upload_root.as_posix() == "/home/ryuko/skripsi/QUIS/video_uploads"
