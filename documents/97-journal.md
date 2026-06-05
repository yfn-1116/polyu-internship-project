# 项目周计划与进展（SMPL Body Modeling Service）

## 使用方式

- 本文件持续追加，不按版本拆分。
- 周计划记录：目标、完成、进行中、风险、下周计划。
- Daily Log 只记关键进展、阻塞和验证结果，不写聊天流水。
- 任务状态以 `99-project-planning.md` 为准。

## 最近变更（2026-06-05）

- Docs：将文档体系改为 quant_platform 风格：`99-project-planning.md` 负责 Plan + Tracker，新增 `97-journal.md` 负责进展日志。
- Docs：明确需求使用 PRD，设计使用 HLD/LLD，Runbook 只写可操作命令，FAQ/Knowledge Base 分别承载原因和资料。
- Decision：确认项目目标为可插拔、可扩展、模块化的 SMPL 人体建模服务。
- Decision：确认一周目标为尽量跑通 SMPL/SMPL-X pipeline，mock/synthetic 数据作为兜底。
- Decision：确认第一周需要可展示的前后端 MVP，增加最小 3D Viewer；商业级真实渲染放到后续产品化阶段。
- Validation：执行 `git diff --check` 作为文档格式检查。

## 全局里程碑

- `[DONE]` M0：文档体系建立并统一风格。
- `[DONE]` M1：工程骨架与 mock pipeline。
- `[TODO]` M2：SMPL/SMPL-X backend 接入。
- `[TODO]` M3：公开数据样本 adapter。
- `[DONE]` M4：最小 3D Viewer 前端展示。
- `[TODO]` M5：最小服务接口和交接文档。

## Week 1（2026-06-05 ~ 2026-06-11）

### 周目标

在一周内完成可复现、可展示的 SMPL 人体建模服务最小闭环：输入样本、模型 backend、结果 manifest、最小 3D Viewer、运行手册、后续接扫描仪的模块边界。

### 本周计划

- `[DONE]` 文档体系收敛为 PRD/HLD/LLD/Runbook/Journal。
- `[DONE]` 搭建 Python 工程骨架。
- `[DONE]` 跑通 mock/synthetic pipeline。
- `[TODO]` 尝试接入 SMPL/SMPL-X backend。
- `[TODO]` 明确 THuman2.0 获取状态和兜底样本。
- `[DONE]` 做一个最小 3D Viewer，用于展示 mesh 或样例模型。

### Daily Log

#### 2026-06-05（周五）

- 明确项目不是通用 demo，而是医疗体态系统中的独立 SMPL 建模服务。
- 形成三阶段路线：工程原型、SMPL/SMPL-X pipeline、医院扫描仪和主系统接入。
- 调研 SMPL 论文结论：本项目不从零训练 SMPL，使用已有模型能力并工程化封装。
- 调研数据策略：THuman2.0 优先，mock/synthetic 兜底，CAPE/FAUST 后续参考。
- 根据 quant_platform 文档体系重写 documents 目录结构和写作职责。
- 收敛可视化范围：第一周做最小 3D Viewer，后续再推进产品级渲染、测量 overlay 和报告展示。
- 补充后端分层设计：参考 quant_platform 的能力域结构，将后端设计调整为 `domain/ports/adapters/app/entrypoints`，并同步更新 LLD M0 与 `project/backend/README.md`。
- Backend：完成 Python 后端骨架，按 `domain/ports/adapters/app/entrypoints` 分层实现 CLI、领域契约、mock 输入、mock backend、文件输出和 pipeline。
- Backend：mock pipeline 已生成 `outputs/job_sample_001/manifest.json` 与 `outputs/job_sample_001/body.obj`。
- Validation：`cd project/backend && python -m pytest -v` 通过，7 passed。
- Validation：后端 CLI smoke 通过，命令见 `documents/98-runbook/README.md`。
- Frontend：完成 Vite + Three.js 最小 3D Viewer，加载 `public/sample/manifest.json` 和 `public/sample/body.obj`。
- Frontend：修复构建失败，根因是未使用的 React/R3F 配置文件引用了未安装的 `@vitejs/plugin-react`；当前 Viewer 采用 vanilla Three.js，不依赖 React。
- Validation：`cd project/frontend && npm run build` 通过。
- Frontend：新增 `sample-human` proxy mesh，Viewer 默认加载更像人体的低多边形样例；该样例只用于展示，不代表 SMPL 真实输出。
- Validation：`cd project/frontend && npm test` 通过，`sample-human verified: 48 vertices, 72 faces`。
- Validation：新增 sample-human 后再次执行 `cd project/frontend && npm run build`，通过。
- Model：新增独立 `project/model` 模块，按 `domain/app/entrypoints` 分层承载后续 SMPL/SMPL-X 能力。
- Model：新增 `check-env` 命令，检查 `torch/smplx/trimesh` 和 `models/smpl(x)` 目录。
- Validation：`cd project/model && python -m pytest -v` 通过，3 passed。
- Validation：`check-env` 通过；当前 `torch=present`，`smplx/trimesh/models/smpl/models/smplx=missing`。
- Model Assets：将 Windows E 盘下载的 `models_smplx_v1_1/models/smplx` 复制到项目本地 `models/smplx/`；保留原始下载目录，不执行破坏性移动。
- Decision：模型权重和公开数据集统一放在仓库根目录 `models/` 或 `data/` 的本地目录中，进入 pipeline 但不提交 Git。
- Validation：`check-env` 通过；当前 `torch/smplx/trimesh/models/smpl/models/smplx=present`。
- Validation：`git status --short` 为空，`git status --ignored --short` 显示 `models/` 为 ignored，模型权重未进入 Git 跟踪。
- Decision：数据集采用双轨推进：主线不等待真实数据集，先用 SMPL-X 模型导出默认人体；支线申请/下载 THuman2.0 或 FAUST。
- Dataset：THuman2.0/2.1 和 AGORA 不能只靠命令下载，需要注册/邮件申请；FAUST 作为较小真实 scan 兜底。
- Model：新增 `export-default-smplx`，导出 neutral SMPL-X 默认人体 `.obj` 与 manifest。
- Validation：`cd project/model && PYTHONPATH=src python -m pytest -v` 通过，4 passed。
- Validation：`export-default-smplx` 通过，输出 `10475` vertices、`20908` faces 到 `outputs/smplx_default_neutral/`。
