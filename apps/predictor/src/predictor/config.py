from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

DeviceMode = Literal["auto", "cpu", "cuda"]


class PredictorSettings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="PREDICTOR_", env_file=".env", extra="ignore")

    host: str = "127.0.0.1"
    port: int = 50051
    upload_root: Path = Field(default=Path("/home/ryuko/skripsi/QUIS/video_uploads"))
    experiment_root: Path = Field(default=Path("/home/ryuko/skripsi/Skripsi/Convat-1st"))
    device: DeviceMode = "auto"

    @property
    def bind_address(self) -> str:
        return f"{self.host}:{self.port}"


@lru_cache(maxsize=1)
def get_settings() -> PredictorSettings:
    return PredictorSettings()
