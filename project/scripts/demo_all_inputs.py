#!/usr/bin/env python3
"""Multi-modal input demo — exercise all 5 adapters and print observations as JSON.

Usage:
  PYTHONPATH=project/backend/src python project/scripts/demo_all_inputs.py \
    --type image --path /path/to/image.jpg

  PYTHONPATH=project/backend/src python project/scripts/demo_all_inputs.py \
    --type smplx-param --path /path/to/smplx_params.npz

Supported types: image, video, scan, smplx-param, measurement
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="multi-modal input demo")
    parser.add_argument(
        "--type", dest="input_type", required=True,
        choices=["image", "video", "scan", "smplx-param", "measurement"],
        help="input type to test",
    )
    parser.add_argument("--path", required=True, help="path to input file")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    # Add backend src to path if not already present
    backend_src = str(Path(__file__).resolve().parents[1] / "backend" / "src")
    if backend_src not in sys.path:
        sys.path.insert(0, backend_src)

    input_path = Path(args.path)

    adapter_map = {
        "image": ("smpl_service.modeling.adapters.image_input_adapter", "ImageInputAdapter"),
        "video": ("smpl_service.modeling.adapters.video_input_adapter", "VideoInputAdapter"),
        "scan": ("smpl_service.modeling.adapters.scan_input_adapter", "ScanInputAdapter"),
        "smplx-param": ("smpl_service.modeling.adapters.smplx_param_input_adapter", "SMPLXParamInputAdapter"),
        "measurement": ("smpl_service.modeling.adapters.measurement_input_adapter", "MeasurementInputAdapter"),
    }

    module_name, class_name = adapter_map[args.input_type]
    mod = __import__(module_name, fromlist=[class_name])
    adapter_cls = getattr(mod, class_name)

    try:
        adapter = adapter_cls()
        body_input = adapter.load(input_path)
    except Exception as exc:
        result = {"status": "error", "error": str(exc), "input_type": args.input_type, "input_path": str(input_path)}
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return 1

    obs = body_input.metadata.get("observation", {})
    result = {
        "status": "success",
        "input_type": args.input_type,
        "subject_id": body_input.subject_id,
        "source_type": body_input.source_type,
        "observation": obs,
    }
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
