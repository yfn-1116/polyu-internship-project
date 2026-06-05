# Model Module 说明

本目录是 SMPL/SMPL-X 模型能力模块。它和 `project/backend`、`project/frontend` 并行存在，避免把重模型依赖和服务编排混在一起。

## 当前目标

当前阶段只做模型环境检查，不直接生成真实 SMPL 人体。

```text
check Python deps -> check local model dirs -> report missing/present
```

## 目录职责

```text
project/model/
├── pyproject.toml
├── src/smpl_model/
│   ├── domain/
│   ├── app/
│   └── entrypoints/
├── tests/
└── examples/
```

| 路径 | 作用 |
| --- | --- |
| `domain/` | 模型模块数据契约，例如环境检查报告 |
| `app/` | 应用逻辑，例如检查依赖和模型目录 |
| `entrypoints/` | CLI 入口，例如 `check-env` |
| `tests/` | 模型模块测试 |
| `examples/` | 后续放示例参数，不放模型权重 |

## 模型文件位置

真实模型文件放仓库根目录的 `models/` 下，不提交 Git：

```text
models/
├── smpl/
└── smplx/
```

## 运行环境检查

```bash
cd /home/yfn/polyu-internship-project/project/model
PYTHONPATH=src python -m smpl_model check-env --project-root /home/yfn/polyu-internship-project
```

输出会显示：

- `torch`
- `smplx`
- `trimesh`
- `models/smpl`
- `models/smplx`

## 后续扩展

- `SMPLBackend`：加载 SMPL 模型，输出 mesh。
- `SMPLXBackend`：加载 SMPL-X 模型，输出 mesh。
- `examples/`：保存 shape/pose 示例参数。
- 后端通过稳定接口调用模型模块，不直接处理模型权重细节。
