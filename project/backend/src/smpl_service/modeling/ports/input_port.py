from __future__ import annotations

from pathlib import Path
from typing import Protocol

from smpl_service.modeling.domain.contracts import BodyInput


class InputAdapter(Protocol):
    def load(self, input_path: Path) -> BodyInput:
        """Load a source-specific input and convert it into BodyInput."""
