# Model Module 说明

本目录是 SMPL/SMPL-X 模型能力模块。它和 `project/backend`、`project/frontend` 并行存在，避免把重模型依赖和服务编排混在一起。

## 当前目标

当前阶段支持模型环境检查、默认 SMPL-X 人体 mesh 导出和 MoCap 动作捕捉驱动的 SMPL-X 动画 mesh 序列导出。

```text
check Python deps -> check local model dirs -> export default SMPL-X mesh -> export MoCap animation
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
| `domain/` | 模型模块数据契约，例如环境检查报告和 mesh 导出结果 |
| `app/` | 应用逻辑，例如检查依赖、检查模型目录、导出 SMPL-X mesh |
| `entrypoints/` | CLI 入口，例如 `check-env` 和 `export-default-smplx` |
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

## 导出默认 SMPL-X 人体

```bash
cd /home/yfn/polyu-internship-project/project/model
PYTHONPATH=src python -m smpl_model export-default-smplx \
  --project-root /home/yfn/polyu-internship-project \
  --output-dir /home/yfn/polyu-internship-project/outputs/smplx_default_neutral \
  --gender neutral
```

成功标志：

- 生成 `outputs/smplx_default_neutral/body.obj`
- 生成 `outputs/smplx_default_neutral/manifest.json`
- manifest 中 `vertices_count=10475`，`faces_count=20908`

## 导出 MoCap 动画序列

从 AMASS SMPL+H 动作捕捉数据驱动 SMPL-X 生成动画 mesh 序列：

```bash
cd /home/yfn/polyu-internship-project/project/model
PYTHONPATH=src python -m smpl_model export-mocap-smplx \
  --project-root /home/yfn/polyu-internship-project \
  --input-path <path>/Elena_Happy_v1_C3D_poses.npz \
  --output-dir outputs/mocap_happy_v1 \
  --frame-mode keyframes
```

成功标志：

- 生成 `outputs/mocap_happy_v1/mocap_Happy_v1/frame_0000.obj` 等 5 个关键帧
- 生成 `vertices.bin`、`faces.obj`、`animation_meta.json`、`manifest.json`
- manifest 中 `vertices_count=10475`，`faces_count=20908`

支持 `--frame-mode all --target-fps 30` 导出全帧降采样序列。支持 `--input-dir` 批量导出整个目录。

SMPL+H (52 关节) → SMPL-X (55 关节) 映射：body 和 hands 参数直接映射，jaw 和 eyes 填零。详见 `documents/99-knowledge-base/02-dataset-notes.md`。
