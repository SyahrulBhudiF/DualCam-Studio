import os
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

APP_ROOT = Path(__file__).resolve().parents[2]
VENDOR_ROOT = APP_ROOT / "vendor" / "tabular-dl-tabr-official"
PROJECT_ROOT = APP_ROOT.parents[1]

DeviceMode = Literal["auto", "cpu", "cuda"]
AggregationMode = Literal["mean", "median", "max", "p90"]


class PredictorSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="PREDICTOR_", env_file=".env", extra="ignore")

    host: str = "127.0.0.1"
    port: int = 50051
    project_root: Path = Field(default=PROJECT_ROOT)
    upload_root: Path = Field(default=PROJECT_ROOT / "video_uploads")
    tabr_root: Path = Field(default=VENDOR_ROOT)
    exp_name: str = "convat_apex_anxiety_qwalk_q12_q3_q4"
    evaluation_seed: int = 4
    threshold: float = 0.5
    aggregation: AggregationMode = "p90"
    device: DeviceMode = "auto"
    decode_workers: int = 0
    infer_workers: int = 1
    max_frames: int | None = None

    @model_validator(mode="after")
    def resolve_paths(self) -> "PredictorSettings":
        self.project_root = self.project_root.expanduser().resolve()
        self.upload_root = self.upload_root.expanduser().resolve()
        self.tabr_root = self.tabr_root.expanduser().resolve()
        return self

    @property
    def bind_address(self) -> str:
        return f"{self.host}:{self.port}"

    @property
    def effective_decode_workers(self) -> int:
        if self.decode_workers > 0:
            return self.decode_workers
        cpu_count = os.cpu_count() or 1
        return 2 if cpu_count >= 4 else 1

    @property
    def labels(self) -> dict[int, str]:
        return {0: "anxiety_rendah", 1: "anxiety_tinggi"}

    def validate_runtime_paths(self) -> None:
        missing = [
            path
            for path in (self.project_root, self.upload_root, self.tabr_root)
            if not path.exists()
        ]
        if missing:
            joined = ", ".join(path.as_posix() for path in missing)
            raise FileNotFoundError(f"Required predictor paths do not exist: {joined}")

    def safe_summary(self) -> dict[str, str | int | float]:
        return {
            "bind_address": self.bind_address,
            "project_root": self.project_root.as_posix(),
            "upload_root": self.upload_root.as_posix(),
            "tabr_root": self.tabr_root.as_posix(),
            "exp_name": self.exp_name,
            "evaluation_seed": self.evaluation_seed,
            "threshold": self.threshold,
            "aggregation": self.aggregation,
            "device": self.device,
            "decode_workers": self.effective_decode_workers,
            "infer_workers": self.infer_workers,
            "max_frames": self.max_frames or 0,
        }


@lru_cache(maxsize=1)
def get_settings() -> PredictorSettings:
    return PredictorSettings()
