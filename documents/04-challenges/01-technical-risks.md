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

## RISK-005 SMPL+H → SMPL-X 关节映射可能不完全正确

- Status: Open
- Impact: AMASS 数据为 SMPL+H 格式（52 关节），映射到 SMPL-X（55 关节）时 jaw 和 eyes 填零，可能导致头部/面部姿态异常。
- Current handling: 映射规则已记录在 `documents/99-knowledge-base/02-dataset-notes.md`；先实现并对比默认姿势下的 mesh，确认主体姿态正确。
- Next action: 导出后人工检查头部区域是否合理；如有明显问题，考虑从 SMPL-X 模型中读取默认 jaw/eye 参数替代填零。

## RISK-006 全帧动画序列数据量大

- Status: Open
- Impact: 单情绪全帧导出（2582 帧 × 10475 顶点 × 12 字节 ≈ 300MB）；13 种情绪总计约 8GB。前端加载大文件可能卡顿。
- Current handling: 支持 `--target-fps` 降采样（如 120fps → 30fps 减少 75%）；前端按需加载，不预加载全部情绪。
- Next action: 先用 30fps 降采样验证效果；如仍过大，考虑关键帧插值或 WebGL buffer streaming。
