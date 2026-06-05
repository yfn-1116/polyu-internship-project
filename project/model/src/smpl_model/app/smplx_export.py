from __future__ import annotations

import json
from pathlib import Path

import smplx
import torch
import trimesh

from smpl_model.domain.mesh_export import MeshExportResult


SUPPORTED_GENDERS = {"neutral", "male", "female"}
SHAPE_PRESETS = {
    "default": [0.0] * 10,
    "slim": [-2.0, 0.6, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    "broad": [2.0, -0.4, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    "tall": [0.0, 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    "short": [0.0, -2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
}


def export_default_smplx(
    project_root: Path,
    output_dir: Path,
    gender: str = "neutral",
    shape_preset: str = "default",
) -> MeshExportResult:
    normalized_gender = gender.lower()
    if normalized_gender not in SUPPORTED_GENDERS:
        raise ValueError(f"unsupported gender: {gender}")
    normalized_preset = shape_preset.lower()
    if normalized_preset not in SHAPE_PRESETS:
        raise ValueError(f"unsupported shape_preset: {shape_preset}")

    model_dir = project_root / "models" / "smplx"
    if not model_dir.is_dir():
        raise FileNotFoundError(f"SMPL-X model directory not found: {model_dir}")
    model_file = model_dir / f"SMPLX_{normalized_gender.upper()}.npz"
    if not model_file.is_file():
        raise FileNotFoundError(f"SMPL-X model file not found: {model_file}")

    output_dir.mkdir(parents=True, exist_ok=True)
    obj_path = output_dir / "body.obj"
    manifest_path = output_dir / "manifest.json"

    body_model = smplx.create(
        model_path=str(model_file),
        model_type="smplx",
        gender=normalized_gender,
        ext="npz",
        use_pca=False,
        batch_size=1,
    )
    body_model.eval()

    with torch.no_grad():
        betas = torch.tensor([SHAPE_PRESETS[normalized_preset]], dtype=torch.float32)
        output = body_model(betas=betas, return_verts=True)

    vertices = output.vertices.detach().cpu().numpy()[0]
    faces = body_model.faces

    mesh = trimesh.Trimesh(vertices=vertices, faces=faces, process=False)
    mesh.export(obj_path)

    result = MeshExportResult(
        model_type="smplx",
        gender=normalized_gender,
        shape_preset=normalized_preset,
        vertices_count=int(vertices.shape[0]),
        faces_count=int(faces.shape[0]),
        obj_path=obj_path,
        manifest_path=manifest_path,
    )
    manifest_path.write_text(
        json.dumps(result.to_dict(), indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    return result
