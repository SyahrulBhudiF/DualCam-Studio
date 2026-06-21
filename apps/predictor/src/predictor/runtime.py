import asyncio
import gc
import logging
import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np

from predictor.core.spotting import signal_index_to_frame_index
from predictor.features.pipeline import PipelineConfig, PipelineResult, VideoRef, extract_video_file
from predictor.features.schema import FeatureSchema
from predictor.infer import (
    AggregatePrediction,
    EventPrediction,
    aggregate_predictions,
    label_for_probability,
    predict_events,
)
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


@dataclass(frozen=True)
class FramePredictionDetail:
    frame_index: int
    signal_index: int
    time_seconds: float
    probability_anxiety_tinggi: float
    label: str
    raw_magnitude: float
    smoothed_magnitude: float
    height_threshold: float
    event_no: int
    event_marker: str


@dataclass(frozen=True)
class EventPredictionDetail:
    event_no: int
    onset_frame: int
    apex_frame: int
    offset_frame: int
    onset_time_seconds: float
    apex_time_seconds: float
    offset_time_seconds: float
    duration_frames: int
    duration_seconds: float
    probability_anxiety_tinggi: float
    label: str


@dataclass(frozen=True)
class RuntimeDetailResult:
    pipeline: PipelineResult
    prediction: AggregatePrediction
    frames: list[FramePredictionDetail]
    events: list[EventPredictionDetail]
    spotting_signal: list[FramePredictionDetail]


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
        detail = await self.predict_video_detail(ref)
        return RuntimeResult(pipeline=detail.pipeline, prediction=detail.prediction)

    async def predict_video_detail(self, ref: VideoRef) -> RuntimeDetailResult:
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
                predictions = await asyncio.to_thread(
                    predict_events,
                    self.bundle,
                    np.asarray(matrix, dtype=np.float32),
                    self.cfg.threshold,
                )
            prediction = aggregate_predictions(
                predictions,
                self.cfg.threshold,
                self.cfg.aggregation,
            )
            frames: list[FramePredictionDetail] = []
            spotting_signal = build_spotting_signal_details(pipeline)
            event_details = build_event_details(
                pipeline,
                predictions,
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
            len(predictions),
            self.cfg.aggregation,
            self.cfg.threshold,
            prediction.probability_anxiety_tinggi,
            prediction.label,
        )
        return RuntimeDetailResult(
            pipeline=pipeline,
            prediction=prediction,
            frames=frames,
            events=event_details,
            spotting_signal=spotting_signal,
        )


def build_spotting_signal_details(pipeline: PipelineResult) -> list[FramePredictionDetail]:
    raw = list(pipeline.meta.get("raw_magnitudes", []))
    smoothed = list(pipeline.meta.get("smoothed_magnitudes", []))
    height_threshold = float(pipeline.meta.get("height_threshold") or 0.0)
    fps = float(pipeline.meta.get("fps") or 0.0)
    event_lookup = build_event_lookup(pipeline.events)
    details: list[FramePredictionDetail] = []
    for signal_index, raw_magnitude in enumerate(raw):
        frame_index = signal_index_to_frame_index(signal_index)
        event_no, marker = event_lookup.get(signal_index, (0, ""))
        details.append(
            FramePredictionDetail(
                frame_index=frame_index,
                signal_index=signal_index,
                time_seconds=(frame_index - 1) / fps if fps > 0 else 0.0,
                probability_anxiety_tinggi=0.0,
                label="",
                raw_magnitude=float(raw_magnitude),
                smoothed_magnitude=float(smoothed[signal_index])
                if signal_index < len(smoothed)
                else 0.0,
                height_threshold=height_threshold,
                event_no=event_no,
                event_marker=marker,
            )
        )
    return details


