import numpy as np
from scipy.signal import savgol_filter


class ApexSmoother:

    WINDOW_LENGTH_PERCENTAGE = 0.05
    MAX_WINDOW_LENGTH = 31

    @staticmethod
    def calculate_window_length(length: int) -> int:
        """
        Menghitung panjang window yang sesuai untuk melakukan perataan pada magnitudo sinyal.

        Args:
            length (int): Panjang sinyal input.

        Returns:
            int: Panjang window yang digunakan untuk perataan.
        """

        window_length = int(length * ApexSmoother.WINDOW_LENGTH_PERCENTAGE)

        # Jika panjang window genap, tambahkan 1 agar menjadi ganjil
        # Hal ini untuk savgol filter yang memerlukan panjang window ganjil
        if window_length % 2 == 0: window_length += 1

        # Membatasi panjang window antara 5 hingga MAX_WINDOW_LENGTH
        # Strategi ini untuk menghindari over-smoothing pada sinyal pendek
        window_length = max(5, min(window_length, ApexSmoother.MAX_WINDOW_LENGTH))

        return window_length


    @staticmethod
    def calculate_polyorder(window_length: int) -> int:
        """
        Menghitung orde polinomial yang sesuai untuk savgol filter berdasarkan panjang window.

        Args:
            window_length (int): Panjang window yang digunakan untuk perataan.

        Returns:
            int: Orde polinomial yang digunakan dalam savgol filter.
        """

        match window_length:
            case wl if wl <= 7:
                return 2
            case wl if wl <= 15:
                return 3
            case _:
                return 4


    @staticmethod
    def smooth(signal: list) -> list:
        """
        Melakukan perataan sinyal menggunakan Savitzky-Golay filter
        dengan parameter window dan polyorder yang dihitung secara adaptif.

        Args:
            signal (list): Sinyal input yang akan diratakan.

        Returns:
            list: Sinyal yang sudah diratakan.

        Raises:
            ValueError: Jika sinyal terlalu pendek untuk di-smooth.
        """
        length = len(signal)
        window_length = ApexSmoother.calculate_window_length(length)
        polyorder = ApexSmoother.calculate_polyorder(window_length)

        if window_length >= length:
            raise ValueError(
                f"Sinyal terlalu pendek ({length} sampel) untuk di-smooth "
                f"(window_length={window_length})"
            )

        smoothed = savgol_filter(signal, window_length=window_length, polyorder=polyorder)
        return smoothed.tolist()
