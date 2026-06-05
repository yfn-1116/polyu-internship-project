# Model domain 目录说明

本目录放模型模块的数据契约。

## 当前文件

| 文件 | 作用 |
| --- | --- |
| `environment.py` | 环境检查报告 |
| `mesh_export.py` | mesh 导出结果 |

## 规则

- 只放轻量 dataclass 和序列化方法。
- 不导入 `torch`、`smplx` 等重依赖。
