# Model app 目录说明

本目录放模型模块的应用逻辑。

## 当前文件

| 文件 | 作用 |
| --- | --- |
| `environment_check.py` | 检查 Python 依赖和本地模型目录 |
| `smplx_export.py` | 生成默认或 preset SMPL-X mesh |

## 规则

- 可以调用 `torch`、`smplx`、`trimesh`。
- 输出写到调用方指定目录。
- 新 shape/pose 能力优先扩展这里，并补测试。
