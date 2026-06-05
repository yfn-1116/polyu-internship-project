from __future__ import annotations

from dataclasses import asdict, dataclass
from pathlib import Path


@dataclass(frozen=True)
class MeshExportResult:
    model_type: str
    gender: str
    shape_preset: str
    vertices_count: int
    faces_count: int
    obj_path: Path
    manifest_path: Path

    def to_dict(self) -> dict[str, object]:
        payload = asdict(self)
        payload["obj_path"] = str(self.obj_path)
        payload["manifest_path"] = str(self.manifest_path)
        return payload
