"""MeasurementInputAdapter — body measurements → BodyObservation.

Converts structured anthropometric data (height, weight, shoulder width, etc.)
into a BodyObservation with measurements field populated.

Input: a JSON file or Python dict containing measurement key-value pairs.
"""

from __future__ import annotations

import json
from pathlib import Path

from smpl_service.modeling.domain.contracts import BodyInput
from smpl_service.modeling.domain.observations import BodyObservation

RECOGNIZED_KEYS = {
    "height_cm", "weight_kg",
    "shoulder_width_cm", "chest_cm", "waist_cm", "hip_cm",
    "arm_length_cm", "leg_length_cm", "inseam_cm",
    "neck_cm", "head_circumference_cm",
}


class MeasurementInputAdapter:
    def load(self, input_path: Path) -> BodyInput:
        if not input_path.exists():
            raise FileNotFoundError(f"measurement file not found: {input_path}")

        payload: dict[str, object] = {}
        if input_path.suffix.lower() == ".json":
            payload = json.loads(input_path.read_text(encoding="utf-8"))
        elif input_path.suffix.lower() in {".txt", ".csv"}:
            payload = self._parse_key_value(input_path.read_text(encoding="utf-8"))
        else:
            raise ValueError(
                f"unsupported measurement format: {input_path.suffix}. "
                f"supported: .json, .txt, .csv"
            )

        measurements: dict[str, float] = {}
        for key, value in payload.items():
            key_lower = key.lower().replace(" ", "_")
            if key_lower in RECOGNIZED_KEYS or "_cm" in key_lower or "_kg" in key_lower:
                try:
                    measurements[key_lower] = float(value)
                except (ValueError, TypeError):
                    pass

        observation = BodyObservation(
            source_type="measurement",
            measurements=measurements if measurements else None,
        )

        return BodyInput(
            source_type="measurement",
            subject_id=input_path.stem,
            input_files=[str(input_path)],
            metadata={"observation": observation.to_dict()},
        )

    @staticmethod
    def _parse_key_value(text: str) -> dict[str, object]:
        result: dict[str, object] = {}
        for line in text.strip().split("\n"):
            if ":" in line:
                key, val = line.split(":", 1)
                result[key.strip()] = val.strip()
            elif "=" in line:
                key, val = line.split("=", 1)
                result[key.strip()] = val.strip()
            elif "," in line:
                parts = line.split(",")
                if len(parts) >= 2:
                    result[parts[0].strip()] = parts[1].strip()
        return result
