# LLD M5：SMPL/SMPL-X 模型模块

## 0) 模块职责与边界

`project/model` 是独立模型能力模块，负责检查和承载 SMPL/SMPL-X 相关依赖、模型文件和后续 mesh 生成逻辑。

当前阶段不生成真实人体，只完成环境检查和目录规范。

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
    "smplx": "missing",
    "trimesh": "missing"
  },
  "model_dirs": {
    "smpl": "missing",
    "smplx": "missing"
  }
}
```

## 5) 后续实现路径

1. 安装 `smplx` 和 `trimesh`。
2. 获取并放置 SMPL/SMPL-X 模型文件。
3. 新增 `SMPLXBackend`，用默认 pose/shape 生成 mesh。
4. 导出 `.obj`，交给前端 Viewer 和 Blender 验证。

## References

- HLD：`documents/02-design/01-hld-smpl-service.md`
- Runbook：`documents/98-runbook/README.md`
- Knowledge Base：`documents/99-knowledge-base/01-smpl-paper-notes.md`
