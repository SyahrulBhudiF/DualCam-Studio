import json
from dataclasses import dataclass
from typing import Any, cast

import numpy as np
import torch  # type: ignore[reportMissingTypeStubs]

from predictor.artifacts import Artifacts, resolve_artifacts
from predictor.config import PredictorSettings

Tensor = Any
Device = Any
DType = Any
Torch = cast(Any, torch)


@dataclass(frozen=True)
class Bundle:
    device: Device
    ckpt: dict[str, Any]
    feat_cols: list[str]
    x_train: Tensor
    y_train: Tensor

    @property
    def feat_count(self) -> int:
        return len(self.feat_cols)

    @property
    def train_count(self) -> int:
        return int(self.x_train.shape[0])

    def summary(self) -> dict[str, str | int]:
        return {
            "device": str(self.device),
            "feat_count": self.feat_count,
            "train_count": self.train_count,
            "ckpt_keys": ",".join(sorted(self.ckpt.keys())),
        }


def pick_device(mode: str) -> Device:
    if mode == "cuda" and not torch.cuda.is_available():
        raise RuntimeError("PREDICTOR_DEVICE=cuda but CUDA is not available")
    if mode == "auto":
        return Torch.device("cuda" if torch.cuda.is_available() else "cpu")
    return Torch.device(mode)


def load_bundle(settings: PredictorSettings) -> Bundle:
    art = resolve_artifacts(settings)
    art.validate()
    device = pick_device(settings.device)
    ckpt = load_ckpt(art, device)
    feat_cols = load_cols(art)
    x_train = arr_tensor(art.x_train, device, Torch.float32)
    y_train = arr_tensor(art.y_train, device, Torch.long)

    return Bundle(
        device=device,
        ckpt=ckpt,
        feat_cols=feat_cols,
        x_train=x_train,
        y_train=y_train,
    )


def load_ckpt(art: Artifacts, device: Device) -> dict[str, Any]:
    loaded = torch.load(art.ckpt, map_location=device, weights_only=False)
    if not isinstance(loaded, dict):
        raise TypeError(f"Checkpoint must be dict, got {type(loaded).__name__}")
    return cast(dict[str, Any], loaded)


def load_cols(art: Artifacts) -> list[str]:
    raw = json.loads(art.feat_cols.read_text())
    if not isinstance(raw, list) or not all(isinstance(item, str) for item in cast(list[Any], raw)):
        raise TypeError("feature_cols.json must contain list[str]")
    return cast(list[str], raw)


def arr_tensor(path: Any, device: Device, dtype: DType) -> Tensor:
    arr = np.load(path)
    return Torch.as_tensor(arr, dtype=dtype, device=device)
