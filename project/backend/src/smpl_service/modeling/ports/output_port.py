from __future__ import annotations

from pathlib import Path
from typing import Protocol

from smpl_service.modeling.domain.contracts import Manifest
from smpl_service.modeling.ports.model_port import MeshData


class OutputWriter(Protocol):
    def write(self, mesh: MeshData, manifest: Manifest, task_dir: Path) -> Path:
        """Write mesh artifacts and manifest, returning manifest path."""
