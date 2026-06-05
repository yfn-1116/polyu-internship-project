from __future__ import annotations

import importlib.util
from pathlib import Path

from smpl_model.domain.environment import EnvironmentReport


DEPENDENCIES = ("torch", "smplx", "trimesh")
MODEL_DIRS = ("smpl", "smplx")


def check_environment(project_root: Path) -> EnvironmentReport:
    dependencies = {
        dependency: _dependency_status(dependency)
        for dependency in DEPENDENCIES
    }
    model_dirs = {
        model_name: _model_dir_status(project_root, model_name)
        for model_name in MODEL_DIRS
    }
    return EnvironmentReport(python_dependencies=dependencies, model_dirs=model_dirs)


def _dependency_status(module_name: str) -> str:
    return "present" if importlib.util.find_spec(module_name) is not None else "missing"


def _model_dir_status(project_root: Path, model_name: str) -> str:
    model_dir = project_root / "models" / model_name
    return "present" if model_dir.is_dir() else "missing"
