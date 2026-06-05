# smpl_model 包说明

这是独立模型能力包，负责检查模型环境、加载 SMPL-X、导出 OBJ。

## 内容

| 路径 | 作用 |
| --- | --- |
| `domain/` | 模型模块数据契约 |
| `app/` | 模型操作用例 |
| `entrypoints/` | CLI 入口 |

## 规则

- 只处理模型能力，不负责后端任务编排。
- 模型权重从项目根目录 `models/` 读取。
- 生成输出写到 ignored 的 `outputs/`。
