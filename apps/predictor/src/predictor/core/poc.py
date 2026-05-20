from dataclasses import dataclass
from typing import Any, cast

import numpy as np
from scipy.fftpack import fft2, fftshift, ifft2  # type: ignore[reportMissingTypeStubs]

Fft2 = cast(Any, fft2)
Ifft2 = cast(Any, ifft2)
Fftshift = cast(Any, fftshift)

Array = Any


@dataclass(frozen=True)
class PocResult:
    poc: Array
    origins: Array
    rects: Array

    def legacy(self) -> list[Array]:
        return [self.poc, self.origins, self.rects]


class POC:
    def __init__(self, imgBlockCur: Array, imgBlockRef: Array, blockSize: int) -> None:
        self.imgBlockCur = imgBlockCur
        self.imgBlockRef = imgBlockRef
        self.blockSize = blockSize

    def hannCalc(self) -> Array:
        return hann(self.blockSize)

    def calcPOC(
        self,
        block_ref: Array,
        block_curr: Array,
        window: Array,
        mb_x: int,
        mb_y: int,
    ) -> Array:
        return calc_poc(block_ref, block_curr, window, mb_x, mb_y)

    def getPOC(self) -> list[Array]:
        return compute_poc(self.imgBlockCur, self.imgBlockRef, self.blockSize).legacy()


def compute_poc(cur: Array, ref: Array, block_size: int) -> PocResult:
    if block_size <= 0:
        raise ValueError("block_size must be positive")
    if cur.shape != ref.shape:
        raise ValueError("cur and ref must have same shape")
    if len(cur.shape) != 2:
        raise ValueError("cur and ref must be grayscale 2D arrays")

    mb_x = block_size
    mb_y = block_size
    window = hann(block_size)
    img0 = cur.astype(int)
    img1 = ref.astype(int)
    cols, rows = img0.shape
    cols_y = np.int16(np.floor(cols / mb_y))
    rows_x = np.int16(np.floor(rows / mb_x))
    mod_y = cols % mb_y
    mod_x = rows % mb_x

    poc = np.zeros((mb_y, mb_x, cols_y * rows_x))
    origins = np.zeros((cols_y * rows_x, 2))
    rects = np.zeros((cols_y * rows_x, 4))

    nm = 0
    n_yy = 1
    for y in range(0, cols - mod_y, mb_y):
        n_xx = 1
        for x in range(0, rows - mod_x, mb_x):
            block_curr = img0[y : y + mb_y, x : x + mb_x]
            block_ref = img1[y : y + mb_y, x : x + mb_x]
            rects[nm, :] = [x, y, mb_x, mb_y]
            poc[:, :, nm] = calc_poc(block_ref, block_curr, window, mb_x, mb_y)
            origins[nm, 0] = n_xx * mb_x
            origins[nm, 1] = n_yy * mb_y
            n_xx += 1
            nm += 1
        n_yy += 1
    return PocResult(poc=poc, origins=origins, rects=rects)


def hann(block_size: int) -> Array:
    window = np.hanning(block_size)
    return np.dot(window.T, window)


def calc_poc(block_ref: Array, block_curr: Array, window: Array, mb_x: int, mb_y: int) -> Array:
    fft_ref = Fft2(np.dot(block_ref, window), (mb_x, mb_y))
    fft_curr = Fft2(np.dot(block_curr, window), (mb_x, mb_y))
    r1 = fft_ref * np.conj(fft_curr)
    r2 = abs(r1)
    r2[r2 == 0] = 1e-31
    r = r1 / r2
    r = Ifft2(r)
    r = abs(r)
    return Fftshift(r)
