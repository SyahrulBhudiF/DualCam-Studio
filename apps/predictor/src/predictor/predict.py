from dataclasses import dataclass
from pathlib import Path
from typing import Any

VIDEO_EXTS = {
    ".avi",
    ".flv",
    ".m4v",
    ".mkv",
    ".mov",
    ".mp4",
    ".mpeg",
    ".mpg",
    ".ogv",
    ".webm",
    ".wmv",
}


class PredictError(ValueError):
    pass


@dataclass(frozen=True)
class SafeVideo:
    question_id: str
    kind: str
    path: Path
    rel_path: str
    source: str


@dataclass(frozen=True)
class FailedVideo:
    question_id: str
    kind: str
    message: str


def validate_request(response_id: str, participant_id: str, video_count: int) -> None:
    if not response_id.strip():
        raise PredictError("response_id is required")
    if not participant_id.strip():
        raise PredictError("participant_id is required")
    if video_count <= 0:
        raise PredictError("at least one video ref is required")


def resolve_video(upload_root: Path, ref: Any) -> SafeVideo:
    question_id = str(ref.question_id).strip()
    kind = str(ref.kind).strip()
    raw_path = str(ref.path).strip()
    source = str(ref.source).strip() or "manifest"

    if not question_id:
        raise PredictError("video question_id is required")
    if not kind:
        raise PredictError(f"video kind is required for question {question_id}")
    if not raw_path:
        raise PredictError(f"video path is required for question {question_id}")

    rel = strip_upload_prefix(raw_path)
    rel_path = Path(rel)
    if rel_path.is_absolute() or ".." in rel_path.parts:
        raise PredictError(f"unsafe video path: {raw_path}")
    if rel_path.suffix.lower() not in VIDEO_EXTS:
        raise PredictError(f"unsupported video extension: {raw_path}")

    root = upload_root.resolve()
    full = (root / rel_path).resolve()
    if full != root and root not in full.parents:
        raise PredictError(f"video path escapes upload root: {raw_path}")
    if not full.is_file():
        raise PredictError(f"video file not found: {raw_path}")

    return SafeVideo(
        question_id=question_id,
        kind=kind,
        path=full,
        rel_path=rel_path.as_posix(),
        source=source,
    )


def strip_upload_prefix(path: str) -> str:
    value = path.strip().replace("\\", "/")
    while value.startswith("/"):
        value = value[1:]
    prefix = "video_uploads/"
    if value.startswith(prefix):
        return value[len(prefix) :]
    return value


def failed_video(ref: Any, message: str) -> FailedVideo:
    return FailedVideo(
        question_id=str(getattr(ref, "question_id", "")),
        kind=str(getattr(ref, "kind", "")),
        message=message,
    )
