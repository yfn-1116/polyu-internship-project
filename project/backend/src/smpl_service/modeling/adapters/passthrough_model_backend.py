from __future__ import annotations

from pathlib import Path

from smpl_service.modeling.domain.contracts import BodyInput
from smpl_service.modeling.ports.model_port import MeshData


class PassthroughModelBackend:
    def run(self, body_input: BodyInput) -> MeshData:
        mesh_path = body_input.metadata.get("mesh_path")
        if not isinstance(mesh_path, str):
            raise ValueError("dataset passthrough requires metadata.mesh_path")
        return MeshData(vertices=[], faces=[], source_obj_path=Path(mesh_path))
