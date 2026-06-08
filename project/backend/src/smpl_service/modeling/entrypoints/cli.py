from __future__ import annotations

import argparse
from pathlib import Path

from smpl_service.modeling.app.pipeline import run_modeling_task


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="SMPL body modeling service")
    subparsers = parser.add_subparsers(dest="command", required=True)

    run_parser = subparsers.add_parser("run", help="run a modeling task")
    run_parser.add_argument("--source-type", required=True, choices=["mock", "dataset-obj", "scanner", "mocap-npz"])
    run_parser.add_argument("--input-path", required=True)
    run_parser.add_argument("--model-type", required=True, choices=["mock", "passthrough", "smpl", "smplx"])
    run_parser.add_argument("--output-dir", default="outputs")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    if args.command == "run":
        manifest_path = run_modeling_task(
            source_type=args.source_type,
            input_path=Path(args.input_path),
            model_type=args.model_type,
            output_dir=Path(args.output_dir),
        )
        print(manifest_path)
        return 0
    return 0
