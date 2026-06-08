from __future__ import annotations

import json
import struct
from pathlib import Path

import numpy as np
import smplx
import torch
import trimesh

from smpl_model.domain.mesh_export import AnimationExportResult

SUPPORTED_GENDERS = {"neutral", "male", "female"}
SUPPORTED_FRAME_MODES = {"all", "keyframes", "frames"}

# SMPL+H joint layout (52 joints = 156 dims):
#   root(1) | body(21) | left_hand(15) | right_hand(15)
# SMPL-X joint layout (55 joints):
#   body(21) | jaw(1) | eyes(2) | left_hand(15) | right_hand(15)
# SMPL+H → SMPL-X mapping:
#   global_orient = poses[:, :3]
#   body_pose = [poses[:, 3:66], zeros(N, 9), poses[:, 66:156]]

SMPLH_BODY_END = 66       # 22 joints × 3 (root + 21 body)
SMPLH_HANDS_START = 66    # left_hand starts here
FILL_DIMS = 9             # jaw(3) + eyes(6)


def convert_smplh_to_smplx(poses: np.ndarray) -> dict[str, np.ndarray]:
    """Convert SMPL+H poses (N, 156) to SMPL-X parameter dict.

    SMPL+H layout: root(1) + body(21) + left_hand(15) + right_hand(15) = 52 joints
    SMPL-X separate params:
      global_orient:  root (1 joint, 3 dims)
      body_pose:      body joints (21 joints, 63 dims)
      jaw_pose:       jaw (1 joint, 3 dims) — filled with zeros
      left_eye_pose:  left eye (1 joint, 3 dims) — filled with zeros
      right_eye_pose: right eye (1 joint, 3 dims) — filled with zeros
      left_hand_pose: left hand (15 joints, 45 dims)
      right_hand_pose: right hand (15 joints, 45 dims)
    """
    if poses.ndim != 2 or poses.shape[1] != 156:
        raise ValueError(f"expected poses shape (N, 156), got {poses.shape}")

    n_frames = poses.shape[0]
    return {
        "global_orient": poses[:, :3],
        "body_pose": poses[:, 3:66],
        "jaw_pose": np.zeros((n_frames, 3), dtype=poses.dtype),
        "left_eye_pose": np.zeros((n_frames, 3), dtype=poses.dtype),
        "right_eye_pose": np.zeros((n_frames, 3), dtype=poses.dtype),
        "left_hand_pose": poses[:, 66:111],
        "right_hand_pose": poses[:, 111:156],
    }


