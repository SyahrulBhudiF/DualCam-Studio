from dataclasses import dataclass
from typing import Any, cast

import numpy as np
from scipy.signal import find_peaks, savgol_filter  # type: ignore[reportMissingTypeStubs]

FindPeaks = cast(Any, find_peaks)
Savgol = cast(Any, savgol_filter)


@dataclass(frozen=True)
class SpotConfig:
    min_phase_duration: int = 2
    top_k_apex: int = 5
    distance_threshold: int = 1
    merge_distance: int = 10
    prominence_threshold: float = 0.005
    cutoff_ratio: float = 0.3


@dataclass(frozen=True)
class Event:
    event_no: int
    onset_signal: int
    apex_signal: int
    offset_signal: int
    duration: int

    def as_dict(self) -> dict[str, int]:
        return {
            "event_no": self.event_no,
            "onset_signal": self.onset_signal,
            "apex_signal": self.apex_signal,
            "offset_signal": self.offset_signal,
            "duration": self.duration,
        }


@dataclass(frozen=True)
class SpotResult:
    smoothed: list[float]
    events: list[Event]
    meta: dict[str, float | int]

    def legacy(self) -> tuple[list[float], list[dict[str, int]], dict[str, float | int]]:
        return self.smoothed, [event.as_dict() for event in self.events], self.meta


class ApexSmoother:
    WINDOW_LENGTH_PERCENTAGE = 0.05
    MAX_WINDOW_LENGTH = 31

    @staticmethod
    def calculate_window_length(length: int) -> int:
        window_length = int(length * ApexSmoother.WINDOW_LENGTH_PERCENTAGE)
        if window_length % 2 == 0:
            window_length += 1
        return max(5, min(window_length, ApexSmoother.MAX_WINDOW_LENGTH))

    @staticmethod
    def calculate_polyorder(window_length: int) -> int:
        if window_length <= 7:
            return 2
        if window_length <= 15:
            return 3
        return 4

    @staticmethod
    def smooth(signal: list[float]) -> list[float]:
        length = len(signal)
        window_length = ApexSmoother.calculate_window_length(length)
        polyorder = ApexSmoother.calculate_polyorder(window_length)
        if window_length >= length:
            raise ValueError(
                f"Sinyal terlalu pendek ({length} sampel) untuk di-smooth "
                f"(window_length={window_length})"
            )
        return cast(
            list[float], Savgol(signal, window_length=window_length, polyorder=polyorder).tolist()
        )


