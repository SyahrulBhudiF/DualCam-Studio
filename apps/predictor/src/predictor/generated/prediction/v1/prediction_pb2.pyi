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

class PredictionResult(_message.Message):
    __slots__ = ("question_id", "video_kind", "label", "probability_anxiety_tinggi", "frame_count", "duration_seconds", "status", "error_message")
    QUESTION_ID_FIELD_NUMBER: _ClassVar[int]
    VIDEO_KIND_FIELD_NUMBER: _ClassVar[int]
    LABEL_FIELD_NUMBER: _ClassVar[int]
    PROBABILITY_ANXIETY_TINGGI_FIELD_NUMBER: _ClassVar[int]
    FRAME_COUNT_FIELD_NUMBER: _ClassVar[int]
    DURATION_SECONDS_FIELD_NUMBER: _ClassVar[int]
    STATUS_FIELD_NUMBER: _ClassVar[int]
    ERROR_MESSAGE_FIELD_NUMBER: _ClassVar[int]
    question_id: str
    video_kind: str
    label: str
    probability_anxiety_tinggi: float
    frame_count: int
    duration_seconds: float
    status: str
    error_message: str
    def __init__(self, question_id: _Optional[str] = ..., video_kind: _Optional[str] = ..., label: _Optional[str] = ..., probability_anxiety_tinggi: _Optional[float] = ..., frame_count: _Optional[int] = ..., duration_seconds: _Optional[float] = ..., status: _Optional[str] = ..., error_message: _Optional[str] = ...) -> None: ...
