"""Pure functions for interactive SMPL-X mesh generation.

Layer 1 — no HTTP, no file I/O, no state.  Stateless computation only.
Called by Layer 2 (FastAPI) and directly by tests.
"""

from __future__ import annotations

import numpy as np
import smplx
import torch


def generate_mesh(
    betas: list[float],
    body_pose: list[float],
    gender: str = "neutral",
    global_orient: list[float] | None = None,
    transl: list[float] | None = None,
    project_root: str = "/home/yfn/polyu-internship-project",
) -> tuple[np.ndarray, np.ndarray]:
    """Generate SMPL-X mesh vertices and faces from shape and pose parameters.

    Args:
        betas: 10 shape coefficients
        body_pose: 63 joint rotation params (21 body joints × 3)
        gender: "male" | "female" | "neutral"
        global_orient: 3 root orientation params (default: zero)
        transl: 3 translation params (default: zero)
        project_root: repo root path

    Returns:
        (vertices: (10475, 3), faces: (20908, 3))
    """
    betas_arr = np.array(betas[:10], dtype=np.float32)
    body_pose_arr = np.array(body_pose[:63], dtype=np.float32)
    orient_arr = np.array(global_orient[:3], dtype=np.float32) if global_orient else np.zeros(3, dtype=np.float32)
    transl_arr = np.array(transl[:3], dtype=np.float32) if transl else np.zeros(3, dtype=np.float32)

    model_path = f"{project_root}/models/smplx/SMPLX_{gender.upper()}.npz"

    body_model = smplx.create(
        model_path=model_path,
        model_type="smplx",
        gender=gender.lower(),
        ext="npz",
        use_pca=False,
        batch_size=1,
    )
    body_model.eval()

    with torch.no_grad():
        output = body_model(
            betas=torch.tensor(betas_arr).unsqueeze(0),
            global_orient=torch.tensor(orient_arr).unsqueeze(0),
            body_pose=torch.tensor(body_pose_arr).unsqueeze(0),
            transl=torch.tensor(transl_arr).unsqueeze(0),
            return_verts=True,
        )

    vertices = output.vertices.detach().cpu().numpy()[0]
    faces = body_model.faces

    return vertices, faces


def semantic_to_betas(
    height: float = 0.0,
    weight: float = 0.0,
    shoulder: float = 0.0,
    waist: float = 0.0,
    hip: float = 0.0,
) -> list[float]:
    """Map 5 semantic sliders to 10-dim beta vector."""
    betas = [0.0] * 10
    betas[0] = height * 1.5     # PC1 ≈ height
    betas[1] = weight * 1.5     # PC2 ≈ weight/build
    betas[2] = shoulder * 1.0   # PC3 ≈ shoulder width
    betas[3] = waist * 0.8      # PC4 ≈ waist
    betas[4] = hip * 0.8        # PC5 ≈ hip
    return betas


def set_joint_rotation(
    body_pose: list[float],
    joint_index: int,
    axis: int,
    angle_rad: float,
) -> list[float]:
    """Set rotation for a specific joint axis in body_pose.

    Args:
        body_pose: current 63-dim pose array
        joint_index: 0-20 body joint index
        axis: 0=x, 1=y, 2=z rotation axis
        angle_rad: rotation angle in radians
    """
    pose = list(body_pose[:63])
    idx = joint_index * 3 + axis
    if idx < len(pose):
        pose[idx] = angle_rad
    return pose
