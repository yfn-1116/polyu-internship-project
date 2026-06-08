# LLD M2：SMPL/SMPL-X 模型后端

## 0) 模块职责与边界

ModelBackend 负责把标准 `BodyInput` 转换为人体模型输出。它不关心原始输入来自 mock、数据集还是扫描仪。

## 1) Backend 类型

| Backend | 用途 | 第一周策略 |
| --- | --- | --- |
| MockBackend | 保证 pipeline 不被模型资源卡死 | 必须实现 |
| PassthroughModelBackend | 直接透传已有 OBJ 文件 | 已完成 |
| SMPLBackend | 输出 SMPL mesh/params | 资源可用则实现 |
| SMPLXBackend | 输出 SMPL-X mesh/params | 资源可用则实现 |
| SMPLXMoCapBackend | 用 MoCap 参数驱动 SMPL-X 生成动画序列 | MoCap 数据可用则实现 |

## 2) 接口

```text
run(body_input, options) -> ModelResult
```

## 3) 核心流程

1. 读取 BodyInput。
2. 选择 backend。
3. 加载模型资源或 mock 参数。
4. 生成 mesh/params/joints。
5. 返回 ModelResult。

### 3.1) SMPLXMoCapBackend 流程

1. 从 BodyInput.metadata 提取 poses (N, 156)、betas (16,)、trans (N, 3)、gender。
2. 执行 SMPL+H → SMPL-X 关节映射（poses 156 维 → body_pose 165 维）。
3. 调用 `project/model` 的 `export_mocap_smplx()` 核心逻辑。
4. SMPL-X forward pass 生成 vertices 序列。
5. 导出 faces.obj + vertices.bin + animation_meta.json。
6. 返回包含动画元数据的 ModelResult。

SMPLXMoCapBackend 支持帧选择：
- `frame_mode=all`：导出全部帧（或按 target_fps 降采样）。
- `frame_mode=keyframes`：导出代表性帧。
- `frame_mode=frames`：导出指定帧号。

## 4) Failure Modes

- 模型文件缺失。
- Python 包或 CUDA 环境不可用。
- 输入与 backend 预期不匹配。
- 输出 mesh 写入失败。

## 5) 测试策略与 DoD

- MockBackend 必须稳定通过测试。
- 真实 backend 至少提供可运行验证命令或明确阻塞原因。
- 模型资源路径不得写死在代码里。

## References

- SMPL notes：`documents/99-knowledge-base/01-smpl-paper-notes.md`
- Tech risk：`documents/04-challenges/01-technical-risks.md`
