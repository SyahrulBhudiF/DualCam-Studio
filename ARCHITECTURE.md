# Architecture

## High-level

```txt
Browser
  -> TanStack Start web app
  -> PostgreSQL via Drizzle/Effect services
  -> shared video_uploads file refs
  -> Python predictor over gRPC
  -> prediction_results table
```

## Web app

Path:

```txt
apps/web
```

Responsibilities:

```txt
- questionnaire UI
- video upload/recording
- response persistence
- explicit prediction opt-in checkbox
- public token-gated prediction result route
- admin response detail + prediction controls
```

Important files:

```txt
src/apis/questionnaire.ts
src/apis/segmented-upload.ts
src/apis/prediction.ts
src/infrastructure/services/prediction-result.ts
src/infrastructure/services/result-access.ts
src/infrastructure/grpc/prediction.ts
src/features/questionnaire/PredictionResultPage.tsx
src/features/admin/responses/components/PredictionResultsCard.tsx
```

## Prediction access flow

Default submit does not predict.

```txt
predictionOptIn=false
  -> submit response
  -> create response_result_access token with prediction_opt_in=false
  -> redirect /success
  -> public prediction API rejects

predictionOptIn=true
  -> submit response
  -> create response_result_access token with prediction_opt_in=true
  -> redirect /prediction/:responseId?token=...
  -> public prediction API allowed
```

Token design:

```txt
- raw token returned once after submit
- DB stores only SHA-256 token hash
- public result access requires responseId + token
- email is not used as public authorization
```

Admin flow:

```txt
admin response detail
  -> getPredictionResults(responseId)
  -> runPrediction(responseId)
  -> no public token needed
```

## Predictor

Path:

```txt
apps/predictor
```

Runtime:

```txt
gRPC PredictQuiz request
  -> validate video refs
  -> resolve safe path under video_uploads
  -> OpenCV frame decode
  -> dlib face ROI extraction
  -> engineered feature pipeline
  -> FeatureSchema matrix validation/order
  -> TABR inference
  -> return per-video statuses
```

Important files:

```txt
src/predictor/server.py
src/predictor/predict.py
src/predictor/runtime.py
src/predictor/video.py
src/predictor/features/pipeline.py
src/predictor/features/schema.py
src/predictor/infer.py
src/predictor/model.py
src/predictor/artifacts.py
src/predictor/config.py
```

## Model/artifact source

Predictor defaults:

```txt
PREDICTOR_TABR_ROOT = apps/predictor/vendor/tabular-dl-tabr-official
PREDICTOR_EXP_NAME = convat_apex_anxiety_qwalk_q12_q3_q4
PREDICTOR_EVALUATION_SEED = 4
PREDICTOR_THRESHOLD = 0.235
PREDICTOR_AGGREGATION = mean
```

Loaded artifacts:

```txt
vendor/tabular-dl-tabr-official/bin/tabr.py
vendor/tabular-dl-tabr-official/exp/tabr/convat_apex_anxiety_qwalk_q12_q3_q4/0-evaluation/4/checkpoint.pt
vendor/tabular-dl-tabr-official/exp/tabr/convat_apex_anxiety_qwalk_q12_q3_q4/0-evaluation/4.toml
vendor/tabular-dl-tabr-official/data/convat_apex_anxiety_qwalk_q12_q3_q4/feature_cols.json
vendor/tabular-dl-tabr-official/data/convat_apex_anxiety_qwalk_q12_q3_q4/X_num_train.npy
vendor/tabular-dl-tabr-official/data/convat_apex_anxiety_qwalk_q12_q3_q4/Y_train.npy
```

So yes: current trained model comes from vendored TABR artifacts, not live import from `Skripsi/Convat-1st`.

## Shared video storage

Default upload root:

```txt
video_uploads
```

Prediction uses file refs, not browser-to-Python video streaming.

Path safety:

```txt
- absolute paths rejected
- traversal rejected
- paths must resolve under upload root
```

## Database

Prediction tables:

```txt
prediction_results
response_result_access
```

Migration commands:

```bash
moon run web:db-generate
moon run web:db-migrate
moon run web:db-studio
moon run web:db-check-destructive
```

Avoid production `db:push`; use generated migrations + `db:migrate`.
