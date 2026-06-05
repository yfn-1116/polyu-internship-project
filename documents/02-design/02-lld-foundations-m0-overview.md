# LLD M0：全局约束与架构总览

## 0) 模块职责与边界

本文件定义所有模块共同遵守的约束，避免后续每个模块各写一套输入输出、路径和错误规则。

## 1) 全局契约

### 1.1 标准输入 BodyInput

```text
BodyInput
- source_type: mock | dataset | scanner
- subject_id: string
- input_files: list[string]
- metadata: dict
```

### 1.2 标准输出 ModelResult

```text
ModelResult
- task_id: string
- model_type: mock | smpl | smplx
- status: success | failed
- output_paths: dict
- errors: list[string]
```

### 1.3 Manifest

每次任务必须输出 `manifest.json`。manifest 是后续主业务系统和接手者排错的第一入口。

## 2) 目录与文件约束

- 模型文件、数据集、真实扫描数据不入 Git。
- 本地路径通过配置文件或环境变量提供。
- 输出统一写入 `outputs/<task_id>/`。
- 样例输入可以放 `data/samples/`，但只能放轻量 mock 数据。

## 3) 后端代码分层

第一周后端放在 `project/backend/`，采用 local-first Python package。参考 quant_platform 的“能力域 + 分层”思想：领域契约放 `domain`，端口协议放 `ports`，外部实现放 `adapters`，用例编排放 `app`，入口放 `entrypoints`。

```text
project/backend/
├── README.md
├── pyproject.toml
├── src/smpl_service/
│   ├── __init__.py
│   ├── __main__.py
│   └── modeling/
│       ├── domain/
│       │   └── contracts.py
│       ├── ports/
│       │   ├── input_port.py
│       │   ├── model_port.py
│       │   └── output_port.py
│       ├── adapters/
│       │   ├── mock_input_adapter.py
│       │   ├── mock_model_backend.py
│       │   └── file_output_writer.py
│       ├── app/
│       │   └── pipeline.py
│       └── entrypoints/
│           └── cli.py
└── tests/
```

| 文件 | 作用 | 边界 |
| --- | --- | --- |
| `README.md` | 给接手者解释后端目录、运行方式和文件职责 | 不写长设计推理 |
| `pyproject.toml` | Python 包配置、依赖、pytest 配置 | 不放本地 secrets |
| `__main__.py` | 支持 `python -m smpl_service` | 只转发到 CLI |
| `modeling/domain/contracts.py` | `BodyInput`、`ModelResult`、`Manifest` 数据契约 | 不依赖具体 backend |
| `modeling/ports/*.py` | 输入、模型、输出端口协议 | 只定义边界，不做实现 |
| `modeling/adapters/mock_input_adapter.py` | mock 输入适配器 | 不调用模型 |
| `modeling/adapters/mock_model_backend.py` | mock 模型后端 | 不读取原始数据源 |
| `modeling/adapters/file_output_writer.py` | 写 `.obj` 和 `manifest.json` | 不编排任务 |
| `modeling/app/pipeline.py` | 编排一次建模任务 | 不直接解析原始输入或写 OBJ 细节 |
| `modeling/entrypoints/cli.py` | CLI 参数解析和命令入口 | 不写模型逻辑 |
| `tests/` | 单测和 smoke 测试 | 测行为，不测实现细节 |

设计原则：

- `domain/contracts.py` 是核心边界，后续接 SMPL/SMPL-X 或扫描仪时优先保持兼容。
- `ports/` 定义可替换边界，后续真实 SMPL、THuman2.0、医院扫描仪都通过端口接入。
- `adapters/` 只放具体实现，mock、dataset、scanner、smplx 都是 adapter。
- `app/pipeline.py` 只编排，不把输入解析、模型运行、文件写出混在一起。
- 每新增重要文件，都要同步更新 `project/backend/README.md`。

## 4) Failure Modes

- 输入文件不存在：任务失败，manifest 写入错误。
- 模型资源缺失：真实 backend 失败；允许切换 mock backend。
- 数据集授权未完成：不阻塞 mock pipeline。
- 输出写入失败：任务失败，错误写入 manifest。

## 5) 模型模块目录

真实 SMPL/SMPL-X 能力放在 `project/model/`，与后端、前端并行。

```text
project/model/
├── README.md
├── pyproject.toml
├── src/smpl_model/
│   ├── domain/
│   ├── app/
│   └── entrypoints/
├── tests/
└── examples/
```

模型权重和真实数据放仓库根目录 `models/`，并通过 `.gitignore` 排除：

```text
models/
├── smpl/
└── smplx/
```

当前模型模块只做环境检查；后续再接 `SMPLBackend` / `SMPLXBackend`。

## 6) 测试策略与 DoD

- 单测覆盖 BodyInput/ModelResult/manifest 序列化。
- smoke 测试覆盖一次完整 mock pipeline。
- 模型模块先覆盖环境检查，不强制安装真实模型依赖。
- 所有运行命令写入 Runbook。

## References

- HLD：`documents/02-design/01-hld-smpl-service.md`
- Runbook：`documents/98-runbook/README.md`
