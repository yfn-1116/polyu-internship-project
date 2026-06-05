# 项目计划 + Tracker（SMPL Body Modeling Service）

本文是本项目的“路线图 + 执行队列 + 进度追踪”。开发过程的日更日志写在 `documents/97-journal.md`；本文聚焦任务状态、执行顺序和 DoD。

## 0) 使用方式（Plan + Tracker）

目标：让接手者和 Codex 都能按同一顺序继续推进，不需要重新翻聊天记录。

规则：

1. 永远从 `## 3) 执行队列` 顶部选择第一个 `[TODO]` 任务。
2. 开始前改为 `[DOING]`，填写 `Started: YYYY-MM-DD`。
3. 完成后改为 `[DONE]`，填写 `Done: YYYY-MM-DD`，并补齐实际修改文件和验证命令。
4. 遇到阻塞改为 `[BLOCKED]`，写清阻塞原因、需要什么、可绕行方案。
5. 每次改代码或接口后，同步更新 PRD/HLD/LLD/Runbook/Journal 中相关部分。

状态：`[TODO]` 未开始，`[DOING]` 进行中，`[DONE]` 完成，`[BLOCKED]` 阻塞，`[SKIP]` 确认不做。

## 1) 入口与文档索引

- PRD：`documents/01-requirements/01-prd.md`
- Design README：`documents/02-design/README.md`
- HLD：`documents/02-design/01-hld-smpl-service.md`
- LLD M0 全局约束：`documents/02-design/02-lld-foundations-m0-overview.md`
- LLD M1 输入适配：`documents/02-design/03-lld-data-m1-input-adapters.md`
- LLD M2 模型后端：`documents/02-design/04-lld-model-m2-smpl-backend.md`
- LLD M3 API/CLI：`documents/02-design/05-lld-edge-m3-api-and-cli.md`
- FAQ：`documents/03-faq/README.md`
- 风险：`documents/04-challenges/01-technical-risks.md`
- Runbook：`documents/98-runbook/README.md`
- Codex Prompt：`documents/98-runbook/99-prompt.md`
- Knowledge Base：`documents/99-knowledge-base/README.md`
- Journal：`documents/97-journal.md`

## 2) 里程碑（Milestones）

MVP 目标：一周内跑通“输入样本 -> SMPL/SMPL-X 或可替换 backend -> mesh/params/manifest 输出 -> 最小 3D Viewer 展示”的可复现前后端闭环，并保留后续医院 3D 扫描仪接入边界。

- M0 Docs & Scope：PRD/HLD/LLD/Runbook/Journal 文档体系建立。
- M1 Engineering Skeleton：Python 项目骨架、配置、CLI、输出目录、测试框架。
- M2 Mock Pipeline：mock/synthetic 输入跑通完整 pipeline。
- M3 SMPL/SMPL-X Backend：接入真实模型库或明确模型资源阻塞下的替代 backend。
- M4 Dataset Adapter：THuman2.0 优先，数据不可得时用可公开样本或 mock 兜底。
- M5 Service Interface：最小 HTTP API 或稳定 CLI 契约，输出 manifest 可被主系统读取。
- M6 Viewer MVP：最小 3D Viewer 能展示样例或输出 mesh。
- M7 Handoff：运行手册、风险、下一步任务完整。

## 3) 执行队列（按顺序执行）

### S-010 [DONE] 文档体系收敛为 PRD/HLD/LLD/Runbook/Journal

- Started: -
- Done: 2026-06-05
- Scope：
  - `documents/**`
- DoD：
  - `99-project-planning.md` 可作为 tracker 使用。
  - `97-journal.md` 可记录每日进展。
  - PRD/HLD/LLD/Runbook/FAQ/Knowledge Base 职责清楚，无重复大段背景。
- Verify：
  - `git diff --check` 通过

### S-020 [DONE] Python 工程骨架与配置

- Started: 2026-06-05
- Done: 2026-06-05
- Scope：
  - `project/` 或仓库约定代码目录
  - `documents/98-runbook/**`
- DoD：
  - 有可安装依赖文件。
  - 有 CLI 入口。
  - 有配置模板，真实模型路径不入库。
  - 有最小单测。
- Verify：
  - `cd project/backend && python -m pytest -v` 通过，7 passed
  - `PYTHONPATH=src python -m smpl_service --help` 通过

