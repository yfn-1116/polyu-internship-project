# Project 目录说明

本目录放可执行代码。三个子项目并行存在，避免把服务编排、模型依赖和前端展示混在一起。

## 子项目

| 路径 | 作用 |
| --- | --- |
| `backend/` | 后端 pipeline、输入适配器、输出 manifest/OBJ |
| `model/` | SMPL/SMPL-X 模型能力、模型环境检查、mesh 导出 |
| `frontend/` | Three.js 3D Viewer，用于展示 dataset scan 和 SMPL-X 输出 |

## 当前主链路

```text
data sample -> backend adapter -> output OBJ/manifest -> frontend viewer
model files -> model module -> generated OBJ -> frontend viewer
```

## 规则

- 后端不直接写前端代码。
- 前端不直接读取模型权重。
- 模型模块不负责服务编排。
- 大数据、模型权重、生成输出都在项目根目录的 ignored 路径中管理。
