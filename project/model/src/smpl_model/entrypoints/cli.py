from __future__ import annotations

import argparse
import json
from pathlib import Path

from smpl_model.app.environment_check import check_environment
from smpl_model.app.mocap_export import SUPPORTED_FRAME_MODES, export_mocap_smplx
from smpl_model.app.smplx_export import SHAPE_PRESETS, export_default_smplx


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="SMPL model module")
    subparsers = parser.add_subparsers(dest="command", required=True)

    check_parser = subparsers.add_parser("check-env", help="check SMPL model environment")
    check_parser.add_argument(
        "--project-root",
        default=".",
        help="repository root that contains the models directory",
    )

    export_parser = subparsers.add_parser(
        "export-default-smplx",
        help="export a default SMPL-X body mesh",
    )
    export_parser.add_argument(
        "--project-root",
        default=".",
        help="repository root that contains the models directory",
    )
    export_parser.add_argument(
        "--output-dir",
        required=True,
        help="directory where body.obj and manifest.json will be written",
    )
    export_parser.add_argument(
        "--gender",
        choices=("neutral", "male", "female"),
        default="neutral",
        help="SMPL-X model gender",
    )
    export_parser.add_argument(
        "--shape-preset",
        choices=tuple(SHAPE_PRESETS),
        default="default",
        help="simple SMPL-X beta preset for demo generation",
    )

    mocap_parser = subparsers.add_parser(
        "export-mocap-smplx",
        help="export MoCap-driven SMPL-X animation mesh sequence",
    )
    mocap_parser.add_argument(
        "--project-root",
        default=".",
        help="repository root that contains the models directory",
    )
    mocap_input_group = mocap_parser.add_mutually_exclusive_group(required=True)
    mocap_input_group.add_argument(
        "--input-path",
        help="path to a single AMASS NPZ file (e.g. Elena_Happy_v1_C3D_poses.npz)",
    )
    mocap_input_group.add_argument(
        "--input-dir",
        help="path to directory containing AMASS NPZ files for batch export",
    )
    mocap_parser.add_argument(
        "--output-dir",
        required=True,
        help="directory where animation output will be written",
    )
    mocap_parser.add_argument(
        "--frame-mode",
        choices=tuple(SUPPORTED_FRAME_MODES),
        default="all",
        help="frame selection strategy: all frames, keyframes (5), or specific frames",
    )
    mocap_parser.add_argument(
        "--target-fps",
        type=float,
        default=None,
        help="downsample to target fps (only used with frame-mode=all)",
    )
    mocap_parser.add_argument(
        "--frames",
        type=int,
        nargs="+",
        default=None,
        help="specific frame indices to export (only used with frame-mode=frames)",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.command == "check-env":
        report = check_environment(project_root=Path(args.project_root).resolve())
        print(json.dumps(report.to_dict(), indent=2, ensure_ascii=False))
        return 0

    if args.command == "export-default-smplx":
        result = export_default_smplx(
            project_root=Path(args.project_root).resolve(),
            output_dir=Path(args.output_dir).resolve(),
            gender=args.gender,
            shape_preset=args.shape_preset,
        )
        print(json.dumps(result.to_dict(), indent=2, ensure_ascii=False))
        return 0

    if args.command == "export-mocap-smplx":
        input_path = Path(args.input_path).resolve() if args.input_path else None
        input_dir = Path(args.input_dir).resolve() if args.input_dir else None
        results = export_mocap_smplx(
            project_root=Path(args.project_root).resolve(),
            input_path=input_path,
            input_dir=input_dir,
            output_dir=Path(args.output_dir).resolve(),
            frame_mode=args.frame_mode,
            target_fps=args.target_fps,
            frames=args.frames,
        )
        for result in results:
            print(json.dumps(result.to_dict(), indent=2, ensure_ascii=False))
        return 0

    return 0
