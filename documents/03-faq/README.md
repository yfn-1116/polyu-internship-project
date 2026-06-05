# FAQ 目录说明

本目录沉淀“为什么这么做”的关键解释，作为 PRD/HLD/LLD 的补充。Runbook 只写怎么操作；FAQ 写原因和取舍。

## 当前 FAQ

## Q: 为什么第一周还要保留 mock backend？

因为 SMPL/SMPL-X 模型文件和公开数据集都可能需要注册、申请或手动下载。如果 pipeline 完全依赖这些资源，第一周交付风险很高。mock backend 的目的不是替代真实模型，而是保证服务边界、manifest、CLI/API、Runbook 可以先稳定。

## Q: 为什么不从零训练 SMPL？

SMPL 训练依赖大规模对齐 3D 人体扫描数据和复杂训练流程，不符合一周实习交付周期。本项目的价值在于把已有 SMPL/SMPL-X 能力工程化封装成可接入医疗系统的服务。

## Q: 为什么输入接口优先考虑 3D scan/mesh，而不是图片？

后续目标是接医院 3D 扫描仪，扫描仪输出更可能接近点云、mesh 或深度数据。图片/视频路线资料多，但和未来真实设备接口差距更大。

## Q: 为什么需要 manifest？

manifest 是后续主业务系统、开发者和测试脚本共同读取的稳定结果入口。即使输出文件种类变化，调用方仍能通过 manifest 知道任务状态、模型类型、结果路径和错误信息。

## Q: 第一周要不要做真实好看的商业级渲染？

不作为第一周目标。第一周需要最小 3D Viewer，让导师或接手者能看到模型结果；商业级渲染需要纹理、材质、光照、测量 overlay 和报告设计，放到后续产品化阶段推进。

## Q: Viewer 现在显示的是 SMPL 真实人体吗？

不是。当前默认显示的是 `sample-human` 低多边形 proxy mesh，用于验证前端加载、旋转、缩放和平移流程。真实 SMPL/SMPL-X 人体需要后续接入模型文件和 `SMPLBackend` 后生成。

## 关联文档

- PRD：`documents/01-requirements/01-prd.md`
- HLD：`documents/02-design/01-hld-smpl-service.md`
- Risks：`documents/04-challenges/01-technical-risks.md`
