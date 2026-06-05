# LLD M2：SMPL/SMPL-X 模型后端

## 0) 模块职责与边界

ModelBackend 负责把标准 `BodyInput` 转换为人体模型输出。它不关心原始输入来自 mock、数据集还是扫描仪。

## 1) Backend 类型

| Backend | 用途 | 第一周策略 |
| --- | --- | --- |
| MockBackend | 保证 pipeline 不被模型资源卡死 | 必须实现 |
| SMPLBackend | 输出 SMPL mesh/params | 资源可用则实现 |
| SMPLXBackend | 输出 SMPL-X mesh/params | 资源可用则实现 |

## 2) 接口

```text
run(body_input, options) -> ModelResult
```

## 3) 核心流程

1. 读取 BodyInput。
2. 选择 backend。
3. 加载模型资源或 mock 参数。
4. 生成 mesh/params/joints。
5. 返回 ModelResult。

## 4) Failure Modes

- 模型文件缺失。
- Python 包或 CUDA 环境不可用。
- 输入与 backend 预期不匹配。
- 输出 mesh 写入失败。

## 5) 测试策略与 DoD

- MockBackend 必须稳定通过测试。
- 真实 backend 至少提供可运行验证命令或明确阻塞原因。
- 模型资源路径不得写死在代码里。

## References

- SMPL notes：`documents/99-knowledge-base/01-smpl-paper-notes.md`
- Tech risk：`documents/04-challenges/01-technical-risks.md`
