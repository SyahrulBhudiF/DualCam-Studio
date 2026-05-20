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
    async def predict_video(self, ref: Any) -> Any:
        return SimpleNamespace(
            prediction=SimpleNamespace(label="anxiety_tinggi", probability_anxiety_tinggi=0.75),
            pipeline=SimpleNamespace(meta={"frame_count": 12, "duration_seconds": 1.2}),
        )


def test_predict_quiz_returns_real_runtime_result(tmp_path: Path) -> None:
    upload = tmp_path / "video_uploads"
    video = upload / "segmented" / "q1" / "a.webm"
    video.parent.mkdir(parents=True)
    video.write_bytes(b"x")

    service = PredictionService(
        PredictorSettings(upload_root=upload),
        SimpleNamespace(feat_cols=[]),  # type: ignore[arg-type]
        FakeRuntime(),  # type: ignore[arg-type]
    )
    request = prediction_pb2.PredictQuizRequest(
        response_id="r1",
        participant_id="p1",
        videos=[
            prediction_pb2.VideoRef(
                question_id="q1",
                kind="segmented",
                path="segmented/q1/a.webm",
                source="manifest",
            )
        ],
    )

    response = asyncio.run(service.PredictQuiz(request, FakeContext()))  # type: ignore[arg-type]

    assert response.response_id == "r1"
    assert response.results[0].status == "ok"
    assert response.results[0].label == "anxiety_tinggi"
    assert response.results[0].probability_anxiety_tinggi == 0.75
    assert response.results[0].frame_count == 12
    assert response.results[0].duration_seconds == 1.2


def test_predict_quiz_preserves_failed_video(tmp_path: Path) -> None:
    service = PredictionService(
        PredictorSettings(upload_root=tmp_path),
        SimpleNamespace(feat_cols=[]),  # type: ignore[arg-type]
        FakeRuntime(),  # type: ignore[arg-type]
    )
    request = prediction_pb2.PredictQuizRequest(
        response_id="r1",
        participant_id="p1",
        videos=[prediction_pb2.VideoRef(question_id="q1", kind="segmented", path="../bad.webm")],
    )

    response = asyncio.run(service.PredictQuiz(request, FakeContext()))  # type: ignore[arg-type]

    assert response.results[0].status == "failed"
    assert "unsafe video path" in response.results[0].error_message
