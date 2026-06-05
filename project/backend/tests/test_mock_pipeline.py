import json
from pathlib import Path

from smpl_service.modeling.app.pipeline import run_modeling_task


def test_mock_pipeline_writes_obj_and_manifest(tmp_path):
    input_path = Path("../../data/samples/mock/sample_001.json").resolve()

    manifest_path = run_modeling_task(
        source_type="mock",
        input_path=input_path,
        model_type="mock",
        output_dir=tmp_path,
    )

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    mesh_path = Path(manifest["result"]["output_paths"]["mesh"])

    assert manifest["result"]["status"] == "success"
    assert mesh_path.exists()
    assert mesh_path.read_text(encoding="utf-8").startswith("# mock body mesh")
