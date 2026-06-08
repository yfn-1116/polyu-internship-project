from __future__ import annotations

import json
import shutil
from pathlib import Path

from smpl_service.modeling.domain.contracts import Manifest
from smpl_service.modeling.ports.model_port import MeshData


class FileOutputWriter:
    def write(self, mesh: MeshData, manifest: Manifest, task_dir: Path) -> Path:
        task_dir.mkdir(parents=True, exist_ok=True)
        mesh_path = task_dir / "body.obj"
        manifest_path = task_dir / "manifest.json"

        if mesh.animation_data is not None:
            self._write_animation(mesh, task_dir)
            self._write_manifest(manifest, manifest_path)
            return manifest_path

        self._write_obj(mesh, mesh_path)
        self._write_manifest(manifest, manifest_path)
        return manifest_path

    def _write_obj(self, mesh: MeshData, output_path: Path) -> None:
        if mesh.source_obj_path is not None:
            shutil.copyfile(mesh.source_obj_path, output_path)
            for sidecar_name in ("material0.mtl", "material0.jpeg"):
                sidecar_path = mesh.source_obj_path.with_name(sidecar_name)
                if sidecar_path.exists():
                    shutil.copyfile(sidecar_path, output_path.with_name(sidecar_name))
            return

        lines = ["# mock body mesh"]
        for vertex in mesh.vertices:
            lines.append(f"v {vertex[0]} {vertex[1]} {vertex[2]}")
        for face in mesh.faces:
            lines.append(f"f {face[0]} {face[1]} {face[2]}")
        output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    def _write_manifest(self, manifest: Manifest, output_path: Path) -> None:
        output_path.write_text(
            json.dumps(manifest.to_dict(), indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )

    def _write_animation(self, mesh: MeshData, task_dir: Path) -> None:
        anim = mesh.animation_data
        (task_dir / "faces.obj").write_text(anim["faces_obj"], encoding="utf-8")
        (task_dir / "vertices.bin").write_bytes(anim["vertices_bin"])
        meta_path = task_dir / "animation_meta.json"
        meta_path.write_text(
            json.dumps(anim["animation_meta"], indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
