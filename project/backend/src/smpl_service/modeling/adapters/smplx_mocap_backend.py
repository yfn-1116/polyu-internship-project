from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import smplx
import torch
import trimesh

from smpl_service.modeling.domain.contracts import BodyInput
from smpl_service.modeling.ports.model_port import MeshData


def _convert_smplh_to_smplx_params(poses: list[list[float]]) -> dict[str, np.ndarray]:
    poses_arr = np.array(poses, dtype=np.float32)
    n = poses_arr.shape[0]
    return {
        "global_orient": poses_arr[:, :3],
        "body_pose": poses_arr[:, 3:66],
        "jaw_pose": np.zeros((n, 3), dtype=np.float32),
        "left_eye_pose": np.zeros((n, 3), dtype=np.float32),
        "right_eye_pose": np.zeros((n, 3), dtype=np.float32),
        "left_hand_pose": poses_arr[:, 66:111],
        "right_hand_pose": poses_arr[:, 111:156],
    }


def _select_frame_indices(
    n_total: int,
    frame_mode: str = "all",
    target_fps: float | None = None,
    source_fps: float = 120.0,
) -> np.ndarray:
    if frame_mode == "all":
        if target_fps is not None and target_fps < source_fps:
            step = max(1, round(source_fps / target_fps))
            return np.arange(0, n_total, step, dtype=np.int64)
        return np.arange(n_total, dtype=np.int64)
    if frame_mode == "keyframes":
        return np.array([0, n_total // 4, n_total // 2, 3 * n_total // 4, n_total - 1], dtype=np.int64)
    return np.arange(n_total, dtype=np.int64)


class SMPLXMoCapBackend:
    def __init__(self, project_root: Path, frame_mode: str = "all", target_fps: float | None = 30.0):
        self._project_root = project_root
        self._frame_mode = frame_mode
        self._target_fps = target_fps

    def run(self, body_input: BodyInput) -> MeshData:
        if body_input.source_type != "mocap-npz":
            raise ValueError(f"SMPLXMoCapBackend requires mocap-npz source, got {body_input.source_type}")

        poses = body_input.metadata["poses"]
        betas = body_input.metadata["betas"]
        trans = body_input.metadata["trans"]
        gender = body_input.metadata["gender"]
        source_fps = body_input.metadata["fps"]
        emotion = body_input.metadata.get("emotion", "unknown")

        smplx_params = _convert_smplh_to_smplx_params(poses)
        n_total = len(poses)
        frame_indices = _select_frame_indices(
            n_total=n_total,
            frame_mode=self._frame_mode,
            target_fps=self._target_fps,
            source_fps=source_fps,
        )
        n_export = len(frame_indices)

        model_dir = self._project_root / "models" / "smplx"
        model_file = model_dir / f"SMPLX_{gender.upper()}.npz"
        if not model_file.is_file():
            raise FileNotFoundError(f"SMPL-X model file not found: {model_file}")

        body_model = smplx.create(
            model_path=str(model_file),
            model_type="smplx",
            gender=gender,
            ext="npz",
            use_pca=False,
            batch_size=n_export,
        )
        body_model.eval()

        idx = frame_indices
        betas_t = torch.tensor(betas[:10], dtype=torch.float32).unsqueeze(0)
        params_t = {k: torch.tensor(v[idx], dtype=torch.float32) for k, v in smplx_params.items()}
        transl_t = torch.tensor(np.array(trans, dtype=np.float32)[idx])

        with torch.no_grad():
            output = body_model(
                betas=betas_t.expand(n_export, -1),
                global_orient=params_t["global_orient"],
                body_pose=params_t["body_pose"],
                jaw_pose=params_t["jaw_pose"],
                left_eye_pose=params_t["left_eye_pose"],
                right_eye_pose=params_t["right_eye_pose"],
                left_hand_pose=params_t["left_hand_pose"],
                right_hand_pose=params_t["right_hand_pose"],
                transl=transl_t,
                return_verts=True,
            )

        vertices_all = output.vertices.detach().cpu().numpy()
        faces = body_model.faces

        effective_fps = self._target_fps if self._target_fps is not None else source_fps
        duration_seconds = n_export / effective_fps

        animation_meta = {
            "emotion": emotion,
            "gender": gender,
            "frame_count": n_export,
            "fps": effective_fps,
            "duration_seconds": round(duration_seconds, 2),
            "vertices_count": int(vertices_all.shape[1]),
            "faces_count": int(faces.shape[0]),
            "frame_indices": idx.tolist(),
        }

        first_verts = vertices_all[0].tolist()
        face_tuples = [tuple(int(x) for x in f) for f in faces]

        mesh_vertices = [tuple(float(x) for x in v) for v in first_verts]

        return MeshData(
            vertices=mesh_vertices,
            faces=face_tuples,
            animation_data={
                "vertices_bin": vertices_all.astype(np.float32).tobytes(),
                "faces_obj": self._build_faces_obj(faces),
                "animation_meta": animation_meta,
            },
        )

    @staticmethod
    def _build_faces_obj(faces: np.ndarray) -> str:
        lines = ["# SMPL-X faces"]
        for face in faces:
            lines.append(f"f {face[0]+1} {face[1]+1} {face[2]+1}")
        return "\n".join(lines) + "\n"
