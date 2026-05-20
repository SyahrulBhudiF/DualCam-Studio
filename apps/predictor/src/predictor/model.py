import importlib.util
import json
import os
import sys
import tomllib
from dataclasses import dataclass
from pathlib import Path
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
    model: Any
    ckpt: dict[str, Any]
    feat_cols: list[str]
    x_train: Tensor
    y_train: Tensor
    context_size: int

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
            "context_size": self.context_size,
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
    cfg = load_cfg(art)
    x_train = arr_tensor(art.x_train, device, Torch.float32)
    y_train = arr_tensor(art.y_train, device, Torch.long)
    model = build_original_model(art, cfg, len(feat_cols), device)
    state = ckpt.get("model")
    if state is None:
        raise KeyError("Checkpoint missing model state")
    model.load_state_dict(state)
    model.eval()

    return Bundle(
        device=device,
        model=model,
        ckpt=ckpt,
        feat_cols=feat_cols,
        x_train=x_train,
        y_train=y_train,
        context_size=int(cfg["context_size"]),
    )


def load_ckpt(art: Artifacts, device: Device) -> dict[str, Any]:
    loaded = torch.load(art.ckpt, map_location=device, weights_only=False)
    if not isinstance(loaded, dict):
        raise TypeError(f"Checkpoint must be dict, got {type(loaded).__name__}")
    return cast(dict[str, Any], loaded)


def load_cols(art: Artifacts) -> list[str]:
    raw = json.loads(art.feat_cols.read_text())
    if not isinstance(raw, list) or not all(
        isinstance(item, str) for item in cast(list[Any], raw)
    ):
        raise TypeError("feature_cols.json must contain list[str]")
    return cast(list[str], raw)


def load_cfg(art: Artifacts) -> dict[str, Any]:
    return tomllib.loads(art.seed_cfg.read_text())


def build_original_model(art: Artifacts, cfg: dict[str, Any], n_feats: int, device: Device) -> Any:
    tabr = load_tabr_module(art.tabr)
    params = cast(dict[str, Any], cfg["model"]).copy()
    if params.get("num_embeddings") == "__null__":
        params["num_embeddings"] = None
    model = tabr.Model(
        n_num_features=n_feats,
        n_bin_features=0,
        cat_cardinalities=[],
        n_classes=2,
        **params,
    )
    return model.to(device)


def load_tabr_module(root: Path) -> Any:
    root_str = str(root)
    os.environ.setdefault("PROJECT_DIR", root_str)
    if root_str not in sys.path:
        sys.path.insert(0, root_str)
    path = root / "bin" / "tabr.py"
    spec = importlib.util.spec_from_file_location("original_tabr", path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Cannot load TABR module: {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules["original_tabr"] = module
    spec.loader.exec_module(module)
    return module


def arr_tensor(path: Any, device: Device, dtype: DType) -> Tensor:
    arr = np.load(path)
    return Torch.as_tensor(arr, dtype=dtype, device=device)
