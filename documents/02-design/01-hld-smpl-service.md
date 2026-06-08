# HLD：SMPL 人体建模服务

> 规范性约束来源：`documents/01-requirements/01-prd.md`
> 实现任务来源：`documents/99-project-planning.md`
> 细节落地：本目录下 LLD 文档

## 0) 目标与范围

### 0.1 系统目标

1. 提供独立人体建模服务，把样本输入转换为 SMPL/SMPL-X 相关输出。
2. 支持 mock、公开数据集、未来医院扫描仪三类输入路径。
3. 支持可替换模型 backend：mock backend、SMPL、SMPL-X。
4. 将真实 SMPL/SMPL-X 能力独立为 `project/model` 模块，避免重模型依赖污染后端服务框架。
5. 输出稳定 manifest，供后续主业务系统读取。
6. 提供最小 3D Viewer，让第一周成果可以被直观看到。
7. 保证运行方式、风险和决策路径可交接。

### 0.2 非目标

- 不从零训练 SMPL。
- 不做完整医疗业务系统。
- 不把模型权重、公开数据集、真实患者数据提交到 Git。

## 1) 总体架构

```text
CLI / HTTP API
  -> Task Orchestrator
  -> InputAdapter
       - MockInputAdapter
       - DatasetInputAdapter
       - MoCapNpzInputAdapter (AMASS MoCap data)
       - ScannerInputAdapter (future)
  -> ModelBackend
       - MockBackend
       - PassthroughModelBackend
       - SMPLBackend -> project/model
       - SMPLXBackend -> project/model
       - SMPLXMoCapBackend -> project/model (MoCap driven animation)
  -> OutputWriter
  -> manifest.json
  -> 3D Viewer (MVP frontend + animation player)
```

## 2) 模块边界

| 模块 | 职责 | 不做 |
| --- | --- | --- |
| InputAdapter | 把不同来源输入转换为标准 BodyInput | 不直接调用模型 |
| ModelBackend | 根据 BodyInput 生成 mesh/params/joints | 不关心原始数据来自哪里 |
| Model Module | 检查 SMPL/SMPL-X 依赖和模型文件，后续生成真实 mesh | 不做后端任务编排 |
| OutputWriter | 写结果文件和 manifest | 不做业务诊断 |
| CLI/API | 提供调用入口 | 不保存患者业务状态 |
| 3D Viewer | 加载 mesh 或样例模型并提供查看交互 | 不做商业级真实渲染 |
| Config | 管理路径、模型、运行参数 | 不保存 secrets |

## 3) 关键流程

1. 用户通过 CLI/API 发起任务。
2. Task Orchestrator 读取配置并选择 InputAdapter。
3. InputAdapter 生成标准 `BodyInput`。
4. ModelBackend 执行 mock 或 SMPL/SMPL-X 推理。
5. OutputWriter 写出结果和 manifest。
6. 3D Viewer 读取 manifest 或样例模型，展示可旋转、缩放的人体模型。
7. 调用方通过 manifest 判断成功、失败和输出路径。

## 4) HLD -> LLD 对照

- 全局约束：`02-lld-foundations-m0-overview.md`
- 输入适配：`03-lld-data-m1-input-adapters.md`
- 模型后端：`04-lld-model-m2-smpl-backend.md`
- CLI/API：`05-lld-edge-m3-api-and-cli.md`
- 前端展示：`06-lld-frontend-m4-3d-viewer.md`
- 模型模块：`07-lld-model-m5-smpl-module.md`

## 5) 设计原则

- Contract-first：先稳定 `BodyInput`、`ModelResult`、`manifest`。
- Replaceable backend：模型和数据源变化不影响主流程。
- Local-first：第一周以本地可复现为主。
- Handoff-first：每个实现步骤都能被后续开发者接上。

## References

- PRD：`documents/01-requirements/01-prd.md`
- Tracker：`documents/99-project-planning.md`
- Risks：`documents/04-challenges/01-technical-risks.md`
