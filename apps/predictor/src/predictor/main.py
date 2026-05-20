import asyncio

from predictor.config import get_settings
from predictor.server import serve


def main() -> None:
    asyncio.run(serve(get_settings()))


if __name__ == "__main__":
    main()
