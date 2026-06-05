from __future__ import annotations

from smpl_service.modeling.domain.contracts import BodyInput
from smpl_service.modeling.ports.model_port import MeshData


class MockModelBackend:
    def run(self, body_input: BodyInput) -> MeshData:
        height = float(body_input.metadata.get("height_cm", 170)) / 100.0
        half_width = 0.25
        depth = 0.16

        vertices = [
            (-half_width, 0.0, -depth),
            (half_width, 0.0, -depth),
            (half_width, height, -depth),
            (-half_width, height, -depth),
            (-half_width, 0.0, depth),
            (half_width, 0.0, depth),
            (half_width, height, depth),
            (-half_width, height, depth),
        ]
        faces = [
            (1, 2, 3),
            (1, 3, 4),
            (5, 8, 7),
            (5, 7, 6),
            (1, 5, 6),
            (1, 6, 2),
            (2, 6, 7),
            (2, 7, 3),
            (3, 7, 8),
            (3, 8, 4),
            (4, 8, 5),
            (4, 5, 1),
        ]
        return MeshData(vertices=vertices, faces=faces)
