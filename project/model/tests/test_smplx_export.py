from pathlib import Path

from smpl_model.app.smplx_export import export_default_smplx


def test_export_default_smplx_writes_obj_and_manifest(tmp_path):
    result = export_default_smplx(
        project_root=Path("/home/yfn/polyu-internship-project"),
        output_dir=tmp_path,
        gender="neutral",
    )

    assert result.obj_path.exists()
    assert result.manifest_path.exists()
    assert result.vertices_count > 1000
    assert result.faces_count > 1000
    assert result.gender == "neutral"
    assert result.model_type == "smplx"
    assert result.obj_path.read_text(encoding="utf-8").startswith("#")


def test_export_default_smplx_records_shape_preset(tmp_path):
    result = export_default_smplx(
        project_root=Path("/home/yfn/polyu-internship-project"),
        output_dir=tmp_path,
        gender="neutral",
        shape_preset="broad",
    )

    manifest_text = result.manifest_path.read_text(encoding="utf-8")

    assert result.shape_preset == "broad"
    assert '"shape_preset": "broad"' in manifest_text
    assert result.vertices_count == 10475
    assert result.faces_count == 20908
