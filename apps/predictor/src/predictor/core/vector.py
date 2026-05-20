from dataclasses import dataclass
from typing import Any

import numpy as np

Array = Any


@dataclass(frozen=True)
class VectorResult:
    vectors: Array

    def legacy(self) -> Array:
        return self.vectors


class Vektor:
    def __init__(self, pocOutput: list[Array], blockSize: int) -> None:
        self.poc = pocOutput[0]
        self.coorAwal = pocOutput[1]
        self.blockSize = blockSize

    def getVektor(self) -> Array:
        return compute_vectors(self.poc, self.coorAwal, self.blockSize).legacy()


def compute_vectors(poc: Array, origins: Array, block_size: int) -> VectorResult:
    if block_size <= 0:
        raise ValueError("block_size must be positive")
    if len(poc.shape) != 3:
        raise ValueError("poc must have shape (block_size, block_size, n_blocks)")
    if poc.shape[0] != block_size or poc.shape[1] != block_size:
        raise ValueError("poc first two dimensions must equal block_size")
    if len(origins) != poc.shape[2]:
        raise ValueError("origins length must match poc block count")

    mb_x = block_size
    mb_y = block_size
    cur_x = np.arange(0, mb_x)
    cur_y = np.arange(0, mb_y)
    center = np.int16(np.median(cur_x))
    med_x = center + 1
    med_y = center + 1
    rep_x = np.arange(-(center), med_x)
    rep_y = np.arange(center, -(med_x), -1)
    output = np.zeros((len(origins), 6))

    for i in range(poc.shape[2]):
        r = poc[:, :, i]
        temp_y, temp_x = np.where(r == np.max(r))

        if len(temp_y) > 1 or len(temp_y) > 1:
            temp_x = center
            temp_y = center
        else:
            temp_x = temp_x[0]
            temp_y = temp_y[0]

            if temp_x != center or temp_y != center:
                cor_x = origins[i][0]
                cor_y = origins[i][1]
                t_x = cor_x - med_x
                t_y = cor_y - med_y
                o_x = rep_x[cur_x[temp_x]]
                o_y = rep_y[cur_y[temp_y]]
                m_x = cor_x - (mb_x - temp_x)
                m_y = cor_y - (mb_y - temp_y)
                p1 = [t_x, t_y]
                p2 = [m_x, m_y]
                vector = np.array(p2) - np.array(p1)

                output[i, 0] = p1[0]
                output[i, 1] = p1[1]
                output[i, 2] = vector[0]
                output[i, 3] = vector[1]
                output[i, 4] = o_x
                output[i, 5] = o_y
    return VectorResult(output)
