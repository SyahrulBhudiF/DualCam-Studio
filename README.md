# QUIS

Moonrepo workspace for the QUIS questionnaire web app and anxiety prediction backend.

## Projects

```txt
apps/web        TanStack Start web app, admin dashboard, DB/API layer
apps/predictor  Python gRPC predictor runtime
proto           shared gRPC contract
video_uploads   shared local video storage
```

## Common commands

Run from repo root:

```bash
moon run root:dev
moon run web:dev
moon run predictor:dev
moon run root:build --log warn
moon run web:build --log warn
moon run predictor:test
```

Database:

```bash
moon run web:db-generate
moon run web:db-migrate
moon run web:db-studio
moon run web:db-check-destructive
```

Web quality:

```bash
moon run web:format-fix
moon run web:lint-fix
moon run web:format
cd apps/web && bunx react-doctor@latest
```

## Local flow

1. Start web + predictor:

```bash
moon run root:dev
```

2. Submit questionnaire:

```txt
unchecked prediction checkbox -> /success
checked prediction checkbox   -> /prediction/:responseId?token=...
```

4. Admin can open response detail and run/re-run prediction.

## Model source

Current trained model is loaded from vendored TABR artifacts:

```txt
apps/predictor/vendor/tabular-dl-tabr-official
```

Default experiment:

```txt
exp_name        convat_apex_anxiety_qwalk_q12_q3_q4
evaluation_seed 4
checkpoint      exp/tabr/convat_apex_anxiety_qwalk_q12_q3_q4/0-evaluation/4/checkpoint.pt
feature cols    data/convat_apex_anxiety_qwalk_q12_q3_q4/feature_cols.json
```

Not from external runtime path:

```txt
/home/ryuko/skripsi/Skripsi/Convat-1st
```

That old folder was only used as source material before vendoring/parity work.
