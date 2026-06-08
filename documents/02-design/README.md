# Design 目录说明

本目录集中管理系统设计文档，按 HLD/LLD 分层。

## 记录目标

- HLD 说明系统边界、模块关系、关键流程。
- LLD 说明模块职责、接口、数据模型、故障模式和 DoD。
- 设计文档只写结论和边界；为什么这样取舍写到 FAQ 或 Challenges。

## 文件命名规范

- `*-hld-*.md`：高层设计。
- `*-lld-*.md`：低层设计。
- `08-lld-multimodal-input.md`：多源数据处理模块（图片/视频/scan/参数/尺寸 → 统一 Observation → Fitting → SMPL-X）。
- 文件编号表达阅读顺序，一个文件聚焦一个模块或问题域。

## 当前文档索引

### HLD

- `01-hld-smpl-service.md`

### LLD

- `02-lld-foundations-m0-overview.md`
- `03-lld-data-m1-input-adapters.md`
- `04-lld-model-m2-smpl-backend.md`
- `05-lld-edge-m3-api-and-cli.md`
- `06-lld-frontend-m4-3d-viewer.md`
- `07-lld-model-m5-smpl-module.md`
- `08-lld-multimodal-input.md`

## LLD 推荐结构

```md
# <LLD 标题>

## 0) 模块职责与边界
## 1) 数据模型 / 输入输出
## 2) 接口
## 3) 核心流程
## 4) Failure Modes
## 5) 测试策略与 DoD
## References
```