def select_frames(
    n_total: int,
    frame_mode: str,
    target_fps: float | None = None,
    source_fps: float = 120.0,
    frames: list[int] | None = None,
) -> np.ndarray:
    """Return an array of frame indices to export."""
    if frame_mode == "keyframes":
        indices = [0, n_total // 4, n_total // 2, 3 * n_total // 4, n_total - 1]
        return np.array(indices, dtype=np.int64)

    if frame_mode == "frames":
        if frames is None:
            raise ValueError("frame_mode='frames' requires a frames list")
        valid = [f for f in frames if 0 <= f < n_total]
        if not valid:
            raise ValueError(f"no valid frames in range [0, {n_total})")
        return np.array(sorted(valid), dtype=np.int64)

    if frame_mode == "all":
        if target_fps is not None and target_fps < source_fps:
            step = max(1, round(source_fps / target_fps))
            return np.arange(0, n_total, step, dtype=np.int64)
        return np.arange(n_total, dtype=np.int64)

    raise ValueError(f"unsupported frame_mode: {frame_mode}")


def _parse_emotion_from_filename(filename: str) -> tuple[str, str]:
    """Parse emotion and version from filename like 'Elena_Happy_v1_C3D_poses.npz'."""
    stem = Path(filename).stem
    parts = stem.replace("Elena_", "").replace("_C3D_poses", "").split("_")
    emotion = parts[0] if parts else "unknown"
    version = parts[1] if len(parts) > 1 else "v1"
    return emotion, version


def export_mocap_smplx(
    project_root: Path,
    input_path: Path | None,
    input_dir: Path | None,
    output_dir: Path,
    frame_mode: str = "all",
    target_fps: float | None = None,
    frames: list[int] | None = None,
) -> list[AnimationExportResult]:
    if frame_mode not in SUPPORTED_FRAME_MODES:
        raise ValueError(f"unsupported frame_mode: {frame_mode}, use one of {SUPPORTED_FRAME_MODES}")

    npz_files: list[Path] = []
    if input_path is not None:
        if not input_path.exists():
            raise FileNotFoundError(f"input NPZ not found: {input_path}")
        npz_files.append(input_path)
    elif input_dir is not None:
        if not input_dir.is_dir():
            raise FileNotFoundError(f"input directory not found: {input_dir}")
        npz_files = sorted(input_dir.glob("*_C3D_poses.npz"))
        if not npz_files:
            raise FileNotFoundError(f"no *_C3D_poses.npz files found in {input_dir}")
    else:
        raise ValueError("must provide either input_path or input_dir")

    model_dir = project_root / "models" / "smplx"
    if not model_dir.is_dir():
        raise FileNotFoundError(f"SMPL-X model directory not found: {model_dir}")

    results: list[AnimationExportResult] = []

    for npz_file in npz_files:
        result = _export_single(
            model_dir=model_dir,
            npz_file=npz_file,
            output_dir=output_dir,
            frame_mode=frame_mode,
            target_fps=target_fps,
            frames=frames,
        )
        results.append(result)

    return results


def _export_single(
    model_dir: Path,
    npz_file: Path,
    output_dir: Path,
    frame_mode: str,
    target_fps: float | None,
    frames: list[int] | None,
) -> AnimationExportResult:
    data = np.load(str(npz_file), allow_pickle=True)

    poses = data["poses"].astype(np.float32)
    betas = data["betas"].astype(np.float32)
    trans = data["trans"].astype(np.float32)
    gender = str(data["gender"])
    source_fps = float(data["mocap_framerate"])

    if gender not in SUPPORTED_GENDERS:
        gender = "neutral"

    emotion, version = _parse_emotion_from_filename(npz_file.name)

    n_total = poses.shape[0]
    frame_indices = select_frames(
        n_total=n_total,
        frame_mode=frame_mode,
        target_fps=target_fps,
        source_fps=source_fps,
        frames=frames,
    )
    n_export = len(frame_indices)

    smplx_params = convert_smplh_to_smplx(poses)

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
    betas_tensor = torch.tensor(betas[:10], dtype=torch.float32).unsqueeze(0)
    params = {k: torch.tensor(v[idx], dtype=torch.float32) for k, v in smplx_params.items()}
    transl_tensor = torch.tensor(trans[idx], dtype=torch.float32)

    task_dir_name = f"mocap_{emotion}_{version}"
    task_dir = output_dir / task_dir_name
    task_dir.mkdir(parents=True, exist_ok=True)

    with torch.no_grad():
        output = body_model(
            betas=betas_tensor.expand(n_export, -1),
            global_orient=params["global_orient"],
            body_pose=params["body_pose"],
            jaw_pose=params["jaw_pose"],
            left_eye_pose=params["left_eye_pose"],
            right_eye_pose=params["right_eye_pose"],
            left_hand_pose=params["left_hand_pose"],
            right_hand_pose=params["right_hand_pose"],
            transl=transl_tensor,
            return_verts=True,
        )

    vertices = output.vertices.detach().cpu().numpy()
    faces = body_model.faces

    if frame_mode == "keyframes":
        for i, frame_idx in enumerate(frame_indices):
            frame_mesh = trimesh.Trimesh(
                vertices=vertices[i],
                faces=faces,
                process=False,
            )
            frame_mesh.export(task_dir / f"frame_{frame_idx:04d}.obj")

    faces_obj_path = task_dir / "faces.obj"
    faces_lines = ["# SMPL-X faces"]
    for face in faces:
        faces_lines.append(f"f {face[0]+1} {face[1]+1} {face[2]+1}")
    faces_obj_path.write_text("\n".join(faces_lines) + "\n", encoding="utf-8")

    vertices_bin_path = task_dir / "vertices.bin"
    vertices_flat = vertices.astype(np.float32).tobytes()
    vertices_bin_path.write_bytes(vertices_flat)

    effective_fps = target_fps if target_fps is not None else source_fps
    duration_seconds = n_export / effective_fps

    animation_meta = {
        "emotion": emotion,
        "version": version,
        "gender": gender,
        "frame_count": n_export,
        "fps": effective_fps,
        "duration_seconds": round(duration_seconds, 2),
        "vertices_count": int(vertices.shape[1]),
        "faces_count": int(faces.shape[0]),
        "source_npz": str(npz_file.name),
        "frame_indices": frame_indices.tolist(),
        "betas": betas.tolist(),
    }
    meta_path = task_dir / "animation_meta.json"
    meta_path.write_text(json.dumps(animation_meta, indent=2, ensure_ascii=False), encoding="utf-8")

    animation_format = "obj_sequence" if frame_mode == "keyframes" else "bin"
    manifest_path = task_dir / "manifest.json"

    result = AnimationExportResult(
        model_type="smplx",
        gender=gender,
        emotion=emotion,
        version=version,
        frame_count=n_export,
        fps=effective_fps,
        duration_seconds=round(duration_seconds, 2),
        vertices_count=int(vertices.shape[1]),
        faces_count=int(faces.shape[0]),
        animation_format=animation_format,
        output_dir=task_dir,
        manifest_path=manifest_path,
    )
    manifest_path.write_text(
        json.dumps(result.to_dict(), indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    return result
