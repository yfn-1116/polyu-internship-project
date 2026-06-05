# LLD M1：输入适配器

## 0) 模块职责与边界

InputAdapter 负责把不同来源的人体数据转换成统一 `BodyInput`。它不调用模型，也不写最终结果。

## 1) 输入来源

| Adapter | 当前状态 | 用途 |
| --- | --- | --- |
| MockInputAdapter | 第一周必须 | 无数据时跑通 pipeline |
| DatasetInputAdapter | 第一周尽量 | 读取公开人体数据样本 |
| ScannerInputAdapter | 后续预留 | 医院 3D 扫描仪 |

## 2) 接口

```text
load(input_path, options) -> BodyInput
```

## 3) 核心流程

1. 接收 input_path 和配置。
2. 校验文件存在和格式。
3. 读取必要元数据。
4. 转换成 BodyInput。
5. 返回给 Task Orchestrator。

## 4) Failure Modes

- 文件不存在。
- 数据格式不支持。
- 数据集授权或下载未完成。
- 扫描仪格式未知。

## 5) 测试策略与 DoD

- MockInputAdapter 必须有单测。
- DatasetInputAdapter 可以先用小样本或 synthetic 文件验证。
- Adapter 失败时错误必须进入 manifest。

## References

- Dataset notes：`documents/99-knowledge-base/02-dataset-notes.md`
- Risks：`documents/04-challenges/01-technical-risks.md`
