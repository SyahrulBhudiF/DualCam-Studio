from __future__ import annotations

import asyncio
import json
import logging
import os
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Any, Protocol, cast

import cv2
import numpy as np
import pyrealsense2 as rs  # type: ignore[import-untyped]
import websockets

LOGGER = logging.getLogger(__name__)
DEFAULT_HOST = "localhost"
DEFAULT_PORT = 8080
DEFAULT_WIDTH = 640
DEFAULT_HEIGHT = 480
DEFAULT_FPS = 60
DEFAULT_JPEG_QUALITY = 80


def resolve_project_root() -> Path:
    project_root = os.environ.get("PROJECT_ROOT", Path(__file__).resolve().parents[5])
    return Path(project_root).expanduser().resolve()


def resolve_upload_root() -> Path:
    project_root = resolve_project_root()
    default_root = Path(os.environ.get("PREDICTOR_UPLOAD_ROOT", project_root / "video_uploads"))
    return Path(os.environ.get("UPLOAD_ROOT", default_root)).expanduser().resolve()


class CommandSocket(Protocol):
    def __aiter__(self) -> AsyncIterator[str | bytes]: ...

    async def send(self, message: str) -> None: ...


class ClientSocket(CommandSocket, Protocol):
    async def wait_closed(self) -> None: ...


class CameraServer:
    def __init__(
        self,
        upload_root: Path,
        width: int = DEFAULT_WIDTH,
        height: int = DEFAULT_HEIGHT,
        fps: int = DEFAULT_FPS,
        jpeg_quality: int = DEFAULT_JPEG_QUALITY,
    ) -> None:
        self.upload_root = upload_root.resolve()
        self.width = width
        self.height = height
        self.fps = fps
        self.jpeg_quality = jpeg_quality
        self.clients: set[Any] = set()
        self.is_recording = False
        self.recording_path: Path | None = None
        self.video_writer: cv2.VideoWriter | None = None

    def start_recording(self, data: dict[str, Any]) -> str | None:
        folder_name = data.get("folderName")
        mode = data.get("mode", "FULL")
        if not isinstance(folder_name, str) or not self.is_safe_path(folder_name):
            LOGGER.warning("REC REJECT: unsafe folderName")
            return None

        file_name = data.get("fileName") if mode == "SEGMENT" else "recording_realsense.avi"
        if not isinstance(file_name, str) or not self.is_safe_path(file_name):
            LOGGER.warning("REC REJECT: unsafe fileName")
            return None

        full_path = (self.upload_root / folder_name / file_name).resolve()
        if not full_path.is_relative_to(self.upload_root):
            LOGGER.warning("REC REJECT: path escapes upload root")
            return None

        self.stop_recording()
        full_path.parent.mkdir(parents=True, exist_ok=True)
        fourcc = cast(int, cv2.VideoWriter_fourcc(*"MJPG"))  # type: ignore[attr-defined]
        self.video_writer = cv2.VideoWriter(
            str(full_path),
            fourcc,
            self.fps,
            (self.width, self.height),
        )
        if not self.video_writer.isOpened():
            self.video_writer = None
            self.recording_path = None
            LOGGER.error("REC FAILED: cannot open writer for %s", full_path)
            return None

        self.is_recording = True
        self.recording_path = full_path
        LOGGER.info("REC START: %s", full_path)
        return self.to_public_path(full_path)

    def stop_recording(self) -> str | None:
        path = self.recording_path
        self.is_recording = False
        self.recording_path = None
        if self.video_writer is not None:
            self.video_writer.release()
            self.video_writer = None
            LOGGER.info("REC STOP")
        return self.to_public_path(path) if path is not None else None

    async def handle_commands(self, websocket: CommandSocket) -> None:
        async for message in websocket:
            try:
                data = json.loads(message)
            except json.JSONDecodeError:
                LOGGER.warning("Ignoring invalid JSON command")
                continue

            request_id = data.get("requestId")
            action = data.get("action")
            if action == "START":
                path = self.start_recording(data)
                await self.send_ack(websocket, request_id, "STARTED" if path else "ERROR", path)
            elif action == "STOP":
                path = self.stop_recording()
                await self.send_ack(websocket, request_id, "STOPPED" if path else "ERROR", path)
            else:
                LOGGER.warning("Ignoring unknown command: %s", action)
                await self.send_ack(websocket, request_id, "ERROR", None)

    async def broadcast_camera(self) -> None:  # pyright: ignore[reportUnknownVariableType, reportUnknownMemberType]
        pipeline = rs.pipeline()  # type: ignore[attr-defined]
        config = rs.config()  # type: ignore[attr-defined]
        config.enable_stream(  # type: ignore[attr-defined]
            rs.stream.color,  # pyright: ignore[reportAttributeAccessIssue, reportUnknownMemberType]
            self.width,
            self.height,
            rs.format.bgr8,  # pyright: ignore[reportAttributeAccessIssue, reportUnknownMemberType]
            self.fps,
        )

        pipeline.start(config)  # type: ignore[attr-defined]
        LOGGER.info("Camera pipeline started")

        try:
            while True:
                frames = pipeline.wait_for_frames()  # type: ignore[attr-defined]
                color_frame = frames.get_color_frame()  # type: ignore[attr-defined]
                if not color_frame:
                    continue

                frame_data = cast(
                    np.ndarray[Any, Any],
                    np.asanyarray(cast(Any, color_frame).get_data()),
                )
                if self.is_recording and self.video_writer is not None:
                    self.video_writer.write(frame_data)

                if self.clients:
                    ok, buffer = cv2.imencode(
                        ".jpg",
                        frame_data,
                        [int(cv2.IMWRITE_JPEG_QUALITY), self.jpeg_quality],
                    )
                    if ok:
                        websockets.broadcast(self.clients, buffer.tobytes())

                await asyncio.sleep(0.001)
        finally:
            self.stop_recording()
            pipeline.stop()  # type: ignore[attr-defined]
            LOGGER.info("Camera pipeline stopped")

    async def handle_client(self, websocket: ClientSocket) -> None:
        self.clients.add(websocket)
        command_task = asyncio.create_task(self.handle_commands(websocket))
        try:
            await websocket.wait_closed()
        finally:
            self.stop_recording()
            self.clients.discard(websocket)
            command_task.cancel()

    async def send_ack(
        self,
        websocket: CommandSocket,
        request_id: Any,
        event_type: str,
        path: str | None,
    ) -> None:
        if not isinstance(request_id, str):
            return
        await websocket.send(
            json.dumps({"requestId": request_id, "type": event_type, "path": path})
        )

    def to_public_path(self, path: Path) -> str:
        relative = path.relative_to(self.upload_root).as_posix()
        return f"/video_uploads/{relative}"

    @staticmethod
    def is_safe_path(value: str) -> bool:
        path = Path(value)
        return not path.is_absolute() and ".." not in path.parts


async def run_server() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    host = os.environ.get("CAMERA_HOST", DEFAULT_HOST)
    port = int(os.environ.get("CAMERA_PORT", str(DEFAULT_PORT)))
    upload_root = resolve_upload_root()
    upload_root.mkdir(parents=True, exist_ok=True)

    camera = CameraServer(upload_root=upload_root)
    LOGGER.info("Camera server ready at ws://%s:%s", host, port)
    async with websockets.serve(camera.handle_client, host, port):
        await camera.broadcast_camera()


def main() -> None:
    try:
        asyncio.run(run_server())
    except KeyboardInterrupt:
        LOGGER.info("Camera server stopped")


if __name__ == "__main__":
    main()