def build_frame_details(
    pipeline: PipelineResult,
    predictions: list[EventPrediction],
    threshold: float,
) -> list[FramePredictionDetail]:
    raw = list(pipeline.meta.get("raw_magnitudes", []))
    smoothed = list(pipeline.meta.get("smoothed_magnitudes", []))
    height_threshold = float(pipeline.meta.get("height_threshold") or 0.0)
    fps = float(pipeline.meta.get("fps") or 0.0)
    event_lookup = build_event_lookup(pipeline.events)
    frames: list[FramePredictionDetail] = []

    for row, pred in zip(pipeline.table.rows, predictions, strict=False):
        frame_index = int(row.get("frame", 0))
        signal_index = max(frame_index - signal_index_to_frame_index(0), 0)
        time_seconds = (frame_index - 1) / fps if fps > 0 else 0.0
        event_no, marker = event_lookup.get(signal_index, (0, ""))
        frames.append(
            FramePredictionDetail(
                frame_index=frame_index,
                signal_index=signal_index,
                time_seconds=float(time_seconds),
                probability_anxiety_tinggi=pred.probability_anxiety_tinggi,
                label=pred.label,
                raw_magnitude=float(raw[signal_index]) if signal_index < len(raw) else 0.0,
                smoothed_magnitude=float(smoothed[signal_index])
                if signal_index < len(smoothed)
                else 0.0,
                height_threshold=height_threshold,
                event_no=event_no,
                event_marker=marker,
            )
        )
    return frames


def build_event_lookup(events: list[dict[str, int]]) -> dict[int, tuple[int, str]]:
    lookup: dict[int, tuple[int, str]] = {}
    for event in events:
        event_no = int(event.get("event_no", 0))
        lookup[int(event.get("onset_signal", 0))] = (event_no, "onset")
        lookup[int(event.get("apex_signal", 0))] = (event_no, "apex")
        lookup[int(event.get("offset_signal", 0))] = (event_no, "offset")
    return lookup


def build_event_details(
    pipeline: PipelineResult,
    predictions: list[EventPrediction],
    threshold: float,
    aggregation: Aggregation,
) -> list[EventPredictionDetail]:
    fps = float(pipeline.meta.get("fps") or 0.0)
    rows_by_event: dict[int, list[tuple[dict[str, Any], EventPrediction]]] = {}
    for row, prediction in zip(pipeline.table.rows, predictions, strict=False):
        event_no = int(row.get("event_no", 0) or 0)
        if event_no <= 0:
            continue
        rows_by_event.setdefault(event_no, []).append((row, prediction))

    details: list[EventPredictionDetail] = []
    for event in pipeline.events:
        event_no = int(event.get("event_no", 0))
        event_rows = rows_by_event.get(event_no, [])
        if not event_rows:
            continue

        event_prediction = aggregate_predictions(
            [prediction for _, prediction in event_rows],
            threshold,
            aggregation,
        )
        onset_frame = signal_index_to_frame_index(int(event.get("onset_signal", 0)))
        apex_frame = signal_index_to_frame_index(int(event.get("apex_signal", 0)))
        offset_frame = signal_index_to_frame_index(int(event.get("offset_signal", 0)))
        duration_frames = max(offset_frame - onset_frame, 0)
        details.append(
            EventPredictionDetail(
                event_no=event_no,
                onset_frame=onset_frame,
                apex_frame=apex_frame,
                offset_frame=offset_frame,
                onset_time_seconds=(onset_frame - 1) / fps if fps > 0 else 0.0,
                apex_time_seconds=(apex_frame - 1) / fps if fps > 0 else 0.0,
                offset_time_seconds=(offset_frame - 1) / fps if fps > 0 else 0.0,
                duration_frames=duration_frames,
                duration_seconds=duration_frames / fps if fps > 0 else 0.0,
                probability_anxiety_tinggi=event_prediction.probability_anxiety_tinggi,
                label=label_for_probability(
                    event_prediction.probability_anxiety_tinggi,
                    threshold,
                ),
            )
        )
    return details


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
