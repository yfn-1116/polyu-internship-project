from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass(frozen=True)
class BodyInput:
    source_type: str
    subject_id: str
    input_files: list[str]
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class ModelResult:
    task_id: str
    model_type: str
    status: str
    output_paths: dict[str, str] = field(default_factory=dict)
    errors: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class Manifest:
    task_id: str
    body_input_source: str
    result: ModelResult

    def to_dict(self) -> dict[str, Any]:
        return {
            "task_id": self.task_id,
            "body_input_source": self.body_input_source,
            "result": self.result.to_dict(),
        }
