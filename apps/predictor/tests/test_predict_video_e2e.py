import asyncio
from pathlib import Path
from types import SimpleNamespace
from typing import Any

import grpc

from predictor.config import PredictorSettings
from predictor.generated.prediction.v1 import prediction_pb2
from predictor.server import PredictionService


class FakeContext:
    def cancelled(self) -> bool:
        return False

    async def abort(self, code: grpc.StatusCode, details: str) -> None:
        raise RuntimeError(f"{code.name}: {details}")


class FakeRuntime:
    async def predict_video_detail(self, ref: Any) -> Any:
        assert ref.response_id == "prediction-e2e"
        assert ref.participant_id == "anonymous"
        assert ref.question_id == "single"
        return SimpleNamespace(
            prediction=SimpleNamespace(label="anxiety_tinggi", probability_anxiety_tinggi=0.91),
            pipeline=SimpleNamespace(
                meta={"frame_count": 30, "duration_seconds": 3.0, "fps": 10.0}
            ),
            frames=[
                SimpleNamespace(
                    frame_index=2,
                    signal_index=1,
                    time_seconds=0.1,
                    probability_anxiety_tinggi=0.91,
                    label="anxiety_tinggi",
                    raw_magnitude=0.12,
                    smoothed_magnitude=0.1,
                    height_threshold=0.2,
                    event_no=1,
                    event_marker="onset",
                )
            ],
            events=[
                SimpleNamespace(
                    event_no=1,
                    onset_frame=2,
                    apex_frame=4,
                    offset_frame=6,
                    onset_time_seconds=0.1,
                    apex_time_seconds=0.3,
                    offset_time_seconds=0.5,
                    duration_frames=4,
                    duration_seconds=0.4,
                    probability_anxiety_tinggi=0.91,
                    label="anxiety_tinggi",
                )
            ],
        )


def test_predict_video_e2e_public_single_upload_flow(tmp_path: Path) -> None:
    upload_root = tmp_path / "video_uploads"
    video = upload_root / "predict-video" / "sample.webm"
    video.parent.mkdir(parents=True)
    video.write_bytes(b"video")
    service = PredictionService(
        PredictorSettings(upload_root=upload_root),
        SimpleNamespace(feat_cols=[]),  # type: ignore[arg-type]
        FakeRuntime(),  # type: ignore[arg-type]
    )
    request = prediction_pb2.PredictVideoRequest(
        prediction_id="prediction-e2e",
        video=prediction_pb2.VideoRef(
            question_id="single",
            kind="main",
            path="predict-video/sample.webm",
            source="web",
        ),
    )

    response = asyncio.run(service.PredictVideo(request, FakeContext()))  # type: ignore[arg-type]

    assert response.prediction_id == "prediction-e2e"
    assert response.final_prediction.status == "ok"
    assert response.final_prediction.path == "predict-video/sample.webm"
    assert response.final_prediction.label == "anxiety_tinggi"
    assert response.frames[0].event_marker == "onset"
    assert response.events[0].label == "anxiety_tinggi"
