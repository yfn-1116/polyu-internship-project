# 技术风险

## RISK-001 公开数据集可能拿不到

- Status: Open
- Impact: 真实 dataset pipeline 可能延期。
- Current handling: THuman2.0/2.1 优先申请；FAUST 作为较小真实 scan 兜底；mock/synthetic 样本继续保证 pipeline 不阻塞。
- Next action: 先用 SMPL-X 默认人体完成主线展示，同时提交 THuman2.0/FAUST 获取申请。

## RISK-002 SMPL/SMPL-X 模型文件可能未就绪

- Status: Closed
- Impact: 已不阻塞默认 SMPL-X mesh 导出。
- Current handling: SMPL-X 模型文件已放入 `models/smplx/`，依赖和默认导出已验证。
- Next action: 接入后端 pipeline，并保留 mock backend 兜底。

## RISK-003 医院扫描仪格式未知

- Status: Open
- Impact: 无法现在实现真实 ScannerInputAdapter。
- Current handling: HLD/LLD 只预留 ScannerInputAdapter 边界。
- Next action: 后续向导师或医院侧确认设备型号、SDK 和输出格式。

## RISK-004 一周范围过大

- Status: Open
- Impact: 如果同时追求真实模型、真实数据、API、UI，交付会不稳定。
- Current handling: 优先 CLI + mock pipeline + manifest；真实 SMPL/数据集作为增强目标。
- Next action: 按 `99-project-planning.md` 执行队列逐项推进。
