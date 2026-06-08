"""SMPLXParamInputAdapter — .npz/.pkl file → SMPLXParamInput.

Loads SMPL-X parameter files (from AMASS, SMPLify-X output, etc.)
and validates required fields. Ready to feed directly into layer 3 SMPL-X backend.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np

from smpl_service.modeling.domain.contracts import BodyInput
from smpl_service.modeling.domain.observations import SMPLXParamInput

SUPPORTED_EXTENSIONS = {".npz", ".pkl", ".pickle"}


class SMPLXParamInputAdapter:
    def load(self, input_path: Path) -> BodyInput:
        if not input_path.exists():
            raise FileNotFoundError(f"param file not found: {input_path}")
        if input_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            raise ValueError(
                f"unsupported param format: {input_path.suffix}. "
                f"supported: {SUPPORTED_EXTENSIONS}"
            )

        betas = [0.0] * 16
        body_pose = None
        global_orient = None
        transl = None
        gender = "neutral"
        left_hand_pose = None
        right_hand_pose = None
        expression = None
        jaw_pose = None

        try:
            data = np.load(str(input_path), allow_pickle=True)
            if "betas" in data:
                betas = data["betas"].tolist()[:16]
            if "poses" in data:
                poses_arr = data["poses"]
                if poses_arr.ndim == 2:
                    global_orient = poses_arr[0, :3].tolist()
                    body_pose = poses_arr[0, 3:].tolist()
                else:
                    global_orient = poses_arr[:3].tolist()
                    body_pose = poses_arr[3:].tolist()
            if "trans" in data:
                t = data["trans"]
                transl = t[0, :3].tolist() if t.ndim == 2 else t[:3].tolist()
            if "gender" in data:
                gender = str(data["gender"]).lower()
        except (ValueError, OSError):
            # Not a valid npz — leave as defaults
            pass

        # Normalize gender value
        if gender not in {"male", "female", "neutral"}:
            gender = "neutral"

        observation = SMPLXParamInput(
            source_type="smplx-param",
            param_path=str(input_path),
            gender=gender,
            betas=betas,
            body_pose=body_pose,
            global_orient=global_orient,
            transl=transl,
            left_hand_pose=left_hand_pose,
            right_hand_pose=right_hand_pose,
            expression=expression,
            jaw_pose=jaw_pose,
        )

        return BodyInput(
            source_type="smplx-param",
            subject_id=input_path.stem,
            input_files=[str(input_path)],
            metadata={"observation": observation.to_dict()},
        )
