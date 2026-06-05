from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from smpl_service.modeling.domain.contracts import BodyInput


@dataclass(frozen=True)
class MeshData:
    vertices: list[tuple[float, float, float]]
    faces: list[tuple[int, int, int]]


class ModelBackend(Protocol):
    def run(self, body_input: BodyInput) -> MeshData:
        """Generate mesh data from a normalized body input."""
