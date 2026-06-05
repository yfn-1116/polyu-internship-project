# Backend Tests 目录说明

本目录放后端测试，覆盖领域契约、adapter、pipeline 和 CLI smoke。

## 当前重点

| 文件 | 作用 |
| --- | --- |
| `test_contracts.py` | 领域对象序列化 |
| `test_mock_components.py` | mock 输入和 mock backend |
| `test_mock_pipeline.py` | mock pipeline 输出 OBJ/manifest |
| `test_dataset_obj_pipeline.py` | THuman OBJ 输入和 passthrough pipeline |
| `test_cli_help.py` | CLI help 可用 |
| `test_cli_run.py` | CLI run smoke |

## 运行

```bash
cd /home/yfn/polyu-internship-project/project/backend
PYTHONPATH=src python -m pytest -v
```
