# LLD M3：CLI 与 API 入口

## 0) 模块职责与边界

CLI/API 是外部调用入口，负责接收任务参数、触发 pipeline、返回 manifest 位置。它不直接实现模型逻辑。

## 1) CLI 契约

第一周优先 CLI：

```bash
python -m smpl_service run \
  --source-type mock \
  --input-path data/samples/mock/sample_001.json \
  --model-type mock \
  --output-dir outputs
```

MoCap 动画驱动：

```bash
# 模型模块直接导出
cd project/model
PYTHONPATH=src python -m smpl_model export-mocap-smplx \
  --project-root /home/yfn/polyu-internship-project \
  --input-path <path>/Elena_Happy_v1_C3D_poses.npz \
  --output-dir outputs/mocap_happy_v1 \
  --frame-mode all --target-fps 30

# 后端 pipeline 集成
cd project/backend
PYTHONPATH=src python -m smpl_service run \
  --source-type mocap-npz \
  --input-path <path>/Elena_Happy_v1_C3D_poses.npz \
  --model-type smplx \
  --output-dir outputs
```

成功标志：

- 命令退出码为 0。
- 输出 `outputs/<task_id>/manifest.json`。
- MoCap 模式额外输出 `vertices.bin`、`faces.obj`、`animation_meta.json`。

## 2) HTTP API 候选契约

```http
POST /v1/modeling/jobs
```

请求：

```json
{
  "source_type": "mock",
  "input_path": "data/samples/mock/sample_001.json",
  "model_type": "mock"
}
```

响应：

```json
{
  "task_id": "job_001",
  "status": "success",
  "manifest_path": "outputs/job_001/manifest.json"
}
```

## 3) Failure Modes

- 参数缺失。
- 输入路径无效。
- backend 执行失败。
- manifest 写入失败。

## 4) 测试策略与 DoD

- CLI 有 smoke 测试。
- API 如实现，必须有 health endpoint 和最小请求测试。
- Runbook 必须写明调用命令和成功标志。

## References

- Tracker：`documents/99-project-planning.md`
- Runbook：`documents/98-runbook/README.md`
