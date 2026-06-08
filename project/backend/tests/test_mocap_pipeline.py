import json
from pathlib import Path

import numpy as np
import pytest

from smpl_service.modeling.adapters.mocap_npz_input_adapter import (
    MoCapNpzInputAdapter,
    _parse_emotion_from_filename,
    _parse_subject_from_filename,
)

AMASS_DIR = Path(__file__).resolve().parents[3] / "data" / "datasets" / "raw" / "amass" / "ElenaKyriakou"
PROJECT_ROOT = Path("/home/yfn/polyu-internship-project")
HAPPY_V1_NPZ = AMASS_DIR / "Elena_Happy_v1_C3D_poses.npz"


def test_parse_subject_from_filename():
    assert _parse_subject_from_filename("Elena_Happy_v1_C3D_poses.npz") == "Elena_Happy_v1"
    assert _parse_subject_from_filename("Elena_Sad_v2_C3D_poses.npz") == "Elena_Sad_v2"


def test_parse_emotion_from_filename():
    assert _parse_emotion_from_filename("Elena_Happy_v1_C3D_poses.npz") == "Happy"
    assert _parse_emotion_from_filename("Elena_Afraid_v2_C3D_poses.npz") == "Afraid"
    assert _parse_emotion_from_filename("Elena_Neutral_v2_C3D_poses.npz") == "Neutral"


@pytest.mark.skipif(not HAPPY_V1_NPZ.exists(), reason="AMASS data not available")
def test_mocap_input_adapter_loads():
    adapter = MoCapNpzInputAdapter()
    body_input = adapter.load(HAPPY_V1_NPZ)

    assert body_input.source_type == "mocap-npz"
    assert body_input.subject_id == "Elena_Happy_v1"
    assert len(body_input.input_files) == 1
    assert body_input.metadata["emotion"] == "Happy"
    assert body_input.metadata["gender"] == "female"
    assert body_input.metadata["fps"] == 120.0
    assert body_input.metadata["frame_count"] > 0
    assert len(body_input.metadata["poses"]) == body_input.metadata["frame_count"]
    assert len(body_input.metadata["poses"][0]) == 156


def test_mocap_input_adapter_rejects_missing_file():
    adapter = MoCapNpzInputAdapter()
    with pytest.raises(FileNotFoundError):
        adapter.load(Path("/nonexistent/file.npz"))


def test_mocap_input_adapter_rejects_non_npz(tmp_path):
    fake_file = tmp_path / "test.obj"
    fake_file.write_text("not npz")
    adapter = MoCapNpzInputAdapter()
    with pytest.raises(ValueError, match="NPZ file"):
        adapter.load(fake_file)


@pytest.mark.skipif(not HAPPY_V1_NPZ.exists(), reason="AMASS data not available")
def test_mocap_pipeline_end_to_end(tmp_path):
    from smpl_service.modeling.app.pipeline import run_modeling_task

    manifest_path = run_modeling_task(
        source_type="mocap-npz",
        input_path=HAPPY_V1_NPZ,
        model_type="smplx",
        output_dir=tmp_path,
    )

    assert manifest_path.exists()
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

    assert manifest["result"]["status"] == "success"
    assert manifest["result"]["model_type"] == "smplx"
    assert manifest["body_input_source"] == "mocap-npz"

    task_dir = manifest_path.parent
    assert (task_dir / "faces.obj").exists()
    assert (task_dir / "vertices.bin").exists()
    assert (task_dir / "animation_meta.json").exists()

    meta = json.loads((task_dir / "animation_meta.json").read_text(encoding="utf-8"))
    assert meta["emotion"] == "Happy"
    assert meta["vertices_count"] == 10475
    assert meta["faces_count"] == 20908
    assert meta["frame_count"] > 0

    bin_size = (task_dir / "vertices.bin").stat().st_size
    expected_size = meta["frame_count"] * meta["vertices_count"] * 3 * 4
    assert bin_size == expected_size


@pytest.mark.skipif(not HAPPY_V1_NPZ.exists(), reason="AMASS data not available")
def test_mocap_pipeline_rejects_wrong_model_type():
    from smpl_service.modeling.app.pipeline import run_modeling_task

    with pytest.raises(ValueError, match="mocap-npz source requires smplx"):
        run_modeling_task(
            source_type="mocap-npz",
            input_path=HAPPY_V1_NPZ,
            model_type="mock",
            output_dir=Path("/tmp/unused"),
        )
