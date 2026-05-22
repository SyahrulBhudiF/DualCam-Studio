import asyncio
import gc
import logging
import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np

from predictor.features.pipeline import PipelineConfig, PipelineResult, VideoRef, extract_video_file
from predictor.features.schema import FeatureSchema
from predictor.infer import AggregatePrediction, aggregate_predictions, predict_events
from predictor.model import Bundle
from predictor.video import DlibRoiExtractor

Aggregation = Any
logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RuntimeConfig:
    threshold: float
    aggregation: Aggregation
    decode_workers: int = 1
    infer_workers: int = 1
    max_frames: int | None = None


@dataclass(frozen=True)
class RuntimeResult:
    pipeline: PipelineResult
    prediction: AggregatePrediction


class ThreadLocalDlibRoiExtractor:
    def __init__(self) -> None:
        self.local = threading.local()

    def extract(self, frame: Any) -> dict[str, Any]:
        extractor = getattr(self.local, "extractor", None)
        if extractor is None:
            extractor = DlibRoiExtractor()
            self.local.extractor = extractor
        return extractor.extract(frame)


class PredictionRuntime:
    def __init__(
        self,
        bundle: Bundle,
        feature_cols: list[str],
        cfg: RuntimeConfig,
        roi: DlibRoiExtractor | None = None,
    ) -> None:
        self.bundle = bundle
        self.schema = FeatureSchema(feature_cols)
        self.cfg = cfg
        self.roi = roi or ThreadLocalDlibRoiExtractor()
        self.decode_gate = asyncio.Semaphore(cfg.decode_workers)
        self.infer_gate = asyncio.Semaphore(cfg.infer_workers)

    async def predict_video(self, ref: VideoRef) -> RuntimeResult:
        async with self.decode_gate:
            pipeline = await asyncio.to_thread(
                extract_video_file,
                ref,
                self.roi,
                PipelineConfig(),
                self.cfg.max_frames,
            )
        try:
            matrix = self.schema.make_matrix(pipeline.table).values
            async with self.infer_gate:
                events = await asyncio.to_thread(
                    predict_events,
                    self.bundle,
                    np.asarray(matrix, dtype=np.float32),
                    self.cfg.threshold,
                )
            prediction = aggregate_predictions(
                events,
                self.cfg.threshold,
                self.cfg.aggregation,
            )
        finally:
            gc.collect()
        logger.info(
            "prediction_runtime response_id=%s question_id=%s video_kind=%s "
            "event_count=%d aggregation=%s threshold=%.6f "
            "probability_anxiety_tinggi=%.6f label=%s",
            ref.response_id,
            ref.question_id,
            ref.video_kind,
            len(events),
            self.cfg.aggregation,
            self.cfg.threshold,
            prediction.probability_anxiety_tinggi,
            prediction.label,
        )
        return RuntimeResult(pipeline=pipeline, prediction=prediction)


def make_ref(
    response_id: str,
    participant_id: str,
    question_id: str,
    video_kind: str,
    path: Path,
    source: str,
) -> VideoRef:
    return VideoRef(
        response_id=response_id,
        participant_id=participant_id,
        question_id=question_id,
        video_kind=video_kind,
        path=path,
        source=source,
    )
