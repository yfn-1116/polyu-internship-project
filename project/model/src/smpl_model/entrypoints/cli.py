from __future__ import annotations

import argparse
import json
from pathlib import Path

from smpl_model.app.environment_check import check_environment


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="SMPL model module")
    subparsers = parser.add_subparsers(dest="command", required=True)

    check_parser = subparsers.add_parser("check-env", help="check SMPL model environment")
    check_parser.add_argument(
        "--project-root",
        default=".",
        help="repository root that contains the models directory",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.command == "check-env":
        report = check_environment(project_root=Path(args.project_root).resolve())
        print(json.dumps(report.to_dict(), indent=2, ensure_ascii=False))
        return 0

    return 0