### S-030 [DONE] Mock Pipeline：输入 -> backend -> manifest

- Started: 2026-06-05
- Done: 2026-06-05
- DoD：
  - mock/synthetic 输入可跑完整流程。
  - 输出 `manifest.json`，包含 task_id、model_type、status、output_paths、errors。
  - Runbook 写明运行命令和成功标志。
- Verify：
  - `PYTHONPATH=project/backend/src python -m smpl_service run --source-type mock --input-path data/samples/mock/sample_001.json --model-type mock --output-dir outputs` 通过
  - 生成 `outputs/job_sample_001/manifest.json`
  - 生成 `outputs/job_sample_001/body.obj`

### S-040 [DOING] SMPL/SMPL-X backend 接入验证

- Started: 2026-06-05
- Done: -
- DoD：
  - 明确使用的模型包和模型文件放置方式。
  - 真实模型资源可用时生成 mesh/params。
  - 资源不可用时，文档记录阻塞和 mock backend 兜底。
- Progress：
  - `project/model` 已新增 `export-default-smplx`。
  - 默认 neutral SMPL-X 已能导出 `body.obj` 和 `manifest.json`。
  - 尚未接入 `project/backend` pipeline。
- Verify：
  - `cd project/model && PYTHONPATH=src python -m pytest -v` 通过，4 passed
  - `PYTHONPATH=src python -m smpl_model export-default-smplx --project-root /home/yfn/polyu-internship-project --output-dir /home/yfn/polyu-internship-project/outputs/smplx_default_neutral --gender neutral` 通过
  - 当前结果：`vertices_count=10475`，`faces_count=20908`

### S-045 [DONE] SMPL-X 模型资产放置与环境验证

- Started: 2026-06-05
- Done: 2026-06-05
- DoD：
  - 将本地下载的 SMPL-X 模型文件放入 `models/smplx/`。
  - 确认 `models/` 不进入 Git 跟踪。
  - 重新执行模型环境检查。
- Verify：
  - `PYTHONPATH=src python -m smpl_model check-env --project-root /home/yfn/polyu-internship-project` 通过
  - 当前结果：`torch=present`，`smplx=present`，`trimesh=present`，`models/smpl=present`，`models/smplx=present`
  - 模型复制后 `git status --short` 无模型文件变更
  - `git status --ignored --short` 显示 `models/` 为 ignored

### S-046 [DONE] SMPL v1.1.0 模型资产放置与环境验证

- Started: 2026-06-05
- Done: 2026-06-05
- DoD：
  - 将本地下载的 SMPL Python v1.1.0 放入 `models/smpl/`。
  - 确认 `models/` 不进入 Git 跟踪。
  - 重新执行模型环境检查。
- Verify：
  - `PYTHONPATH=src python -m smpl_model check-env --project-root /home/yfn/polyu-internship-project` 通过
  - 当前结果：`models/smpl=present`，`models/smplx=present`
  - 模型复制后 `git status --short` 无模型文件变更
  - `git status --ignored --short` 显示 `models/` 为 ignored

### S-050 [DONE] DatasetInputAdapter 设计与最小样本接入

- Started: 2026-06-05
- Done: 2026-06-05
- DoD：
  - THuman2.0 申请/下载状态记录在 Journal 和风险文档。
  - 数据集选择过程记录在 Knowledge Base。
  - 若数据不可得，使用可公开样本或 synthetic 样本完成 adapter 流程。
  - 数据不提交入 Git。
- Verify：
  - `cd project/backend && PYTHONPATH=src python -m pytest -v` 通过，9 passed
  - `PYTHONPATH=project/backend/src python -m smpl_service run --source-type dataset-obj --input-path data/datasets/raw/thuman2/THuman2.0-Dataset/data_sample/0525/0525.obj --model-type passthrough --output-dir outputs` 通过
  - `cd project/frontend && npm run prepare:thuman && npm test && npm run build` 通过
  - 当前前端样例：`sample-thuman verified: 289106 vertices, 500000 faces`

### S-060 [TODO] 最小 API/CLI 契约固化

- Started: -
- Done: -
- DoD：
  - CLI 或 HTTP API 契约稳定。
  - 输出 manifest 可作为后续主业务系统读取入口。
  - HLD/LLD/Runbook 同步更新。

