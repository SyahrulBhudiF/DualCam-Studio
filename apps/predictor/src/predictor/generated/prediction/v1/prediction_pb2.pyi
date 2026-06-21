from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class HealthCheckRequest(_message.Message):
    __slots__ = ()
    def __init__(self) -> None: ...

class HealthCheckResponse(_message.Message):
    __slots__ = ("status", "version")
    STATUS_FIELD_NUMBER: _ClassVar[int]
    VERSION_FIELD_NUMBER: _ClassVar[int]
    status: str
    version: str
    def __init__(self, status: _Optional[str] = ..., version: _Optional[str] = ...) -> None: ...

class PredictQuizRequest(_message.Message):
    __slots__ = ("response_id", "participant_id", "videos")
    RESPONSE_ID_FIELD_NUMBER: _ClassVar[int]
    PARTICIPANT_ID_FIELD_NUMBER: _ClassVar[int]
    VIDEOS_FIELD_NUMBER: _ClassVar[int]
    response_id: str
    participant_id: str
    videos: _containers.RepeatedCompositeFieldContainer[VideoRef]
    def __init__(self, response_id: _Optional[str] = ..., participant_id: _Optional[str] = ..., videos: _Optional[_Iterable[_Union[VideoRef, _Mapping]]] = ...) -> None: ...

class VideoRef(_message.Message):
    __slots__ = ("question_id", "kind", "path", "format", "mime_type", "size_bytes", "source", "created_at")
    QUESTION_ID_FIELD_NUMBER: _ClassVar[int]
    KIND_FIELD_NUMBER: _ClassVar[int]
    PATH_FIELD_NUMBER: _ClassVar[int]
    FORMAT_FIELD_NUMBER: _ClassVar[int]
    MIME_TYPE_FIELD_NUMBER: _ClassVar[int]
    SIZE_BYTES_FIELD_NUMBER: _ClassVar[int]
    SOURCE_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    question_id: str
    kind: str
    path: str
    format: str
    mime_type: str
    size_bytes: int
    source: str
    created_at: str
    def __init__(self, question_id: _Optional[str] = ..., kind: _Optional[str] = ..., path: _Optional[str] = ..., format: _Optional[str] = ..., mime_type: _Optional[str] = ..., size_bytes: _Optional[int] = ..., source: _Optional[str] = ..., created_at: _Optional[str] = ...) -> None: ...

class PredictQuizResponse(_message.Message):
    __slots__ = ("response_id", "model_version", "exp_name", "threshold", "aggregation", "results")
    RESPONSE_ID_FIELD_NUMBER: _ClassVar[int]
    MODEL_VERSION_FIELD_NUMBER: _ClassVar[int]
    EXP_NAME_FIELD_NUMBER: _ClassVar[int]
    THRESHOLD_FIELD_NUMBER: _ClassVar[int]
    AGGREGATION_FIELD_NUMBER: _ClassVar[int]
    RESULTS_FIELD_NUMBER: _ClassVar[int]
    response_id: str
    model_version: str
    exp_name: str
    threshold: float
    aggregation: str
    results: _containers.RepeatedCompositeFieldContainer[PredictionResult]
    def __init__(self, response_id: _Optional[str] = ..., model_version: _Optional[str] = ..., exp_name: _Optional[str] = ..., threshold: _Optional[float] = ..., aggregation: _Optional[str] = ..., results: _Optional[_Iterable[_Union[PredictionResult, _Mapping]]] = ...) -> None: ...

class PredictVideoRequest(_message.Message):
    __slots__ = ("prediction_id", "video")
    PREDICTION_ID_FIELD_NUMBER: _ClassVar[int]
    VIDEO_FIELD_NUMBER: _ClassVar[int]
    prediction_id: str
    video: VideoRef
    def __init__(self, prediction_id: _Optional[str] = ..., video: _Optional[_Union[VideoRef, _Mapping]] = ...) -> None: ...

