from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class EnvironmentReport:
    python_dependencies: dict[str, str]
    model_dirs: dict[str, str]

    def to_dict(self) -> dict[str, dict[str, str]]:
        return asdict(self)
