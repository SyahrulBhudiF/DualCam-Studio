from predictor.config import get_settings


def main() -> None:
    settings = get_settings()
    print(f"QUIS predictor skeleton listening target: {settings.bind_address}")
    print(f"Upload root: {settings.upload_root}")
    print(f"Experiment root: {settings.experiment_root}")
    print(f"Device: {settings.device}")


if __name__ == "__main__":
    main()
