from smpl_service.modeling.domain.contracts import BodyInput, Manifest, ModelResult


def test_body_input_to_dict():
    body_input = BodyInput(
        source_type="mock",
        subject_id="sample_001",
        input_files=["data/samples/mock/sample_001.json"],
        metadata={"height_cm": 170},
    )

    assert body_input.to_dict() == {
        "source_type": "mock",
        "subject_id": "sample_001",
        "input_files": ["data/samples/mock/sample_001.json"],
        "metadata": {"height_cm": 170},
    }


def test_manifest_to_dict_contains_result():
    result = ModelResult(
        task_id="job_sample_001",
        model_type="mock",
        status="success",
        output_paths={"mesh": "outputs/job_sample_001/body.obj"},
        errors=[],
    )
    manifest = Manifest(task_id="job_sample_001", body_input_source="mock", result=result)

    assert manifest.to_dict()["result"]["output_paths"]["mesh"].endswith("body.obj")
