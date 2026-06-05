# Model entrypoints 目录说明

本目录放模型模块外部入口。

## 当前文件

| 文件 | 作用 |
| --- | --- |
| `cli.py` | `check-env` 和 `export-default-smplx` 命令 |

## 规则

- CLI 只解析参数并调用 app 层。
- 不直接写模型逻辑。
- 新命令必须同步 Runbook。
