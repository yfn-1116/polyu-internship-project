# entrypoints 目录说明

本目录放后端外部入口。

## 当前文件

| 文件 | 作用 |
| --- | --- |
| `cli.py` | `smpl_service run` 命令参数解析 |

## 规则

- 入口只做参数解析、路径转换和调用 app 层。
- 不写业务逻辑。
- 后续 FastAPI 入口也放这里或同级 `api/`，但仍调用 app 层。
