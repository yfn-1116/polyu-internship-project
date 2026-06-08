from __future__ import annotations

import re
from pathlib import Path

import numpy as np

from smpl_service.modeling.domain.contracts import BodyInput


def _parse_subject_from_filename(filename: str) -> str:
    stem = Path(filename).stem
    cleaned = re.sub(r"_C3D_poses$", "", stem)
    return cleaned.replace(" ", "_")


def _parse_emotion_from_filename(filename: str) -> str:
    stem = Path(filename).stem
    cleaned = re.sub(r"^Elena_", "", stem)
    cleaned = re.sub(r"_C3D_poses$", "", cleaned)
    parts = cleaned.split("_")
    return parts[0] if parts else "unknown"


class MoCapNpzInputAdapter:
    def load(self, input_path: Path) -> BodyInput:
        if not input_path.exists():
            raise FileNotFoundError(f"MoCap NPZ not found: {input_path}")
        if input_path.suffix.lower() != ".npz":
            raise ValueError(f"MoCap input must be an NPZ file: {input_path}")

        data = np.load(str(input_path), allow_pickle=True)

        required_keys = {"poses", "betas", "trans", "gender", "mocap_framerate"}
        missing = required_keys - set(data.keys())
        if missing:
            raise ValueError(f"NPZ missing required keys: {missing}")

        poses = data["poses"].astype(np.float32)
        betas = data["betas"].astype(np.float32)
        trans = data["trans"].astype(np.float32)
        gender = str(data["gender"])
        fps = float(data["mocap_framerate"])

        if poses.ndim != 2 or poses.shape[1] != 156:
            raise ValueError(f"expected poses shape (N, 156), got {poses.shape}")

        subject_id = _parse_subject_from_filename(input_path.name)
        emotion = _parse_emotion_from_filename(input_path.name)

        return BodyInput(
            source_type="mocap-npz",
            subject_id=subject_id,
            input_files=[str(input_path)],
            metadata={
                "poses": poses.tolist(),
                "betas": betas.tolist(),
                "trans": trans.tolist(),
                "gender": gender,
                "fps": fps,
                "emotion": emotion,
                "frame_count": int(poses.shape[0]),
                "npz_path": str(input_path),
            },
        )
