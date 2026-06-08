"""ImageInputAdapter — single image → BodyObservation.

Current: file validation + mock observation (no YOLO inference).
Future: YOLO-Pose → keypoints_2d, bbox populated into BodyObservation.
"""

from __future__ import annotations

from pathlib import Path

from smpl_service.modeling.domain.contracts import BodyInput
from smpl_service.modeling.domain.observations import BodyObservation

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff"}


class ImageInputAdapter:
    def load(self, input_path: Path) -> BodyInput:
        if not input_path.exists():
            raise FileNotFoundError(f"image not found: {input_path}")
        if input_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            raise ValueError(
                f"unsupported image format: {input_path.suffix}. "
                f"supported: {SUPPORTED_EXTENSIONS}"
            )

        # TODO: when opencv is available, read actual image size
        image_size = None
        try:
            import cv2
            img = cv2.imread(str(input_path))
            if img is not None:
                h, w = img.shape[:2]
                image_size = (w, h)
        except ImportError:
            pass

        observation = BodyObservation(
            source_type="image",
            image_path=str(input_path),
            image_size=image_size,
            bbox=None,         # TODO: YOLO detection
            keypoints_2d=None,  # TODO: YOLO-Pose
        )

        return BodyInput(
            source_type="image",
            subject_id=input_path.stem,
            input_files=[str(input_path)],
            metadata={"observation": observation.to_dict()},
        )
