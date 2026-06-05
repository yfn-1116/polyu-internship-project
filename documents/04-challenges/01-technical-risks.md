# 技术风险

## RISK-001 公开数据集可能拿不到

- Status: Open
- Impact: 真实 dataset pipeline 可能延期。
- Current handling: THuman2.0 优先申请；mock/synthetic 样本兜底；CAPE/FAUST 后续参考。
- Next action: 确认验收是否允许 mock/synthetic 样本临时代替真实公开数据。

## RISK-002 SMPL/SMPL-X 模型文件可能未就绪

- Status: Open
- Impact: 真实模型 backend 可能不能及时运行。
- Current handling: MockBackend 必须先跑通；真实 backend 资源可用后替换。
- Next action: 确认本机是否已有 SMPL/SMPL-X 模型文件和下载权限。

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
