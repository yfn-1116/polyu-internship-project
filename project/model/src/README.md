# Model src 目录说明

本目录是模型模块 Python 包源码根目录。`pyproject.toml` 通过这里发现 `smpl_model` 包。

## 内容

| 路径 | 作用 |
| --- | --- |
| `smpl_model/` | SMPL/SMPL-X 模型能力包 |

## 规则

- 新模型能力源码放在 `smpl_model/` 下。
- 测试放在 `project/model/tests/`。
- 不在 `src/` 下放模型权重或生成 OBJ。
