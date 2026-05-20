import numpy as np
from scipy.signal import find_peaks


class ApexPhase:

    # Ambang batas yang digunakan untuk menentukan jarak antar titik puncak
    DISTANCE_THRESHOLD = 5

    # Jarak merge: dua puncak yang lebih dekat dari ini akan digabung jadi satu
    # Dibuat terpisah dari DISTANCE_THRESHOLD agar merging lebih agresif
    MERGE_DISTANCE_THRESHOLD = 10

    # Ambang batas yang digunakan untuk menentukan keunggulan puncak
    PROMINENCE_THRESHOLD = 0.1

    # Ambang batas yang digunakan untuk menentukan lebar fase puncak
    PEAK_CUTOFF_THRESHOLD = 0.10

    # Threshold untuk mendeteksi uptick signifikan saat mencari valley (Pass 1).
    # Dibuat lebih tinggi dari PEAK_CUTOFF_THRESHOLD agar valley search lebih permisif
    # dan tidak berhenti prematur akibat noise kecil → offset bisa turun ke baseline.
    VALLEY_UPTICK_THRESHOLD = 0.75

    # Radius pencarian maksimal dari apex untuk onset/offset
    MAX_SEARCH_RADIUS = 100

    def __init__(self,
                 distance_threshold: int = DISTANCE_THRESHOLD,
                 merge_distance: int = MERGE_DISTANCE_THRESHOLD,
                 prominence_threshold: float = PROMINENCE_THRESHOLD,
                 cutoff_ratio: float = PEAK_CUTOFF_THRESHOLD,
                 valley_uptick_threshold: float = VALLEY_UPTICK_THRESHOLD) -> None:

        self.distance = distance_threshold
        self.merge_distance = merge_distance
        self.prominence = prominence_threshold
        self.cutoff_ratio = cutoff_ratio
        self.valley_uptick_threshold = valley_uptick_threshold


    def find_apex(self, signal: list, height: float = None) -> list:
        """
        Mendeteksi titik puncak (apex) dalam sinyal menggunakan metode find_peaks dari scipy.

        Args:
            signal (list): Sinyal input yang akan dianalisis.
            height (float): Ambang batas tinggi minimum untuk peak.
                            Jika None, tidak ada filter tinggi.

        Returns:
            list: Indeks titik puncak yang terdeteksi dalam sinyal.
        """
        kwargs = dict(distance=self.distance, prominence=self.prominence)
        if height is not None:
            kwargs['height'] = height

        peaks, _ = find_peaks(signal, **kwargs)
        return peaks.tolist()


    def find_top_k_apex(self, signal: list, k: int = 0, height: float = None) -> list:
        """
        Mendeteksi top-K titik puncak berdasarkan prominence tertinggi.
        Otomatis menggabungkan puncak-puncak yang terlalu berdekatan
        menggunakan self.merge_distance sebelum dikembalikan.

        Args:
            signal (list): Sinyal input yang akan dianalisis.
            k (int): Jumlah maksimal apex yang dikembalikan (0 = semua).
            height (float): Ambang batas tinggi minimum untuk peak.

        Returns:
            list: Indeks titik puncak (setelah merge), diurutkan secara ascending.
        """
        kwargs = dict(distance=self.distance, prominence=self.prominence)
        if height is not None:
            kwargs['height'] = height

        peaks, _ = find_peaks(signal, **kwargs)
        peaks = peaks.tolist()

        # ── Auto-merge: gabungkan puncak yang terlalu berdekatan ──
        peaks = self.merge_nearby_peaks(signal, peaks, merge_distance=self.merge_distance)

        # ── Top-K filter: ambil k puncak dengan nilai sinyal tertinggi ──
        # k=0 → kembalikan semua (skip filter)
        if k > 0 and len(peaks) > k:
            # Gunakan signal Python list langsung (bukan numpy) agar type-safe
            peaks = sorted(peaks, key=lambda p: signal[p], reverse=True)[:k]
            peaks = sorted(peaks)  # kembalikan ke urutan kronologis (ascending)

        return peaks


    def merge_nearby_peaks(self, signal: list, peaks: list, merge_distance: int = None) -> list:
        """
        Menggabungkan puncak-puncak yang terlalu berdekatan menjadi satu puncak.
        Jika jarak antar dua puncak < merge_distance, puncak dengan nilai lebih rendah
        akan dihapus dan hanya puncak tertinggi yang dipertahankan.

        Args:
            signal (list): Sinyal input.
            peaks (list): Daftar indeks puncak yang sudah terdeteksi.
            merge_distance (int): Jarak minimum antar puncak. Jika None, gunakan self.distance.

        Returns:
            list: Daftar indeks puncak setelah penggabungan.
        """
        if len(peaks) <= 1:
            return peaks

        min_dist = merge_distance if merge_distance is not None else self.distance
        signal = np.array(signal)
        merged = list(peaks)

        changed = True
        while changed:
            changed = False
            result = []
            skip = set()
            for i in range(len(merged)):
                if i in skip:
                    continue
                if i + 1 < len(merged) and (merged[i + 1] - merged[i]) < min_dist:
                    # Pertahankan puncak dengan nilai lebih tinggi
                    if signal[merged[i]] >= signal[merged[i + 1]]:
                        result.append(merged[i])
                    else:
                        result.append(merged[i + 1])
                    skip.add(i + 1)
                    changed = True
                else:
                    result.append(merged[i])
            merged = result

        return merged


    def find_phase(self, signal: list, apex_indices: list, cutoff_ratio: float = None) -> dict:
        """
        Mendeteksi fase apex berdasarkan sinyal dan indeks apex yang sudah ditemukan.

        Menggunakan two-pass approach:
        1. Cari local valley kiri/kanan dari apex
        2. Gunakan valley sebagai bound, lalu apply cutoff threshold

        Args:
            signal (list): Sinyal input yang akan diproses.
            apex_indices (list): Daftar indeks apex yang sudah ditemukan.
            cutoff_ratio (float): Rasio cutoff. Jika None, menggunakan self.cutoff_ratio.

        Returns:
            dict: Kamus yang berisi informasi fase apex.
        """
        cutoff = cutoff_ratio if cutoff_ratio is not None else self.cutoff_ratio
        phases = dict()

        for idx, apex_index in enumerate(apex_indices):

            # Midpoint boundary (mencegah tumpang tindih antar fase)
            left_bound = 0 if idx == 0 else (apex_indices[idx - 1] + apex_index) // 2
            right_bound = len(signal) - 1 if idx == len(apex_indices) - 1 else (apex_index + apex_indices[idx + 1]) // 2

            start_index, end_index = self.__find_phase_boundaries(signal=signal,
                                                                  apex_index=apex_index,
                                                                  cutoff_ratio=cutoff,
                                                                  left_bound=left_bound,
                                                                  right_bound=right_bound)

            # Clamp hasil ke midpoint boundary agar fase antar apex tidak overlap
            start_index = max(start_index, left_bound)
            end_index = min(end_index, right_bound)

            phases[apex_index] = dict(start=start_index, end=end_index)

        return phases


    def __find_phase_boundaries(self,
                                signal: list,
                                apex_index: int,
                                cutoff_ratio: float,
                                left_bound: int = 0,
                                right_bound: int = None) -> tuple:
        """
        Mendeteksi batas fase apex menggunakan two-pass approach:
        1. Pass 1: Cari local valley (titik terendah lokal) kiri/kanan dari apex
        2. Pass 2: Dari valley, gunakan cutoff threshold untuk menentukan onset/offset

        Args:
            signal (list): Sinyal input yang akan dianalisis.
            apex_index (int): Indeks titik apex dalam sinyal.
            cutoff_ratio (float): Rasio cutoff untuk menentukan batas fase.
            left_bound (int): Batas kiri pencarian (mencegah tumpang tindih).
            right_bound (int): Batas kanan pencarian (mencegah tumpang tindih).

        Returns:
            tuple: Indeks batas awal dan akhir fase apex.
        """
        if right_bound is None:
            right_bound = len(signal) - 1

        # Batasi search radius agar tidak terlalu lebar
        effective_left = max(left_bound, apex_index - self.MAX_SEARCH_RADIUS)
        effective_right = min(right_bound, apex_index + self.MAX_SEARCH_RADIUS)

        signal_arr = np.array(signal)
        apex_value = float(signal_arr[apex_index])

        # ── Pass 1: Cari valley kiri dengan rolling-minimum + significant-uptick ──
        # Jalan ke kiri dari apex, track running minimum.
        # Berhenti kalau sinyal naik signifikan (> valley_uptick_threshold × amplitude).
        # Catatan: menggunakan valley_uptick_threshold (lebih tinggi dari cutoff_ratio)
        # agar search tidak berhenti prematur karena noise kecil → offset bisa mencapai baseline.
        run_min_val_l = apex_value
        run_min_idx_l = apex_index
        for i in range(apex_index - 1, effective_left - 1, -1):
            val = float(signal_arr[i])
            if val < run_min_val_l:
                run_min_val_l = val
                run_min_idx_l = i
            else:
                amp_range = apex_value - run_min_val_l
                if amp_range > 0 and (val - run_min_val_l) / amp_range > self.valley_uptick_threshold:
                    break  # kenaikan sangat signifikan → puncak baru, stop
        valley_left = run_min_idx_l

        # ── Pass 1: Cari valley kanan dengan rolling-minimum + significant-uptick ──
        # Jalan ke kanan dari apex, track running minimum.
        # Berhenti kalau sinyal naik signifikan (> valley_uptick_threshold × amplitude).
        # Catatan: menggunakan valley_uptick_threshold (lebih tinggi dari cutoff_ratio)
        # agar search tidak berhenti prematur karena noise kecil → offset bisa mencapai baseline.
        run_min_val_r = apex_value
        run_min_idx_r = apex_index
        for i in range(apex_index + 1, effective_right + 1):
            val = float(signal_arr[i])
            if val < run_min_val_r:
                run_min_val_r = val
                run_min_idx_r = i
            else:
                amp_range = apex_value - run_min_val_r
                if amp_range > 0 and (val - run_min_val_r) / amp_range > self.valley_uptick_threshold:
                    break  # kenaikan sangat signifikan → puncak baru, stop
        valley_right = run_min_idx_r

        # ── Pass 2: Apply cutoff threshold dalam range valley ──
        apex_value = signal_arr[apex_index]

        # Local min hanya dalam range valley (bukan seluruh boundary)
        local_min_left = float(signal_arr[valley_left:apex_index + 1].min())
        local_min_right = float(signal_arr[apex_index:valley_right + 1].min())
        local_min = min(local_min_left, local_min_right)

        threshold = local_min + (apex_value - local_min) * cutoff_ratio

        # Onset: dari apex mundur sampai threshold
        onset_index = valley_left
        for i in range(apex_index, valley_left - 1, -1):
            if signal[i] <= threshold:
                onset_index = i
                break

        # Offset: dari apex maju sampai threshold
        offset_index = valley_right
        for i in range(apex_index, valley_right + 1):
            if signal[i] <= threshold:
                offset_index = i
                break

        return onset_index, offset_index
