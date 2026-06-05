# smpl_service 包说明

这是后端服务主包，提供 `python -m smpl_service` CLI 入口和人体建模 pipeline。

## 内容

| 路径 | 作用 |
| --- | --- |
| `__main__.py` | 模块启动入口 |
| `modeling/` | 人体建模能力域 |

## 规则

- 顶层包只放入口和跨域组织代码。
- 具体建模逻辑放入 `modeling/`。
