# Backend 说明

本目录是 SMPL 人体建模服务的后端代码入口。第一周目标是先跑通本地可复现 MVP：

```text
mock input -> InputAdapter -> ModelBackend -> OutputWriter -> manifest + OBJ
```

## 目录职责

```text
project/backend/
├── pyproject.toml
├── src/smpl_service/
└── tests/
```

| 路径 | 作用 |
| --- | --- |
| `pyproject.toml` | Python 包配置、依赖、pytest 配置 |
| `src/smpl_service/` | 后端服务源码 |
| `tests/` | 单元测试和 smoke 测试 |

## 源码分层

```text
src/smpl_service/
├── __main__.py
└── modeling/
    ├── domain/
    ├── ports/
    ├── adapters/
    ├── app/
    └── entrypoints/
```

| 层 | 作用 |
| --- | --- |
| `domain/` | 领域数据契约，例如 `BodyInput`、`ModelResult`、`Manifest` |
| `ports/` | 输入、模型、输出端口协议，定义可替换边界 |
| `adapters/` | 具体实现，例如 mock 输入、mock backend、文件输出 |
| `app/` | 用例编排，例如一次完整建模 pipeline |
| `entrypoints/` | CLI/API 等外部入口 |

## 第一周文件职责

| 文件 | 作用 |
| --- | --- |
| `__main__.py` | 支持 `python -m smpl_service` 启动 |
| `modeling/domain/contracts.py` | `BodyInput`、`ModelResult`、`Manifest` 数据契约 |
| `modeling/ports/input_port.py` | 输入适配器协议 |
| `modeling/ports/model_port.py` | 模型后端协议 |
| `modeling/ports/output_port.py` | 输出写入协议 |
| `modeling/adapters/mock_input_adapter.py` | 第一周 mock 输入 |
| `modeling/adapters/mock_model_backend.py` | 第一周 mock 模型输出 |
| `modeling/adapters/file_output_writer.py` | 写出 `.obj` 和 `manifest.json` |
| `modeling/app/pipeline.py` | 编排完整建模任务 |
| `modeling/entrypoints/cli.py` | CLI 参数解析和命令入口 |

## 分层规则

- CLI 只负责接收参数，不写模型逻辑。
- InputAdapter 只负责把原始输入转成 `BodyInput`。
- ModelBackend 只负责把 `BodyInput` 转成模型结果。
- OutputWriter 只负责写文件。
- Pipeline 只负责编排，不直接解析输入文件或写 OBJ 细节。

## 后续扩展

- 接 THuman2.0：新增 `DatasetInputAdapter`。
- 接医院扫描仪：新增 `ScannerInputAdapter`。
- 接真实模型：新增 `SMPLBackend` 或 `SMPLXBackend`。
- 接主业务系统：在保持 manifest 兼容的前提下增加 API 层。