class ApexPhase:
    DISTANCE_THRESHOLD = 5
    MERGE_DISTANCE_THRESHOLD = 10
    PROMINENCE_THRESHOLD = 0.1
    PEAK_CUTOFF_THRESHOLD = 0.10
    VALLEY_UPTICK_THRESHOLD = 0.75
    MAX_SEARCH_RADIUS = 100

    def __init__(
        self,
        distance_threshold: int = DISTANCE_THRESHOLD,
        merge_distance: int = MERGE_DISTANCE_THRESHOLD,
        prominence_threshold: float = PROMINENCE_THRESHOLD,
        cutoff_ratio: float = PEAK_CUTOFF_THRESHOLD,
        valley_uptick_threshold: float = VALLEY_UPTICK_THRESHOLD,
    ) -> None:
        self.distance = distance_threshold
        self.merge_distance = merge_distance
        self.prominence = prominence_threshold
        self.cutoff_ratio = cutoff_ratio
        self.valley_uptick_threshold = valley_uptick_threshold

    def find_apex(self, signal: list[float], height: float | None = None) -> list[int]:
        kwargs: dict[str, Any] = {"distance": self.distance, "prominence": self.prominence}
        if height is not None:
            kwargs["height"] = height
        peaks, _ = FindPeaks(signal, **kwargs)
        return cast(list[int], peaks.tolist())

    def find_top_k_apex(
        self, signal: list[float], k: int = 0, height: float | None = None
    ) -> list[int]:
        peaks = self.find_apex(signal, height)
        peaks = self.merge_nearby_peaks(signal, peaks, merge_distance=self.merge_distance)
        if k > 0 and len(peaks) > k:
            peaks = sorted(peaks, key=lambda p: signal[p], reverse=True)[:k]
            peaks = sorted(peaks)
        return peaks

    def merge_nearby_peaks(
        self, signal: list[float], peaks: list[int], merge_distance: int | None = None
    ) -> list[int]:
        if len(peaks) <= 1:
            return peaks
        min_dist = merge_distance if merge_distance is not None else self.distance
        signal_arr = np.array(signal)
        merged = list(peaks)
        changed = True
        while changed:
            changed = False
            result: list[int] = []
            skip: set[int] = set()
            for i in range(len(merged)):
                if i in skip:
                    continue
                if i + 1 < len(merged) and (merged[i + 1] - merged[i]) < min_dist:
                    if signal_arr[merged[i]] >= signal_arr[merged[i + 1]]:
                        result.append(merged[i])
                    else:
                        result.append(merged[i + 1])
                    skip.add(i + 1)
                    changed = True
                else:
                    result.append(merged[i])
            merged = result
        return merged

    def find_phase(
        self, signal: list[float], apex_indices: list[int], cutoff_ratio: float | None = None
    ) -> dict[int, dict[str, int]]:
        cutoff = cutoff_ratio if cutoff_ratio is not None else self.cutoff_ratio
        phases: dict[int, dict[str, int]] = {}
        for idx, apex_index in enumerate(apex_indices):
            left_bound = 0 if idx == 0 else (apex_indices[idx - 1] + apex_index) // 2
            right_bound = (
                len(signal) - 1
                if idx == len(apex_indices) - 1
                else (apex_index + apex_indices[idx + 1]) // 2
            )
            start, end = self.__find_phase_boundaries(
                signal=signal,
                apex_index=apex_index,
                cutoff_ratio=cutoff,
                left_bound=left_bound,
                right_bound=right_bound,
            )
            phases[apex_index] = {"start": max(start, left_bound), "end": min(end, right_bound)}
        return phases

    def __find_phase_boundaries(
        self,
        signal: list[float],
        apex_index: int,
        cutoff_ratio: float,
        left_bound: int = 0,
        right_bound: int | None = None,
    ) -> tuple[int, int]:
        if right_bound is None:
            right_bound = len(signal) - 1
        effective_left = max(left_bound, apex_index - self.MAX_SEARCH_RADIUS)
        effective_right = min(right_bound, apex_index + self.MAX_SEARCH_RADIUS)
        signal_arr = np.array(signal)
        apex_value = float(signal_arr[apex_index])

        run_min_val_l = apex_value
        run_min_idx_l = apex_index
        for i in range(apex_index - 1, effective_left - 1, -1):
            val = float(signal_arr[i])
            if val < run_min_val_l:
                run_min_val_l = val
                run_min_idx_l = i
            else:
                amp_range = apex_value - run_min_val_l
                if (
                    amp_range > 0
                    and (val - run_min_val_l) / amp_range > self.valley_uptick_threshold
                ):
                    break
        valley_left = run_min_idx_l

        run_min_val_r = apex_value
        run_min_idx_r = apex_index
        for i in range(apex_index + 1, effective_right + 1):
            val = float(signal_arr[i])
            if val < run_min_val_r:
                run_min_val_r = val
                run_min_idx_r = i
            else:
                amp_range = apex_value - run_min_val_r
                if (
                    amp_range > 0
                    and (val - run_min_val_r) / amp_range > self.valley_uptick_threshold
                ):
                    break
        valley_right = run_min_idx_r

        local_min_left = float(signal_arr[valley_left : apex_index + 1].min())
        local_min_right = float(signal_arr[apex_index : valley_right + 1].min())
        local_min = min(local_min_left, local_min_right)
        threshold = local_min + (apex_value - local_min) * cutoff_ratio

        onset_index = valley_left
        for i in range(apex_index, valley_left - 1, -1):
            if signal[i] <= threshold:
                onset_index = i
                break
        offset_index = valley_right
        for i in range(apex_index, valley_right + 1):
            if signal[i] <= threshold:
                offset_index = i
                break
        return onset_index, offset_index


def detect_events(magnitudes: list[float], cfg: SpotConfig | None = None) -> SpotResult:
    cfg = cfg or SpotConfig()
    smoothed = ApexSmoother.smooth(magnitudes)
    signal_arr = np.asarray(smoothed, dtype=float)
    height_threshold = float(signal_arr.mean() + signal_arr.std())
    detector = ApexPhase(
        distance_threshold=cfg.distance_threshold,
        merge_distance=cfg.merge_distance,
        prominence_threshold=cfg.prominence_threshold,
        cutoff_ratio=cfg.cutoff_ratio,
    )
    apex_indices = detector.find_top_k_apex(smoothed, k=cfg.top_k_apex, height=height_threshold)
    phases = detector.find_phase(smoothed, apex_indices) if apex_indices else {}
    events: list[Event] = []
    for event_no, apex_idx in enumerate(apex_indices, start=1):
        phase = phases[apex_idx]
        duration = int(phase["end"] - phase["start"])
        if duration < cfg.min_phase_duration:
            continue
        events.append(
            Event(
                event_no=event_no,
                onset_signal=int(phase["start"]),
                apex_signal=int(apex_idx),
                offset_signal=int(phase["end"]),
                duration=duration,
            )
        )
    window_length = ApexSmoother.calculate_window_length(len(magnitudes))
    meta = {
        "window_length": window_length,
        "polyorder": ApexSmoother.calculate_polyorder(window_length),
        "height_threshold": height_threshold,
    }
    return SpotResult(smoothed=smoothed, events=events, meta=meta)


def signal_index_to_frame_index(signal_index: int) -> int:
    return int(signal_index + 1)
