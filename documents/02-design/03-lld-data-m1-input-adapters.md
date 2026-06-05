# LLD M1：输入适配器

## 0) 模块职责与边界

InputAdapter 负责把不同来源的人体数据转换成统一 `BodyInput`。它不调用模型，也不写最终结果。

数据层分三段管理：`raw` 保留原始数据，`interim` 放预处理临时结果，`processed` 放已经整理成统一输入契约的样本。真实数据集不提交 Git。

## 1) 输入来源

| Adapter | 当前状态 | 用途 |
| --- | --- | --- |
| MockInputAdapter | 第一周必须 | 无数据时跑通 pipeline |
| DatasetObjInputAdapter | 第一周已完成最小版 | 读取公开人体 OBJ 样本 |
| ScannerInputAdapter | 后续预留 | 医院 3D 扫描仪 |

## 1.1) 数据目录

```text
data/
├── samples/
│   └── mock/
├── datasets/
│   ├── raw/
│   │   ├── thuman2/
│   │   ├── faust/
│   │   └── agora/
│   ├── interim/
│   └── processed/
```

职责：

- `samples/`：小型可提交样例，用于单测和 demo。
- `datasets/raw/`：真实公开数据集原始文件，不改写，不提交。
- `datasets/interim/`：格式转换、抽样、坐标/单位检查后的临时结果，不提交。
- `datasets/processed/`：DatasetInputAdapter 可读取的统一样本，不提交；后续可提交小型 manifest 模板。

## 2) 接口

```text
load(input_path, options) -> BodyInput
```

## 3) 核心流程

1. 接收 input_path 和配置。
2. 校验文件存在和格式。
3. 读取必要元数据，例如 scan id、mesh path、texture path、SMPL/SMPL-X fitting path。
4. 做最小预处理：路径规范化、单位/坐标记录、样本抽样、格式检查。
5. 转换成 BodyInput。
6. 返回给 Task Orchestrator。

## 3.1) 数据到展示的主链路

```text
raw dataset / scanner
-> DatasetInputAdapter / ScannerInputAdapter
-> BodyInput
-> SMPL/SMPL-X ModelBackend
-> outputs/job_xxx/body.obj + manifest.json
-> Frontend Three.js Viewer
```

Blender/MeshLab 是旁路验证工具，不是主链路必需步骤：

```text
outputs/job_xxx/body.obj -> Blender/MeshLab 手动检查或离线高清渲染
```

## 4) Failure Modes

- 文件不存在。
- 数据格式不支持。
- 数据集授权或下载未完成。
- 原始数据缺少 scan mesh、texture 或 fitting 参数。
- 单位/坐标系未知，只能先记录 metadata，不能假设为医疗测量可用。
- 扫描仪格式未知。

## 5) 测试策略与 DoD

- MockInputAdapter 必须有单测。
- DatasetObjInputAdapter 使用 THuman2.0 文档仓库中的 `data_sample/0525/0525.obj` 验证。
- Adapter 失败时错误必须进入 manifest。

当前最小 dataset-obj pipeline：

```text
THuman sample 0525.obj
-> DatasetObjInputAdapter
-> BodyInput(source_type="dataset-obj")
-> PassthroughModelBackend
-> outputs/job_0525/body.obj + material0.mtl + material0.jpeg + manifest.json
-> Frontend sample-thuman
```

## References

- Dataset notes：`documents/99-knowledge-base/02-dataset-notes.md`
- Risks：`documents/04-challenges/01-technical-risks.md`
