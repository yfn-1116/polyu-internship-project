"""Unified observation types for multi-modal input processing.

These dataclasses represent the standardized intermediate representation
between input adapters (layer 1) and the fitting layer (layer 2).

They intentionally do NOT contain mesh data, 3D joints, or SMPL-X params —
those belong to layer 2 (fitting) and layer 3 (SMPL-X backend).
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass
class BodyObservation:
    """Single-frame human body observation.

    This is the L1 output for image / video-frame / measurement inputs.
    Fields that require CV/ML inference (bbox, keypoints_2d) are optional
    and populated by the perception step (currently stub).
    """

    source_type: str  # "image" | "video_frame" | "measurement"
    image_path: str | None = None
    video_path: str | None = None
    frame_index: int | None = None
    image_size: tuple[int, int] | None = None  # (width, height)
    bbox: list[float] | None = None  # [x, y, w, h]
    keypoints_2d: list[list[float]] | None = None  # [[x, y, conf], ...]
    measurements: dict[str, float] | None = None  # {height_cm, weight_kg, ...}
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        d = asdict(self)
        d["image_size"] = list(self.image_size) if self.image_size else None
        return d


@dataclass
class BodySequenceObservation:
    """Multi-frame observation for video input.

    Contains per-frame BodyObservation objects plus video-level metadata.
    Temporal smoothing and tracking operate on this structure.
    """

    source_type: str  # "video"
    video_path: str
    fps: float
    frame_count: int
    duration_seconds: float
    frame_observations: list[BodyObservation] = field(default_factory=list)
    tracking_id: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        d = asdict(self)
        d["frame_observations"] = [f.to_dict() for f in self.frame_observations]
        return d


@dataclass
class ScanObservation:
    """3D scan observation. Supports OBJ / PLY / point-cloud formats."""

    scan_path: str
    texture_path: str | None = None
    format: str = "obj"  # "obj" | "ply" | "pointcloud"
    vertex_count: int | None = None
    face_count: int | None = None
    coordinate_system: str = "y-up"  # "y-up" | "z-up"
    scale: float = 1.0
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class SMPLXParamInput:
    """Pre-computed SMPL-X parameters, ready for layer 3 backend.

    When source data already contains SMPL-X params (from AMASS, SMPLify-X
    output, or manual authoring), this type provides a direct passthrough.
    """

    source_type: str  # "smplx-param"
    param_path: str
    gender: str = "neutral"  # "male" | "female" | "neutral"
    betas: list[float] = field(default_factory=lambda: [0.0] * 10)
    body_pose: list[float] | None = None  # 63 dims (21 body joints x 3)
    global_orient: list[float] | None = None  # 3 dims
    transl: list[float] | None = None  # 3 dims
    left_hand_pose: list[float] | None = None  # 45 dims
    right_hand_pose: list[float] | None = None  # 45 dims
    expression: list[float] | None = None  # 10 dims
    jaw_pose: list[float] | None = None  # 3 dims
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
