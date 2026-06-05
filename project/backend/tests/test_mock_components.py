from pathlib import Path

from smpl_service.modeling.adapters.mock_input_adapter import MockInputAdapter
from smpl_service.modeling.adapters.mock_model_backend import MockModelBackend


def test_mock_input_adapter_loads_body_input():
    adapter = MockInputAdapter()
    body_input = adapter.load(Path("../../data/samples/mock/sample_001.json").resolve())

    assert body_input.source_type == "mock"
    assert body_input.subject_id == "sample_001"
    assert body_input.metadata["height_cm"] == 170


def test_mock_backend_returns_vertices_and_faces():
    adapter = MockInputAdapter()
    body_input = adapter.load(Path("../../data/samples/mock/sample_001.json").resolve())
    backend = MockModelBackend()

    mesh = backend.run(body_input)

    assert len(mesh.vertices) == 8
    assert len(mesh.faces) == 12