class PredictVideoResponse(_message.Message):
    __slots__ = ("prediction_id", "model_version", "exp_name", "threshold", "aggregation", "final_prediction", "frames", "events", "spotting_signal")
    PREDICTION_ID_FIELD_NUMBER: _ClassVar[int]
    MODEL_VERSION_FIELD_NUMBER: _ClassVar[int]
    EXP_NAME_FIELD_NUMBER: _ClassVar[int]
    THRESHOLD_FIELD_NUMBER: _ClassVar[int]
    AGGREGATION_FIELD_NUMBER: _ClassVar[int]
    FINAL_PREDICTION_FIELD_NUMBER: _ClassVar[int]
    FRAMES_FIELD_NUMBER: _ClassVar[int]
    EVENTS_FIELD_NUMBER: _ClassVar[int]
    SPOTTING_SIGNAL_FIELD_NUMBER: _ClassVar[int]
    prediction_id: str
    model_version: str
    exp_name: str
    threshold: float
    aggregation: str
    final_prediction: VideoPredictionFinal
    frames: _containers.RepeatedCompositeFieldContainer[FramePrediction]
    events: _containers.RepeatedCompositeFieldContainer[EventPredictionDetail]
    spotting_signal: SpottingSignal
    def __init__(self, prediction_id: _Optional[str] = ..., model_version: _Optional[str] = ..., exp_name: _Optional[str] = ..., threshold: _Optional[float] = ..., aggregation: _Optional[str] = ..., final_prediction: _Optional[_Union[VideoPredictionFinal, _Mapping]] = ..., frames: _Optional[_Iterable[_Union[FramePrediction, _Mapping]]] = ..., events: _Optional[_Iterable[_Union[EventPredictionDetail, _Mapping]]] = ..., spotting_signal: _Optional[_Union[SpottingSignal, _Mapping]] = ...) -> None: ...

class VideoPredictionFinal(_message.Message):
    __slots__ = ("label", "probability_anxiety_tinggi", "frame_count", "duration_seconds", "fps", "status", "error_message", "path")
    LABEL_FIELD_NUMBER: _ClassVar[int]
    PROBABILITY_ANXIETY_TINGGI_FIELD_NUMBER: _ClassVar[int]
    FRAME_COUNT_FIELD_NUMBER: _ClassVar[int]
    DURATION_SECONDS_FIELD_NUMBER: _ClassVar[int]
    FPS_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    ERROR_MESSAGE_FIELD_NUMBER: _ClassVar[int]
    PATH_FIELD_NUMBER: _ClassVar[int]
    label: str
    probability_anxiety_tinggi: float
    frame_count: int
    duration_seconds: float
    fps: float
    status: str
    error_message: str
    path: str
    def __init__(self, label: _Optional[str] = ..., probability_anxiety_tinggi: _Optional[float] = ..., frame_count: _Optional[int] = ..., duration_seconds: _Optional[float] = ..., fps: _Optional[float] = ..., status: _Optional[str] = ..., error_message: _Optional[str] = ..., path: _Optional[str] = ...) -> None: ...

class FramePrediction(_message.Message):
    __slots__ = ("frame_index", "signal_index", "time_seconds", "probability_anxiety_tinggi", "label", "raw_magnitude", "smoothed_magnitude", "height_threshold", "event_no", "event_marker")
    FRAME_INDEX_FIELD_NUMBER: _ClassVar[int]
    SIGNAL_INDEX_FIELD_NUMBER: _ClassVar[int]
    TIME_SECONDS_FIELD_NUMBER: _ClassVar[int]
    PROBABILITY_ANXIETY_TINGGI_FIELD_NUMBER: _ClassVar[int]
    LABEL_FIELD_NUMBER: _ClassVar[int]
    RAW_MAGNITUDE_FIELD_NUMBER: _ClassVar[int]
    SMOOTHED_MAGNITUDE_FIELD_NUMBER: _ClassVar[int]
    HEIGHT_THRESHOLD_FIELD_NUMBER: _ClassVar[int]
    EVENT_NO_FIELD_NUMBER: _ClassVar[int]
    EVENT_MARKER_FIELD_NUMBER: _ClassVar[int]
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
    def __init__(self, frame_index: _Optional[int] = ..., signal_index: _Optional[int] = ..., time_seconds: _Optional[float] = ..., probability_anxiety_tinggi: _Optional[float] = ..., label: _Optional[str] = ..., raw_magnitude: _Optional[float] = ..., smoothed_magnitude: _Optional[float] = ..., height_threshold: _Optional[float] = ..., event_no: _Optional[int] = ..., event_marker: _Optional[str] = ...) -> None: ...

