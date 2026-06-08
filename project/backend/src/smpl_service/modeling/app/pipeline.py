from __future__ import annotations

from pathlib import Path

from smpl_service.modeling.adapters.dataset_obj_input_adapter import DatasetObjInputAdapter
from smpl_service.modeling.adapters.file_output_writer import FileOutputWriter
from smpl_service.modeling.adapters.mock_input_adapter import MockInputAdapter
from smpl_service.modeling.adapters.mock_model_backend import MockModelBackend
from smpl_service.modeling.adapters.mocap_npz_input_adapter import MoCapNpzInputAdapter
from smpl_service.modeling.adapters.passthrough_model_backend import PassthroughModelBackend
from smpl_service.modeling.adapters.smplx_mocap_backend import SMPLXMoCapBackend
from smpl_service.modeling.domain.contracts import Manifest, ModelResult


def run_modeling_task(
    source_type: str,
    input_path: Path,
    model_type: str,
    output_dir: Path,
) -> Path:
    if source_type not in {"mock", "dataset-obj", "mocap-npz"}:
        raise ValueError(f"unsupported source_type for MVP: {source_type}")
    if model_type not in {"mock", "passthrough", "smplx"}:
        raise ValueError(f"unsupported model_type for MVP: {model_type}")
    if source_type == "mock" and model_type != "mock":
        raise ValueError("mock source requires mock model")
    if source_type == "dataset-obj" and model_type != "passthrough":
        raise ValueError("dataset-obj source requires passthrough model")
    if source_type == "mocap-npz" and model_type != "smplx":
        raise ValueError("mocap-npz source requires smplx model")

    if source_type == "mocap-npz":
        input_adapter = MoCapNpzInputAdapter()
    elif source_type == "dataset-obj":
        input_adapter = DatasetObjInputAdapter()
    else:
        input_adapter = MockInputAdapter()

    body_input = input_adapter.load(input_path)
    task_id = f"job_{body_input.subject_id}"
    task_dir = output_dir / task_id
    mesh_path = task_dir / "body.obj"
    manifest_path = task_dir / "manifest.json"

    if model_type == "smplx":
        project_root = Path("/home/yfn/polyu-internship-project")
        backend = SMPLXMoCapBackend(project_root=project_root)
    elif model_type == "passthrough":
        backend = PassthroughModelBackend()
    else:
        backend = MockModelBackend()

    mesh = backend.run(body_input)

    animation_meta = None
    if mesh.animation_data is not None:
        animation_meta = mesh.animation_data.get("animation_meta")
        mesh_path = task_dir / "faces.obj"

    result = ModelResult(
        task_id=task_id,
        model_type=model_type,
        status="success",
        output_paths={"mesh": str(mesh_path), "manifest": str(manifest_path)},
        errors=[],
        animation=animation_meta,
    )
    manifest = Manifest(task_id=task_id, body_input_source=body_input.source_type, result=result)

    output_writer = FileOutputWriter()
    return output_writer.write(mesh=mesh, manifest=manifest, task_dir=task_dir)
