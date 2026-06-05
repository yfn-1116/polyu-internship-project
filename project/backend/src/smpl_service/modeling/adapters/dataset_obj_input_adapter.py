from __future__ import annotations

from pathlib import Path

from smpl_service.modeling.domain.contracts import BodyInput


class DatasetObjInputAdapter:
    def load(self, input_path: Path) -> BodyInput:
        if not input_path.exists():
            raise FileNotFoundError(f"dataset obj not found: {input_path}")
        if input_path.suffix.lower() != ".obj":
            raise ValueError(f"dataset input must be an OBJ file: {input_path}")

        material_path = input_path.with_name("material0.mtl")
        texture_path = input_path.with_name("material0.jpeg")
        metadata = {
            "dataset": "thuman2-sample",
            "mesh_path": str(input_path),
        }
        if material_path.exists():
            metadata["material_path"] = str(material_path)
        if texture_path.exists():
            metadata["texture_path"] = str(texture_path)

        return BodyInput(
            source_type="dataset-obj",
            subject_id=input_path.stem,
            input_files=[str(input_path)],
            metadata=metadata,
        )
