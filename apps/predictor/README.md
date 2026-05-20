# QUIS Predictor

Python gRPC predictor backend for QUIS.

## Run

```bash
uv sync
uv run python -m predictor.main
```

## Bundled TABR

TABR code/artifacts are vendored under:

```txt
apps/predictor/vendor/tabular-dl-tabr-official
```

Original feature parity sources are vendored under:

```txt
apps/predictor/vendor/convat
```

## Config

Environment defaults are workspace-relative unless overridden:

```txt
PREDICTOR_HOST=127.0.0.1
PREDICTOR_PORT=50051
PREDICTOR_PROJECT_ROOT=<QUIS workspace root>
PREDICTOR_UPLOAD_ROOT=<QUIS workspace root>/video_uploads
PREDICTOR_TABR_ROOT=<predictor app>/vendor/tabular-dl-tabr-official
PREDICTOR_EXP_NAME=convat_apex_anxiety_qwalk_q12_q3_q4
PREDICTOR_EVALUATION_SEED=4
PREDICTOR_THRESHOLD=0.235
PREDICTOR_AGGREGATION=mean
PREDICTOR_DEVICE=auto
```
