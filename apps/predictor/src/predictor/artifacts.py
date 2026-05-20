from dataclasses import dataclass
from pathlib import Path

from predictor.config import PredictorSettings


@dataclass(frozen=True)
class Artifacts:
    tabr: Path
    exp: Path
    eval_dir: Path
    seed_dir: Path
    seed_cfg: Path
    ckpt: Path
    data: Path
    feat_cols: Path
    x_train: Path
    y_train: Path
    x_val: Path
    y_val: Path
    x_test: Path
    y_test: Path

    def as_map(self) -> dict[str, str]:
        return {key: path.as_posix() for key, path in self.__dict__.items()}

    def validate(self) -> None:
        missing = [path for path in self.as_map().values() if not Path(path).exists()]
        if missing:
            raise FileNotFoundError("Missing model artifacts: " + ", ".join(missing))


def resolve_artifacts(settings: PredictorSettings) -> Artifacts:
    tabr = settings.tabr_root / "third_party" / "tabular-dl-tabr-official"
    exp = tabr / "exp" / "tabr" / settings.exp_name
    eval_dir = exp / "0-evaluation"
    seed_dir = eval_dir / str(settings.evaluation_seed)
    data = tabr / "data" / settings.exp_name

    return Artifacts(
        tabr=tabr,
        exp=exp,
        eval_dir=eval_dir,
        seed_dir=seed_dir,
        seed_cfg=eval_dir / f"{settings.evaluation_seed}.toml",
        ckpt=seed_dir / "checkpoint.pt",
        data=data,
        feat_cols=data / "feature_cols.json",
        x_train=data / "X_num_train.npy",
        y_train=data / "Y_train.npy",
        x_val=data / "X_num_val.npy",
        y_val=data / "Y_val.npy",
        x_test=data / "X_num_test.npy",
        y_test=data / "Y_test.npy",
    )
