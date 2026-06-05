from pathlib import Path

from smpl_service.modeling.entrypoints.cli import main


def test_cli_run_creates_manifest(tmp_path):
    input_path = Path("../../data/samples/mock/sample_001.json").resolve()

    exit_code = main(
        [
            "run",
            "--source-type",
            "mock",
            "--input-path",
            str(input_path),
            "--model-type",
            "mock",
            "--output-dir",
            str(tmp_path),
        ]
    )

    assert exit_code == 0
    assert (tmp_path / "job_sample_001" / "manifest.json").exists()
