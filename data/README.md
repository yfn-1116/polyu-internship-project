# Data 目录说明

本目录放项目输入数据。Git 只提交小型 mock/sample；真实公开数据集、处理中间文件和处理后样本都只保存在本地。

## 目录职责

| 路径 | 作用 | 是否提交 Git |
| --- | --- | --- |
| `samples/` | 小型可复现样例，用于测试和 demo | 是 |
| `samples/mock/` | mock pipeline 输入样本 | 是 |
| `datasets/raw/` | THuman/FAUST/AGORA 等原始下载数据 | 否 |
| `datasets/interim/` | 数据清洗、格式转换、抽样中间结果 | 否 |
| `datasets/processed/` | DatasetInputAdapter 可读取的处理后样本 | 否 |
| `interim/` | 临时实验结果 | 否 |
| `processed/` | 项目级处理结果缓存 | 否 |

## 当前可用样本

- `samples/mock/sample_001.json`：mock 后端测试样本。
- `datasets/raw/thuman2/THuman2.0-Dataset/data_sample/0525/0525.obj`：THuman 文档仓库中的真实 OBJ 小样例，本地 ignored。

## 规则

- 不提交真实数据集、纹理、扫描文件和大体积输出。
- 新数据集先放 `datasets/raw/<dataset_name>/`。
- 预处理脚本生成的结果放 `datasets/interim/` 或 `datasets/processed/`。
