# Model Tests 目录说明

本目录放模型模块测试。

## 当前文件

| 文件 | 作用 |
| --- | --- |
| `test_check_env.py` | 检查依赖和模型目录状态 |
| `test_smplx_export.py` | 检查 SMPL-X OBJ/manifest 导出和 shape preset |

## 运行

```bash
cd /home/yfn/polyu-internship-project/project/model
PYTHONPATH=src python -m pytest -v
```
