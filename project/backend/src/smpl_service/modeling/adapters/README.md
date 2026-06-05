# adapters 目录说明

本目录放端口的具体实现，负责和外部文件、数据集、模型输出格式打交道。

## 当前文件

| 文件 | 作用 |
| --- | --- |
| `mock_input_adapter.py` | 读取 mock JSON 输入 |
| `dataset_obj_input_adapter.py` | 读取 THuman/OBJ 样本输入 |
| `mock_model_backend.py` | 生成 mock 盒子 mesh |
| `passthrough_model_backend.py` | 将 dataset OBJ 原样作为输出 mesh |
| `file_output_writer.py` | 写出 OBJ、manifest 和材质 sidecar |

## 规则

- Adapter 可以读文件，但不要编排完整任务。
- 新数据集格式优先新增 adapter，不改现有 adapter 行为。
- 大文件只读写 ignored 路径。
