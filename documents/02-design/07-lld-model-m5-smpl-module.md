# LLD M5：SMPL/SMPL-X 模型模块

## 0) 模块职责与边界

`project/model` 是独立模型能力模块，负责检查和承载 SMPL/SMPL-X 相关依赖、模型文件和后续 mesh 生成逻辑。

当前阶段已完成环境检查、目录规范、SMPL-X 模型文件放置和默认人体 mesh 导出。

## 1) 当前目录

```text
project/model/
├── README.md
├── pyproject.toml
├── src/smpl_model/
│   ├── domain/
│   ├── app/
│   └── entrypoints/
├── tests/
└── examples/
```

## 2) 模型文件位置

真实模型文件放在仓库根目录：

```text
models/
├── smpl/
└── smplx/
```

`models/` 不提交 Git。

## 3) 当前接口

```bash
PYTHONPATH=src python -m smpl_model check-env --project-root /home/yfn/polyu-internship-project
```

```bash
PYTHONPATH=src python -m smpl_model export-default-smplx \
  --project-root /home/yfn/polyu-internship-project \
  --output-dir /home/yfn/polyu-internship-project/outputs/smplx_default_neutral \
  --gender neutral
```

```bash
PYTHONPATH=src python -m smpl_model export-default-smplx \
  --project-root /home/yfn/polyu-internship-project \
  --output-dir /home/yfn/polyu-internship-project/outputs/smplx_preset_broad \
  --gender neutral \
  --shape-preset broad
```

检查项：

- `torch`
- `smplx`
- `trimesh`
- `models/smpl`
- `models/smplx`

## 4) 当前环境检查结果

2026-06-05：

```json
{
  "python_dependencies": {
    "torch": "present",
    "smplx": "present",
    "trimesh": "present"
  },
  "model_dirs": {
    "smpl": "present",
    "smplx": "present"
  }
}
```

SMPL-X 文件已放置在 `models/smplx/`，包括 female/male/neutral 的 `.npz` 与 `.pkl` 文件。

SMPL v1.1.0 文件已放置在 `models/smpl/SMPL_python_v.1.1.0/`，包括 female/male/neutral 三个 `.pkl` 权重和官方 Python 示例代码。

模型权重只参与本地运行，不进入 Git。

默认 neutral SMPL-X 导出结果：

```json
{
  "model_type": "smplx",
  "gender": "neutral",
  "vertices_count": 10475,
  "faces_count": 20908
}
```

当前 shape preset：

- `default`
- `slim`
- `broad`
- `tall`
- `short`

这些 preset 用于演示 SMPL-X shape 参数变化，不代表对某个 raw scan 的真实 fitting。

## 5) MoCap 动画导出

### 5.1 模块职责

`export_mocap_smplx()` 从 AMASS NPZ 文件读取 MoCap 参数，驱动 SMPL-X 模型生成动画 mesh 序列。它不编排后端任务，不关心 pipeline 状态。

### 5.2 SMPL+H → SMPL-X 关节映射

AMASS 数据为 SMPL+H 格式（52 关节），需映射到 SMPL-X（55 关节）：

```text
输入 poses: (N, 156) = 52 joints × 3

global_orient = poses[:, :3]           # root (1 joint)
body_pose 前段 = poses[:, 3:66]        # body joints 1-21 (21 joints)
填零          = zeros(N, 9)            # jaw(1) + eyes(2) (3 joints)
body_pose 后段 = poses[:, 66:156]      # hands 15+15 (30 joints)
```

betas (16 维) 直接使用。dmpls 在 SMPL-X 中不适用，跳过。gender 从数据文件读取（当前为 female）。

### 5.3 帧选择策略

| 模式 | 参数 | 行为 |
| --- | --- | --- |
| `all` | `--frame-mode all` | 导出全部帧，支持 `--target-fps` 降采样 |
| `keyframes` | `--frame-mode keyframes` | 导出首帧、25%、50%、75%、末帧（共 5 帧） |
| `frames` | `--frames 0,100,500` | 导出指定帧号列表 |

### 5.4 输出格式

```text
outputs/mocap_<emotion>_<version>/
├── faces.obj              # 面片定义（所有帧共享，不变）
├── vertices.bin           # float32 二进制，每帧 10475×3×4 bytes
├── animation_meta.json    # {fps, frame_count, emotion, duration, betas, ...}
└── manifest.json          # AnimationExportResult 序列化
```

关键帧模式（`keyframes`）额外导出逐帧 `.obj`：

```text
outputs/mocap_<emotion>_<version>/
├── frame_0000.obj
├── frame_1291.obj
├── ...
├── animation_meta.json
└── manifest.json
```

### 5.5 CLI 命令

```bash
# 单文件关键帧导出
PYTHONPATH=src python -m smpl_model export-mocap-smplx \
  --project-root /home/yfn/polyu-internship-project \
  --input-path <path>/Elena_Happy_v1_C3D_poses.npz \
  --output-dir outputs/mocap_happy_v1 \
  --frame-mode keyframes

# 单文件全帧导出（降采样到 30fps）
PYTHONPATH=src python -m smpl_model export-mocap-smplx \
  --project-root /home/yfn/polyu-internship-project \
  --input-path <path>/Elena_Happy_v1_C3D_poses.npz \
  --output-dir outputs/mocap_happy_v1 \
  --frame-mode all --target-fps 30

# 批量目录导出
PYTHONPATH=src python -m smpl_model export-mocap-smplx \
  --project-root /home/yfn/polyu-internship-project \
  --input-dir <path>/20151003_ElenaKyriakou/ \
  --output-dir outputs/mocap_all \
  --frame-mode all --target-fps 30
```

### 5.6 AnimationExportResult

```text
AnimationExportResult
- model_type: "smplx"
- gender: str
- emotion: str
- version: str
- frame_count: int
- fps: float
- duration_seconds: float
- vertices_count: 10475
- faces_count: 20908
- output_dir: Path
- manifest_path: Path
- animation_format: "bin" | "obj_sequence"
```

### 5.7 Failure Modes

- NPZ 文件不存在或格式不正确。
- SMPL+H 维度与预期不匹配（poses 不是 156 维）。
- SMPL-X 模型文件缺失。
- 帧号超出范围。
- 全帧模式下磁盘空间不足。

### 5.8 测试策略与 DoD

- 关节映射维度正确（52 → 55 mapping）。
- 输出 vertices_count = 10475，faces_count = 20908。
- keyframes 模式返回 5 帧。
- manifest 包含正确元数据（emotion, fps, frame_count）。
- `cd project/model && PYTHONPATH=src python -m pytest -v` 全部通过。

## 6) 后续实现路径

1. 将 `export_default_smplx` 接入 `project/backend` pipeline。
2. 将输出 `.obj` 复制或服务化给前端 Viewer。
3. 增加可配置 shape/pose 参数输入。
4. 后续如需兼容 SMPL，可基于 `models/smpl/SMPL_python_v.1.1.0/` 增加独立 `SMPLBackend`。

## References

- HLD：`documents/02-design/01-hld-smpl-service.md`
- Runbook：`documents/98-runbook/README.md`
- Knowledge Base：`documents/99-knowledge-base/01-smpl-paper-notes.md`
- AMASS 数据：`documents/99-knowledge-base/02-dataset-notes.md`