class SpottingSignalPoint(_message.Message):
    __slots__ = ("frame_index", "signal_index", "time_seconds", "raw_magnitude", "smoothed_magnitude", "event_no", "event_marker")
    FRAME_INDEX_FIELD_NUMBER: _ClassVar[int]
    SIGNAL_INDEX_FIELD_NUMBER: _ClassVar[int]
    TIME_SECONDS_FIELD_NUMBER: _ClassVar[int]
    RAW_MAGNITUDE_FIELD_NUMBER: _ClassVar[int]
    SMOOTHED_MAGNITUDE_FIELD_NUMBER: _ClassVar[int]
    EVENT_NO_FIELD_NUMBER: _ClassVar[int]
    EVENT_MARKER_FIELD_NUMBER: _ClassVar[int]
    frame_index: int
    signal_index: int
    time_seconds: float
    raw_magnitude: float
    smoothed_magnitude: float
    event_no: int
    event_marker: str
    def __init__(self, frame_index: _Optional[int] = ..., signal_index: _Optional[int] = ..., time_seconds: _Optional[float] = ..., raw_magnitude: _Optional[float] = ..., smoothed_magnitude: _Optional[float] = ..., event_no: _Optional[int] = ..., event_marker: _Optional[str] = ...) -> None: ...

class SpottingSignal(_message.Message):
    __slots__ = ("fps", "height_threshold", "points")
    FPS_FIELD_NUMBER: _ClassVar[int]
    HEIGHT_THRESHOLD_FIELD_NUMBER: _ClassVar[int]
    POINTS_FIELD_NUMBER: _ClassVar[int]
    fps: float
    height_threshold: float
    points: _containers.RepeatedCompositeFieldContainer[SpottingSignalPoint]
    def __init__(self, fps: _Optional[float] = ..., height_threshold: _Optional[float] = ..., points: _Optional[_Iterable[_Union[SpottingSignalPoint, _Mapping]]] = ...) -> None: ...

class EventPredictionDetail(_message.Message):
    __slots__ = ("event_no", "onset_frame", "apex_frame", "offset_frame", "onset_time_seconds", "apex_time_seconds", "offset_time_seconds", "duration_frames", "duration_seconds", "probability_anxiety_tinggi", "label")
    EVENT_NO_FIELD_NUMBER: _ClassVar[int]
    ONSET_FRAME_FIELD_NUMBER: _ClassVar[int]
    APEX_FRAME_FIELD_NUMBER: _ClassVar[int]
    OFFSET_FRAME_FIELD_NUMBER: _ClassVar[int]
    ONSET_TIME_SECONDS_FIELD_NUMBER: _ClassVar[int]
    APEX_TIME_SECONDS_FIELD_NUMBER: _ClassVar[int]
    OFFSET_TIME_SECONDS_FIELD_NUMBER: _ClassVar[int]
    DURATION_FRAMES_FIELD_NUMBER: _ClassVar[int]
    DURATION_SECONDS_FIELD_NUMBER: _ClassVar[int]
    PROBABILITY_ANXIETY_TINGGI_FIELD_NUMBER: _ClassVar[int]
    LABEL_FIELD_NUMBER: _ClassVar[int]
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
    def __init__(self, event_no: _Optional[int] = ..., onset_frame: _Optional[int] = ..., apex_frame: _Optional[int] = ..., offset_frame: _Optional[int] = ..., onset_time_seconds: _Optional[float] = ..., apex_time_seconds: _Optional[float] = ..., offset_time_seconds: _Optional[float] = ..., duration_frames: _Optional[int] = ..., duration_seconds: _Optional[float] = ..., probability_anxiety_tinggi: _Optional[float] = ..., label: _Optional[str] = ...) -> None: ...

class PredictionResult(_message.Message):
    __slots__ = ("question_id", "video_kind", "label", "probability_anxiety_tinggi", "frame_count", "duration_seconds", "status", "error_message", "path")
    QUESTION_ID_FIELD_NUMBER: _ClassVar[int]
    VIDEO_KIND_FIELD_NUMBER: _ClassVar[int]
    LABEL_FIELD_NUMBER: _ClassVar[int]
    PROBABILITY_ANXIETY_TINGGI_FIELD_NUMBER: _ClassVar[int]
    FRAME_COUNT_FIELD_NUMBER: _ClassVar[int]
    DURATION_SECONDS_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    ERROR_MESSAGE_FIELD_NUMBER: _ClassVar[int]
    PATH_FIELD_NUMBER: _ClassVar[int]
    question_id: str
    video_kind: str
    label: str
    probability_anxiety_tinggi: float
    frame_count: int
    duration_seconds: float
    status: str
    error_message: str
    path: str
    def __init__(self, question_id: _Optional[str] = ..., video_kind: _Optional[str] = ..., label: _Optional[str] = ..., probability_anxiety_tinggi: _Optional[float] = ..., frame_count: _Optional[int] = ..., duration_seconds: _Optional[float] = ..., status: _Optional[str] = ..., error_message: _Optional[str] = ..., path: _Optional[str] = ...) -> None: ...
