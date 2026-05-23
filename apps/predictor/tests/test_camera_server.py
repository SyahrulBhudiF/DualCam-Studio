import asyncio
import json
from pathlib import Path
from typing import Any

import pytest

from predictor.camera.server import CameraServer, resolve_project_root, resolve_upload_root


class DummyWriter:
    def __init__(self) -> None:
        self.released = False

    def release(self) -> None:
        self.released = True


class DummyWebSocket:
    def __init__(self, messages: list[str]) -> None:
        self.messages = messages
        self.sent: list[str] = []

    def __aiter__(self) -> "DummyWebSocket":
        return self

    async def __anext__(self) -> str:
        if not self.messages:
            raise StopAsyncIteration
        return self.messages.pop(0)

    async def send(self, message: str) -> None:
        self.sent.append(message)


@pytest.fixture(autouse=True)
def clean_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("PROJECT_ROOT", raising=False)
    monkeypatch.delenv("PREDICTOR_UPLOAD_ROOT", raising=False)
    monkeypatch.delenv("UPLOAD_ROOT", raising=False)


def test_resolve_upload_root_prefers_predictor_upload_root(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    project_root = tmp_path / "project"
    upload_root = tmp_path / "uploads"
    monkeypatch.setenv("PROJECT_ROOT", project_root.as_posix())
    monkeypatch.setenv("PREDICTOR_UPLOAD_ROOT", upload_root.as_posix())

    assert resolve_project_root() == project_root
    assert resolve_upload_root() == upload_root


def test_resolve_upload_root_supports_legacy_upload_root_override(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    predictor_root = tmp_path / "predictor-uploads"
    legacy_root = tmp_path / "legacy-uploads"
    monkeypatch.setenv("PREDICTOR_UPLOAD_ROOT", predictor_root.as_posix())
    monkeypatch.setenv("UPLOAD_ROOT", legacy_root.as_posix())

    assert resolve_upload_root() == legacy_root


def test_rejects_unsafe_recording_paths(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    server = CameraServer(upload_root=tmp_path)
    calls: list[dict[str, Any]] = []
    monkeypatch.setattr(server, "stop_recording", lambda: calls.append({"stop": True}))

    server.start_recording(
        {"action": "START", "mode": "SEGMENT", "folderName": "../escape", "fileName": "x.avi"}
    )
    server.start_recording(
        {"action": "START", "mode": "SEGMENT", "folderName": "safe", "fileName": "../x.avi"}
    )

    assert calls == []
    assert server.video_writer is None
    assert server.is_recording is False


def test_stop_recording_releases_writer_and_returns_path(tmp_path: Path) -> None:
    writer = DummyWriter()
    server = CameraServer(upload_root=tmp_path)
    server.video_writer = writer  # pyright: ignore[reportAttributeAccessIssue]
    server.recording_path = tmp_path / "segmented/user/q1/sec.avi"
    server.is_recording = True

    result = server.stop_recording()

    assert result == "/video_uploads/segmented/user/q1/sec.avi"
    assert writer.released is True
    assert server.video_writer is None
    assert server.is_recording is False


def test_handle_commands_sends_start_stop_ack(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    server = CameraServer(upload_root=tmp_path)

    def start_recording(data: dict[str, Any]) -> str:
        assert data["folderName"] == "safe"
        return "/video_uploads/safe/main.avi"

    monkeypatch.setattr(server, "start_recording", start_recording)
    monkeypatch.setattr(server, "stop_recording", lambda: "/video_uploads/safe/main.avi")

    websocket = DummyWebSocket([
        "not-json",
        json.dumps({"requestId": "1", "action": "START", "folderName": "safe"}),
        json.dumps({"requestId": "2", "action": "STOP"}),
    ])

    asyncio.run(server.handle_commands(websocket))

    assert [json.loads(message) for message in websocket.sent] == [
        {"requestId": "1", "type": "STARTED", "path": "/video_uploads/safe/main.avi"},
        {"requestId": "2", "type": "STOPPED", "path": "/video_uploads/safe/main.avi"},
    ]
