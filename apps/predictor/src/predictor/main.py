from predictor.config import get_settings


def main() -> None:
    settings = get_settings()
    settings.validate_runtime_paths()

    print("QUIS predictor config")
    for key, value in settings.safe_summary().items():
        print(f"{key}: {value}")


if __name__ == "__main__":
    main()
