from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DeviceMode = Literal["auto", "cpu", "cuda"]
AggregationMode = Literal["mean", "median", "max"]


class PredictorSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="PREDICTOR_", env_file=".env", extra="ignore")

    host: str = "127.0.0.1"
    port: int = 50051
    project_root: Path = Field(default=Path("/home/ryuko/skripsi/QUIS"))
    upload_root: Path = Field(default=Path("/home/ryuko/skripsi/QUIS/video_uploads"))
    tabr_root: Path = Field(default=Path("/home/ryuko/skripsi/Skripsi/Convat-1st"))
    exp_name: str = "convat_apex_anxiety_qwalk_q12_q3_q4"
    evaluation_seed: int = 4
    threshold: float = 0.235
    aggregation: AggregationMode = "mean"
    device: DeviceMode = "auto"

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
    def experiment_root(self) -> Path:
        return self.tabr_root

    @property
    def experiment_dir(self) -> Path:
        return self.tabr_root / "experiments" / self.exp_name

    @property
    def model_dir(self) -> Path:
        return self.experiment_dir / f"seed_{self.evaluation_seed}"

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
            "model_dir": self.model_dir.as_posix(),
        }


@lru_cache(maxsize=1)
def get_settings() -> PredictorSettings:
    return PredictorSettings()
