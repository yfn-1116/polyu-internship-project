"""VideoInputAdapter — video file → BodySequenceObservation.

Current: file validation + mock sequence observation (no frame extraction).
Future: OpenCV frame extraction + YOLO per-frame detection → full sequence.
"""

from __future__ import annotations

from pathlib import Path

from smpl_service.modeling.domain.contracts import BodyInput
from smpl_service.modeling.domain.observations import BodySequenceObservation

SUPPORTED_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}


class VideoInputAdapter:
    def load(self, input_path: Path) -> BodyInput:
        if not input_path.exists():
            raise FileNotFoundError(f"video not found: {input_path}")
        if input_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            raise ValueError(
                f"unsupported video format: {input_path.suffix}. "
                f"supported: {SUPPORTED_EXTENSIONS}"
            )

        # TODO: when opencv is available, extract frames and run YOLO
        fps = 30.0
        frame_count = 0
        duration = 0.0
        try:
            import cv2
            cap = cv2.VideoCapture(str(input_path))
            if cap.isOpened():
                fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
                frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
                duration = frame_count / fps if fps > 0 else 0.0
            cap.release()
        except ImportError:
            pass

        observation = BodySequenceObservation(
            source_type="video",
            video_path=str(input_path),
            fps=fps,
            frame_count=frame_count,
            duration_seconds=duration,
            frame_observations=[],  # TODO: populate with per-frame BodyObservation
        )

        return BodyInput(
            source_type="video",
            subject_id=input_path.stem,
            input_files=[str(input_path)],
            metadata={"observation": observation.to_dict()},
        )
