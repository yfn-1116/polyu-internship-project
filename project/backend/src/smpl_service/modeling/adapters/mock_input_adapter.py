from __future__ import annotations

import json
from pathlib import Path

from smpl_service.modeling.domain.contracts import BodyInput


class MockInputAdapter:
    def load(self, input_path: Path) -> BodyInput:
        if not input_path.exists():
            raise FileNotFoundError(f"mock input file not found: {input_path}")

        payload = json.loads(input_path.read_text(encoding="utf-8"))
        subject_id = str(payload["subject_id"])
        return BodyInput(
            source_type="mock",
            subject_id=subject_id,
            input_files=[str(input_path)],
            metadata={key: value for key, value in payload.items() if key != "subject_id"},
        )
