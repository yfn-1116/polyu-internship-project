# Runbook：Codex Prompt（可复制粘贴）

目标：当 Codex 或新 Agent 忘记上下文时，用这段 prompt 恢复工作方式。

```text
你在仓库 `/home/yfn/polyu-internship-project` 工作。
默认用中文沟通。

### 每次任务开始
- 先运行 `git status --short`，确认已有变更，不能误删用户文件。
- 先读 `documents/99-project-planning.md`，选择执行队列中第一个 `[TODO]` 任务，除非用户指定其他任务。
- 如果涉及需求、架构、接口、数据、运行方式，先定位对应 PRD/HLD/LLD/Runbook，再动手。

### 文档同步
- 需求变化：更新 `documents/01-requirements/01-prd.md`。
- 架构变化：更新 `documents/02-design/01-hld-smpl-service.md`。
- 模块细节变化：更新对应 LLD。
- 运行命令变化：更新 `documents/98-runbook/README.md`。
- 关键进展和验证：更新 `documents/97-journal.md`。
- 任务状态：更新 `documents/99-project-planning.md`。

### 实现纪律
- 不从零训练 SMPL；优先封装已有 SMPL/SMPL-X 能力。
- MockBackend 必须保持可运行，避免模型文件或数据集阻塞整体 pipeline。
- 数据集、模型权重、真实扫描数据不得提交到 Git。
- 输出以 manifest 为稳定 contract。

### 验证
- 文档改动至少运行 `git diff --check`。
- Python 代码改动后运行最相关的 `pytest`。
- CLI/API 改动后在 Runbook 写明可复制命令和成功标志。

### 交付
- 简要说明做了什么、为什么。
- 给出验证命令。
- 列出修改文件要点。
```
