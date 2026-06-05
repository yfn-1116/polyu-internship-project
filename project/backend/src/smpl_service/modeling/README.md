# modeling 包说明

本包是后端的人体建模能力域，负责把输入数据转换为模型输出和 manifest。

## 分层

| 路径 | 作用 |
| --- | --- |
| `domain/` | 数据契约 |
| `ports/` | 可替换接口协议 |
| `adapters/` | 具体输入/模型/输出实现 |
| `app/` | 用例编排 |
| `entrypoints/` | CLI/API 等外部入口 |

## 当前主流程

```text
CLI -> pipeline -> InputAdapter -> ModelBackend -> OutputWriter
```

## 规则

- 新数据源先加 adapter。
- 新模型后端先实现 port 契约。
- Pipeline 只编排，不写具体解析/导出细节。
