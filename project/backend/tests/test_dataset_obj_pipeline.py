from pathlib import Path

from smpl_service.modeling.adapters.dataset_obj_input_adapter import DatasetObjInputAdapter
from smpl_service.modeling.app.pipeline import run_modeling_task


PROJECT_ROOT = Path(__file__).resolve().parents[3]
THUMAN_SAMPLE = (
    PROJECT_ROOT
    / "data"
    / "datasets"
    / "raw"
    / "thuman2"
    / "THuman2.0-Dataset"
    / "data_sample"
    / "0525"
    / "0525.obj"
)


def test_dataset_obj_input_adapter_loads_thuman_sample():
    adapter = DatasetObjInputAdapter()

    body_input = adapter.load(THUMAN_SAMPLE)

    assert body_input.source_type == "dataset-obj"
    assert body_input.subject_id == "0525"
    assert body_input.input_files == [str(THUMAN_SAMPLE)]
    assert body_input.metadata["dataset"] == "thuman2-sample"
    assert body_input.metadata["mesh_path"] == str(THUMAN_SAMPLE)
    assert body_input.metadata["material_path"].endswith("material0.mtl")
    assert body_input.metadata["texture_path"].endswith("material0.jpeg")


def test_dataset_obj_pipeline_copies_mesh_to_output(tmp_path):
    manifest_path = run_modeling_task(
        source_type="dataset-obj",
        input_path=THUMAN_SAMPLE,
        model_type="passthrough",
        output_dir=tmp_path,
    )

    mesh_path = manifest_path.parent / "body.obj"
    manifest_text = manifest_path.read_text(encoding="utf-8")

    assert manifest_path.exists()
    assert mesh_path.exists()
    assert mesh_path.read_text(encoding="utf-8").startswith("#")
    assert '"body_input_source": "dataset-obj"' in manifest_text
    assert '"model_type": "passthrough"' in manifest_text