### S-070 [DONE] 前端 3D Viewer MVP

- Started: 2026-06-05
- Done: 2026-06-05
- DoD：
  - 有可启动的最小前端页面。
  - 能加载默认样例 mesh 或后端输出 mesh。
  - 支持旋转、缩放、平移。
  - 能显示 manifest 核心字段。
  - Runbook 写明启动命令和成功标志。
- Verify：
  - `cd project/frontend && npm run build` 通过
  - Vite build 输出 `dist/index.html` 和 JS/CSS 产物

### S-080 [DONE] Sample Human Mesh Viewer

- Started: 2026-06-05
- Done: 2026-06-05
- DoD：
  - Viewer 默认加载更像人体的 sample-human proxy mesh。
  - 文档说明该 mesh 是展示 proxy，不是 SMPL 真实输出。
  - 前端 sample 有可执行验证命令。
- Verify：
  - `cd project/frontend && npm test` 通过，`sample-human verified: 48 vertices, 72 faces`
  - `cd project/frontend && npm run build` 通过

### S-090 [DONE] Model Module Skeleton & Environment Check

- Started: 2026-06-05
- Done: 2026-06-05
- DoD：
  - `project/model` 作为独立模型能力模块创建。
  - 模型文件目录规范为 `models/smpl` 和 `models/smplx`，并不入 Git。
  - 提供 `check-env` 命令检查依赖和模型目录。
  - Runbook 和 LLD 同步记录当前缺失项。
- Verify：
  - `cd project/model && python -m pytest -v` 通过，3 passed
  - `PYTHONPATH=src python -m smpl_model check-env --project-root /home/yfn/polyu-internship-project` 通过
  - 当前结果：`torch=present`，`smplx=missing`，`trimesh=missing`，`models/smpl=missing`，`models/smplx=missing`

## 4) Backlog（非顺序）

- `[TODO]` FastAPI 服务化：`POST /v1/modeling/jobs`。
- `[TODO]` 产品级渲染：更好的灯光、材质、阴影、纹理。
- `[TODO]` Mesh 截图导出。
- `[TODO]` 基础体态指标：身高、关节位置、围度占位接口。
- `[TODO]` 体态测量 overlay 和前后/左右/历史对比。
- `[TODO]` 医疗报告预览。
- `[TODO]` 医院扫描仪 `ScannerInputAdapter` 草案。
- `[TODO]` 数据安全：脱敏、审计、文件权限。
- `[TODO]` Docker 环境。
- `[TODO]` 将 Viewer 从静态 sample-human 切换为读取后端最新 manifest。
- `[TODO]` 实现 `SMPLXBackend` 默认参数生成真实人体 `.obj`。

## 5) 当前关键决策

- DEC-20260605-001：项目定位为医疗体态系统的独立 SMPL 人体建模服务。
- DEC-20260605-002：第一周目标不是纯 mock，而是尽量推进到 SMPL/SMPL-X pipeline。
- DEC-20260605-003：不从零训练 SMPL，使用已有模型和开源实现。
- DEC-20260605-004：THuman2.0 优先，mock/synthetic 兜底，CAPE/FAUST 后续参考。
- DEC-20260605-005：文档采用 quant_platform 风格：PRD/HLD/LLD/Runbook/Journal/Tracker 分层。
- DEC-20260605-006：第一周增加最小前端 3D Viewer，商业级真实渲染作为后续产品化方向。
- DEC-20260605-007：模型权重保存在本地 `models/`，只作为运行资产，不提交 Git；复制 Windows 下载目录到 WSL 项目目录时保留原始文件。
- DEC-20260605-008：数据集和模型主线并行推进；第一周主线用 SMPL-X 默认人体保证可展示，支线申请/下载 THuman2.0 或 FAUST。
- DEC-20260605-009：数据集选择采用“论文背景 + 工程可得性”双重判断；CAESAR/论文 registrations 只作为训练数据背景，主数据集选 THuman2.0/2.1，FAUST 作为真实 scan 兜底。
- DEC-20260605-010：真实数据集按 `data/datasets/raw|interim|processed` 本地管理，不提交 Git；Blender/MeshLab 只作为旁路验证和离线渲染工具。
