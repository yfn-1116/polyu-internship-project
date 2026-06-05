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

成功标志：

- 命令退出码为 0。
- 输出 `outputs/<task_id>/manifest.json`。

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
