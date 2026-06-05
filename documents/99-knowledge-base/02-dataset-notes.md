# 人体数据集笔记

## 当前判断

| 数据集 | 用途 | 风险 | 当前结论 |
| --- | --- | --- | --- |
| THuman2.0 | 真实 3D scan/mesh 样本，含 SMPL/SMPL-X fitting 信息 | 需要申请授权 | 第一优先 |
| CAPE | 穿衣人体、动态人体参考 | 范围复杂 | 后续增强 |
| FAUST | mesh registration benchmark | 不适合作主开发数据源 | 后续评估参考 |
| mock/synthetic | 快速跑通 pipeline | 真实性低 | 第一周兜底 |

## 对本项目有用的结论

- 第一周不能把交付卡死在数据集授权上。
- 输入接口应面向 3D scan/mesh，而不是只面向图片。
- DatasetInputAdapter 和 MockInputAdapter 要共用同一个 BodyInput contract。

## 关联文档

- `documents/02-design/03-lld-data-m1-input-adapters.md`
- `documents/04-challenges/01-technical-risks.md`
