import numpy as np

def average(arr):
    unique, counts = np.unique(arr, return_counts=True)
    return unique[np.argmax(counts)]


def format_number_and_round_numpy(number):
    if isinstance(number, (np.integer, int)):
        return int(number)

    if isinstance(number, (np.floating, float)):
        return float(round(number, 3))

    raise ValueError(f"Invalid number type: {type(number)}")


def format_number_and_round(number):
    if not isinstance(number, (int, float)):
        raise ValueError(f"Invalid number type: {type(number)}")

    if isinstance(number, int):
        return number

    # float
    if number.is_integer():
        return int(number)

    return float(round(number, 3))
