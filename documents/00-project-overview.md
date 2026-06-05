# Documents 总览（SMPL Body Modeling Service）

本目录用于沉淀项目从需求、设计、实现、验证到交接的全部工程记录。风格参考 `quant_platform/documents`：主线用 Tracker 推进，日常用 Journal 记录，设计按 HLD/LLD 分层，FAQ 解释原因，Runbook 只写操作。

## 读者怎么开始

1. 先读 `99-project-planning.md`：知道当前任务队列和下一步。
2. 再读 `97-journal.md`：知道最近做过什么、卡在哪里。
3. 需要理解目标读 `01-requirements/01-prd.md`。
4. 需要实现模块读 `02-design/README.md`，再跳到对应 HLD/LLD。
5. 需要运行项目读 `98-runbook/README.md`。

## 文档职责

| 位置 | 职责 |
| --- | --- |
| `99-project-planning.md` | 路线图、执行队列、任务 DoD |
| `97-journal.md` | 每日/每周关键进展、验证、阻塞 |
| `01-requirements/` | PRD、需求边界、验收标准 |
| `02-design/` | HLD/LLD、模块边界、接口和数据契约 |
| `03-faq/` | 为什么这样做、取舍解释 |
| `04-challenges/` | 风险、阻塞、兜底方案 |
| `98-runbook/` | 安装、运行、测试、排错 |
| `99-knowledge-base/` | 论文、数据集、工具资料 |

## 写作规则

- 文档只写自己负责的内容，不复制大段背景。
- 需求变更先更新 PRD；架构变更更新 HLD；模块细节更新 LLD；操作步骤更新 Runbook。
- 每次实现后更新 `97-journal.md`，关键任务状态更新 `99-project-planning.md`。
- 重要取舍写 FAQ 或 Challenges，并在 HLD/LLD 中引用。
