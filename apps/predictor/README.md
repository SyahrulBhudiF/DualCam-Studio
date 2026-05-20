# QUIS Predictor

Python gRPC predictor backend for QUIS.

## Run

```bash
uv sync
uv run python -m predictor.main
```

## Config

Environment defaults:

```txt
PREDICTOR_HOST=127.0.0.1
PREDICTOR_PORT=50051
PREDICTOR_PROJECT_ROOT=/home/ryuko/skripsi/QUIS
PREDICTOR_UPLOAD_ROOT=/home/ryuko/skripsi/QUIS/video_uploads
PREDICTOR_TABR_ROOT=/home/ryuko/skripsi/Skripsi/Convat-1st
PREDICTOR_EXP_NAME=convat_apex_anxiety_qwalk_q12_q3_q4
PREDICTOR_EVALUATION_SEED=4
PREDICTOR_THRESHOLD=0.235
PREDICTOR_AGGREGATION=mean
PREDICTOR_DEVICE=auto
```
