from pathlib import Path

from smpl_model.app.environment_check import check_environment


def test_check_environment_reports_missing_model_dirs(tmp_path):
    report = check_environment(project_root=tmp_path)

    assert report.model_dirs["smpl"] == "missing"
    assert report.model_dirs["smplx"] == "missing"


def test_check_environment_reports_present_model_dirs(tmp_path):
    (tmp_path / "models" / "smpl").mkdir(parents=True)
    (tmp_path / "models" / "smplx").mkdir(parents=True)

    report = check_environment(project_root=tmp_path)

    assert report.model_dirs["smpl"] == "present"
    assert report.model_dirs["smplx"] == "present"


def test_environment_report_to_dict_has_dependency_keys(tmp_path):
    report = check_environment(project_root=tmp_path)
    payload = report.to_dict()

    assert set(payload["python_dependencies"]) == {"torch", "smplx", "trimesh"}
    assert set(payload["model_dirs"]) == {"smpl", "smplx"}
