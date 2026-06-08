"""ScanInputAdapter — 3D scan (.obj/.ply) → ScanObservation.

Current: file validation + vertex/face counting (if trimesh available).
Future: coordinate normalization, scale estimation, texture path detection.
"""

from __future__ import annotations

from pathlib import Path

from smpl_service.modeling.domain.contracts import BodyInput
from smpl_service.modeling.domain.observations import ScanObservation

SUPPORTED_EXTENSIONS = {".obj", ".ply", ".off", ".stl"}


class ScanInputAdapter:
    def load(self, input_path: Path) -> BodyInput:
        if not input_path.exists():
            raise FileNotFoundError(f"scan file not found: {input_path}")
        if input_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            raise ValueError(
                f"unsupported scan format: {input_path.suffix}. "
                f"supported: {SUPPORTED_EXTENSIONS}"
            )

        vertex_count = None
        face_count = None
        texture = None

        # Try to read basic stats if trimesh is available
        try:
            import trimesh
            mesh = trimesh.load(str(input_path), process=False)
            if mesh is not None:
                vertex_count = len(mesh.vertices) if hasattr(mesh, "vertices") else None
                face_count = len(mesh.faces) if hasattr(mesh, "faces") else None
        except Exception:
            pass

        # Check for sidecar texture
        for ext in (".jpeg", ".jpg", ".png"):
            candidate = input_path.with_name("material0" + ext)
            if candidate.exists():
                texture = str(candidate)
                break

        observation = ScanObservation(
            scan_path=str(input_path),
            texture_path=texture,
            format=input_path.suffix.lower().lstrip("."),
            vertex_count=vertex_count,
            face_count=face_count,
        )

        return BodyInput(
            source_type="scan",
            subject_id=input_path.stem,
            input_files=[str(input_path)],
            metadata={"observation": observation.to_dict()},
        )
