# 人体数据集笔记

## 写入目的

本文记录人体数据集的选择过程、取舍理由、下载方式和本地放置规则。读者需要能看懂：论文用了什么数据、为什么本项目不复现训练数据、第一周实际选什么数据集、下载后放在哪里。

## 当前判断

| 数据集 | 用途 | 风险 | 当前结论 |
| --- | --- | --- | --- |
| THuman2.0/2.1 | 真实 3D scan/mesh 样本，含 SMPL/SMPL-X fitting 信息 | 需要申请授权，不能直接命令下载 | 第一优先 |
| FAUST | 300 个真实高分辨率人体 scan，适合小规模验证 | 需要从官方入口获取下载权限/链接 | 兜底公开 scan 数据 |
| AGORA | 高真实感合成场景，带 SMPL-X fits | 需官网注册，下载链接只在网站内有效 | 后续算法/图像任务参考 |
| CAESAR | SMPL 论文训练形状空间的重要来源 | 商业/受限访问，不适合第一周 | 只作为论文背景 |
| CAPE | 穿衣人体、动态人体参考 | 范围复杂 | 后续增强 |
| mock/synthetic | 快速跑通 pipeline | 真实性低 | 第一周兜底 |

## 论文数据与复现边界

SMPL 论文训练使用两类 registrations：

- Multi-pose dataset：40 个人，1786 个配准 mesh，用于学习 pose-dependent deformation、关节和蒙皮相关参数。
- Multi-shape dataset：来自 CAESAR，约 1700 个男性 registrations 和 2100 个女性 registrations，用于学习人体 shape space。

这些 registrations 不是普通公开 `.obj` 文件，而是高精度人体扫描经过统一拓扑配准后的训练数据。CAESAR 和论文 multi-pose registrations 不适合作为第一周工程数据源。

本项目不复现 SMPL 训练过程，只做工程复现：

```text
使用已有 SMPL/SMPL-X 模型 -> 输入参数或扫描样本 -> 生成 mesh/manifest -> 前端展示
```

## 选择过程

选择标准：

1. 是否接近后续医院 3D 扫描仪输入。
2. 是否有真实 3D scan/mesh，而不是只有图片。
3. 是否提供或容易对接 SMPL/SMPL-X fitting 信息。
4. 是否能在一周内拿到至少小样本。
5. License/申请流程是否可接受，且数据不需要提交 Git。

结论：

- THuman2.0/2.1 最符合主目标：真实人体 scan、纹理和 SMPL/SMPL-X fitting 资料，作为主数据集申请。
- FAUST 数据规模较小且是真实高分辨率 scan，作为 THuman2.0 未及时拿到时的兜底验证集。
- AGORA 有 SMPL-X fits，但偏合成图像/多人场景，作为后续算法评测参考。
- CAESAR 只作为论文背景，不作为当前可执行数据源。

## 对本项目有用的结论

- 第一周不能把交付卡死在数据集授权上。
- 输入接口应面向 3D scan/mesh，而不是只面向图片。
- DatasetInputAdapter 和 MockInputAdapter 要共用同一个 BodyInput contract。
- 当前采用双轨策略：主线用 SMPL-X 模型生成默认人体；支线申请/下载 THuman2.0 或 FAUST。

## 获取方式

THuman2.0/2.1：

- 官方入口：`https://github.com/ytrock/THuman2.0-Dataset`
- 需要阅读 agreement，通过邮件申请下载链接。
- 文档仓库可 clone，但完整数据仍需申请。
- 拿到链接后放入 `data/datasets/raw/thuman2/`。

当前本地状态：

- 已 clone 文档仓库到 `data/datasets/raw/thuman2/THuman2.0-Dataset/`。
- 仓库约 65M，主要包含 README、agreement、示例图片和一个小样例。
- 可用小样例：`data/datasets/raw/thuman2/THuman2.0-Dataset/data_sample/0525/0525.obj`。
- 对应纹理和材质：`material0.jpeg`、`material0.mtl`。

README 中的重要信息：

- THuman2.0 包含 500 个高质量人体 scan，每个 scan 提供 `.obj` 和 texture。
- THuman2.1 将规模扩展到 2500 个模型。
- 完整数据集加密，需要填写 agreement 并邮件申请下载链接。
- 仓库说明提供了 SMPL-X fitting parameters/meshes 的下载入口；后续下载后应放入 `data/datasets/raw/thuman2/smplx_fittings/`。

FAUST：

- 官方入口：`https://is.mpg.de/code/faust-dataset`
- 数据集包含 300 个真实高分辨率人体扫描。
- 拿到链接后放入 `data/datasets/faust/`。

AGORA：

- 官方入口：`https://agora.is.tue.mpg.de/index.html`
- 需要注册并接受 License Agreement；官网说明下载链接只在网站内有效。
- 后续如果做图像/多人场景 benchmark，再接入。

## 本地目录约定

```text
data/datasets/
├── raw/
│   ├── thuman2/
│   ├── faust/
│   └── agora/
├── interim/
└── processed/
```

目录含义：

- `raw/`：原始下载包、解压后的原始 scan/texture/fitting 文件，不直接改写。
- `interim/`：抽样、格式转换、坐标/单位检查后的中间文件。
- `processed/`：转换成项目统一输入契约后的样本，供 DatasetInputAdapter 读取。

数据集文件不提交 Git。只提交小型 mock/sample、文档和必要的 manifest 模板。

## 关联文档

- `documents/02-design/03-lld-data-m1-input-adapters.md`
- `documents/04-challenges/01-technical-risks.md`
