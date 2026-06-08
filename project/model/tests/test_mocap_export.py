import numpy as np
import pytest

from smpl_model.app.mocap_export import (
    FILL_DIMS,
    SMPLH_BODY_END,
    SMPLH_HANDS_START,
    convert_smplh_to_smplx,
    select_frames,
)


def test_convert_smplh_to_smplx_shapes():
    poses = np.random.randn(10, 156).astype(np.float32)
    result = convert_smplh_to_smplx(poses)

    assert result["global_orient"].shape == (10, 3)
    assert result["body_pose"].shape == (10, 63)
    assert result["jaw_pose"].shape == (10, 3)
    assert result["left_eye_pose"].shape == (10, 3)
    assert result["right_eye_pose"].shape == (10, 3)
    assert result["left_hand_pose"].shape == (10, 45)
    assert result["right_hand_pose"].shape == (10, 45)


def test_convert_smplh_to_smplx_values():
    poses = np.random.randn(5, 156).astype(np.float32)
    result = convert_smplh_to_smplx(poses)

    np.testing.assert_array_equal(result["global_orient"], poses[:, :3])
    np.testing.assert_array_equal(result["body_pose"], poses[:, 3:66])
    np.testing.assert_array_equal(result["left_hand_pose"], poses[:, 66:111])
    np.testing.assert_array_equal(result["right_hand_pose"], poses[:, 111:156])
    np.testing.assert_array_equal(result["jaw_pose"], np.zeros((5, 3)))
    np.testing.assert_array_equal(result["left_eye_pose"], np.zeros((5, 3)))
    np.testing.assert_array_equal(result["right_eye_pose"], np.zeros((5, 3)))


def test_convert_smplh_to_smplx_rejects_wrong_shape():
    with pytest.raises(ValueError, match="expected poses shape"):
        convert_smplh_to_smplx(np.zeros((10, 150)))

    with pytest.raises(ValueError, match="expected poses shape"):
        convert_smplh_to_smplx(np.zeros(156))


def test_select_frames_keyframes():
    indices = select_frames(n_total=1000, frame_mode="keyframes")
    assert len(indices) == 5
    assert indices[0] == 0
    assert indices[-1] == 999


def test_select_frames_all_no_downsample():
    indices = select_frames(n_total=100, frame_mode="all")
    assert len(indices) == 100
    assert indices[0] == 0
    assert indices[-1] == 99


def test_select_frames_all_with_downsample():
    indices = select_frames(n_total=1200, frame_mode="all", target_fps=30.0, source_fps=120.0)
    assert len(indices) == 300
    assert indices[1] - indices[0] == 4


def test_select_frames_specific():
    indices = select_frames(n_total=100, frame_mode="frames", frames=[0, 50, 99])
    assert list(indices) == [0, 50, 99]


def test_select_frames_specific_clamps_out_of_range():
    indices = select_frames(n_total=100, frame_mode="frames", frames=[0, 50, 200])
    assert list(indices) == [0, 50]


def test_select_frames_specific_rejects_all_invalid():
    with pytest.raises(ValueError, match="no valid frames"):
        select_frames(n_total=100, frame_mode="frames", frames=[200, 300])


def test_select_frames_requires_frames_list():
    with pytest.raises(ValueError, match="requires a frames list"):
        select_frames(n_total=100, frame_mode="frames")


def test_select_frames_rejects_unknown_mode():
    with pytest.raises(ValueError, match="unsupported frame_mode"):
        select_frames(n_total=100, frame_mode="random")


def test_joint_layout_constants():
    assert SMPLH_BODY_END == 66
    assert SMPLH_HANDS_START == 66
    assert FILL_DIMS == 9
    assert SMPLH_BODY_END + 90 == 156


PROJECT_ROOT = "/home/yfn/polyu-internship-project"
AMASS_DIR = str(
    __import__("pathlib").Path(__file__).resolve().parents[3]
    / "data" / "datasets" / "raw" / "amass" / "ElenaKyriakou"
)


def test_export_mocap_keyframes(tmp_path):
    from smpl_model.app.mocap_export import export_mocap_smplx

    results = export_mocap_smplx(
        project_root=__import__("pathlib").Path(PROJECT_ROOT),
        input_path=__import__("pathlib").Path(AMASS_DIR) / "Elena_Happy_v1_C3D_poses.npz",
        input_dir=None,
        output_dir=tmp_path,
        frame_mode="keyframes",
    )

    assert len(results) == 1
    r = results[0]
    assert r.model_type == "smplx"
    assert r.gender == "female"
    assert r.emotion == "Happy"
    assert r.version == "v1"
    assert r.frame_count == 5
    assert r.vertices_count == 10475
    assert r.faces_count == 20908
    assert r.animation_format == "obj_sequence"
    assert r.manifest_path.exists()

    task_dir = r.output_dir
    assert (task_dir / "faces.obj").exists()
    assert (task_dir / "vertices.bin").exists()
    assert (task_dir / "animation_meta.json").exists()
    assert list(task_dir.glob("frame_*.obj"))


def test_export_mocap_all_downsampled(tmp_path):
    from smpl_model.app.mocap_export import export_mocap_smplx

    results = export_mocap_smplx(
        project_root=__import__("pathlib").Path(PROJECT_ROOT),
        input_path=__import__("pathlib").Path(AMASS_DIR) / "Elena_Happy_v1_C3D_poses.npz",
        input_dir=None,
        output_dir=tmp_path,
        frame_mode="all",
        target_fps=30.0,
    )

    assert len(results) == 1
    r = results[0]
    assert r.frame_count > 0
    assert r.fps == 30.0
    assert r.animation_format == "bin"

    bin_size = (r.output_dir / "vertices.bin").stat().st_size
    expected = r.frame_count * r.vertices_count * 3 * 4
    assert bin_size == expected
