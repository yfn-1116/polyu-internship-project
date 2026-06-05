from smpl_service.modeling.entrypoints.cli import build_parser


def test_cli_has_run_command():
    parser = build_parser()
    help_text = parser.format_help()
    assert "run" in help_text
    assert "SMPL body modeling service" in help_text
