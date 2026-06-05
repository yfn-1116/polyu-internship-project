# 人体数据集笔记

## 当前判断

| 数据集 | 用途 | 风险 | 当前结论 |
| --- | --- | --- | --- |
| THuman2.0/2.1 | 真实 3D scan/mesh 样本，含 SMPL/SMPL-X fitting 信息 | 需要申请授权，不能直接命令下载 | 第一优先 |
| FAUST | 300 个真实高分辨率人体 scan，适合小规模验证 | 需要从官方入口获取下载权限/链接 | 兜底公开 scan 数据 |
| AGORA | 高真实感合成场景，带 SMPL-X fits | 需官网注册，下载链接只在网站内有效 | 后续算法/图像任务参考 |
| CAESAR | SMPL 论文训练形状空间的重要来源 | 商业/受限访问，不适合第一周 | 只作为论文背景 |
| CAPE | 穿衣人体、动态人体参考 | 范围复杂 | 后续增强 |
| mock/synthetic | 快速跑通 pipeline | 真实性低 | 第一周兜底 |

## 对本项目有用的结论

- 第一周不能把交付卡死在数据集授权上。
- 输入接口应面向 3D scan/mesh，而不是只面向图片。
- DatasetInputAdapter 和 MockInputAdapter 要共用同一个 BodyInput contract。
- 当前采用双轨策略：主线用 SMPL-X 模型生成默认人体；支线申请/下载 THuman2.0 或 FAUST。

## 获取方式

THuman2.0/2.1：

- 官方入口：`https://github.com/ytrock/THuman2.0-Dataset`
- 需要阅读 agreement，通过邮件申请下载链接。
- 拿到链接后放入 `data/datasets/thuman2/`。

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
├── thuman2/
├── faust/
└── agora/
```

数据集文件不提交 Git。

## 关联文档

- `documents/02-design/03-lld-data-m1-input-adapters.md`
- `documents/04-challenges/01-technical-risks.md`
