import asyncio
import json
import os
from pathlib import Path

import cv2
import numpy as np
import pyrealsense2 as rs
import websockets
from websockets.exceptions import ConnectionClosed

PORT = 8080
WIDTH = 640
HEIGHT = 480
FPS = 60
BASE_UPLOAD_DIR = Path(
    os.environ.get("UPLOAD_ROOT", "/home/ryuko/skripsi/QUIS/video_uploads")
).resolve()

BASE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

is_recording = False
video_writer = None
connected_clients = set()


async def handle_commands(websocket):
    global is_recording, video_writer
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                action = data.get("action")

                if action == "START":
                    folder_name = data.get("folderName")
                    mode = data.get("mode", "FULL")

                    if os.path.isabs(folder_name) or ".." in Path(folder_name).parts:
                        print("REC REJECT: unsafe folderName")
                        continue

                    if mode == "SEGMENT":
                        file_name = data.get("fileName")
                    else:
                        file_name = "recording_realsense.avi"

                    if not file_name or os.path.isabs(file_name) or ".." in Path(file_name).parts:
                        print("REC REJECT: unsafe fileName")
                        continue

                    full_path = (BASE_UPLOAD_DIR / folder_name / file_name).resolve()

                    if not full_path.is_relative_to(BASE_UPLOAD_DIR):
                        print("REC REJECT: path escapes upload root")
                        continue

                    full_path.parent.mkdir(parents=True, exist_ok=True)

                    fourcc = cv2.VideoWriter_fourcc(*"MJPG")
                    video_writer = cv2.VideoWriter(
                        str(full_path), fourcc, FPS, (WIDTH, HEIGHT)
                    )
                    is_recording = True
                    print(f"REC START: {full_path}")

                elif action == "STOP":
                    is_recording = False
                    if video_writer:
                        video_writer.release()
                        video_writer = None
                    print("REC STOP")

            except json.JSONDecodeError:
                pass
    except Exception:
        pass


async def camera_broadcast_task():
    global is_recording, video_writer
    pipeline = rs.pipeline()
    config = rs.config()
    config.enable_stream(rs.stream.color, WIDTH, HEIGHT, rs.format.bgr8, FPS)

    pipeline.start(config)
    print(f"Camera Pipeline Started")

    try:
        while True:
            frames = pipeline.wait_for_frames()
            color_frame = frames.get_color_frame()
            if not color_frame:
                continue

            frame_data = np.asanyarray(color_frame.get_data())

            if is_recording and video_writer is not None:
                video_writer.write(frame_data)

            if connected_clients:
                ret, buffer = cv2.imencode(
                    ".jpg", frame_data, [int(cv2.IMWRITE_JPEG_QUALITY), 80]
                )
                if ret:
                    websockets.broadcast(connected_clients, buffer.tobytes())

            await asyncio.sleep(0.001)

    except Exception as e:
        print(f"Camera Error: {e}")
    finally:
        if video_writer:
            video_writer.release()
        pipeline.stop()


async def handler(websocket):
    connected_clients.add(websocket)
    command_task = asyncio.create_task(handle_commands(websocket))
    try:
        await websocket.wait_closed()
    finally:
        connected_clients.remove(websocket)
        command_task.cancel()


async def main():
    print(f"Server STANDBY at ws://localhost:{PORT}")
    server_task = websockets.serve(handler, "localhost", PORT)
    camera_task = asyncio.create_task(camera_broadcast_task())
    await asyncio.gather(server_task, camera_task)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
