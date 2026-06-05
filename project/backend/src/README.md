# Backend src 目录说明

本目录是后端 Python 包源码根目录。`pyproject.toml` 通过这里发现 `smpl_service` 包。

## 内容

| 路径 | 作用 |
| --- | --- |
| `smpl_service/` | 后端服务包 |

## 规则

- 新后端源码必须放在 `smpl_service/` 下。
- 测试放在 `project/backend/tests/`。
- 不在 `src/` 下放数据集、模型权重或输出文件。
