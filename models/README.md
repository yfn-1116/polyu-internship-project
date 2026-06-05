# Models 目录说明

本目录放本地 SMPL/SMPL-X 模型权重和模型包。该目录整体不提交 Git。

## 当前内容

| 路径 | 作用 | 是否提交 Git |
| --- | --- | --- |
| `smpl/SMPL_python_v.1.1.0/` | SMPL v1.1.0 Python 包和 `.pkl` 权重 | 否 |
| `smplx/` | SMPL-X male/female/neutral `.npz` 和 `.pkl` 权重 | 否 |

## 使用方式

- `project/model` 读取这里的模型文件。
- `project/backend` 不直接访问模型权重。
- 真实模型路径必须通过参数或配置传入，不写死到业务逻辑。

## 规则

- 不提交 `.pkl`、`.npz`、zip 权重包。
- 只在文档中记录模型来源、放置路径和验证命令。
- 如果新增模型版本，在本文件补一行说明。
