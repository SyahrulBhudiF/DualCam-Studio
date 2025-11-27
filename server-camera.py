import pyrealsense2 as rs
import asyncio
import websockets
import cv2
import numpy as np
import os
import json
from websockets.exceptions import ConnectionClosed

PORT = 8080
WIDTH = 640
HEIGHT = 480
FPS = 30
BASE_UPLOAD_DIR = "video_uploads"

if not os.path.exists(BASE_UPLOAD_DIR):
    os.makedirs(BASE_UPLOAD_DIR)

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
                    target_dir = os.path.join(BASE_UPLOAD_DIR, folder_name)

                    if not os.path.exists(target_dir):
                        os.makedirs(target_dir)

                    filename = os.path.join(target_dir, "recording_realsense.avi")
                    fourcc = cv2.VideoWriter_fourcc(*'MJPG')
                    video_writer = cv2.VideoWriter(filename, fourcc, FPS, (WIDTH, HEIGHT))
                    is_recording = True
                    print(f"RECORDING STARTED: {filename}")

                elif action == "STOP":
                    is_recording = False
                    if video_writer:
                        video_writer.release()
                        video_writer = None
                    print("RECORDING STOPPED")

            except json.JSONDecodeError:
                pass

    except Exception as e:
        print(f"Command Error: {e}")

async def camera_broadcast_task():
    global is_recording, video_writer

    pipeline = rs.pipeline()
    config = rs.config()
    config.enable_stream(rs.stream.color, WIDTH, HEIGHT, rs.format.bgr8, FPS)

    pipeline.start(config)
    print("Camera Pipeline Started")

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
                ret, buffer = cv2.imencode('.jpg', frame_data, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
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
