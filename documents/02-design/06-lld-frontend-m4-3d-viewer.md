# LLD M4：前端 3D Viewer MVP

## 0) 模块职责与边界

3D Viewer 负责把后端生成的 mesh 或样例模型展示给用户，让第一周成果可以被直观看到。它不负责模型拟合、体态诊断或商业级真实渲染。

## 1) MVP 功能

- 加载 `.obj`、`.ply` 或 `.glb` 中的一种可视化格式。
- 支持旋转、缩放、平移。
- 显示任务状态、model_type、manifest 路径和输出文件路径。
- 提供默认样例模型，避免后端真实模型未就绪时前端无法演示。

## 2) 推荐技术

- React 或 Vite 前端骨架。
- Three.js 负责 3D 渲染。
- 第一周优先本地开发服务器，不要求生产部署。

## 3) 核心流程

1. 用户打开 Viewer 页面。
2. Viewer 加载默认样例 manifest 或用户指定 manifest。
3. 根据 manifest 找到 mesh 文件。
4. Three.js 加载 mesh 并展示。
5. 用户通过鼠标旋转、缩放、平移查看人体模型。

## 4) Failure Modes

- manifest 不存在：页面显示可读错误。
- mesh 路径不存在：页面显示错误并保留默认样例入口。
- mesh 格式不支持：提示支持格式。
- 后端未启动：允许先用静态样例演示。

## 5) 测试策略与 DoD

- 本地启动命令写入 Runbook。
- 页面能显示一个人体或占位 mesh。
- 旋转、缩放、平移可用。
- 不要求真实皮肤、衣物、纹理、PBR 材质。

## References

- PRD：`documents/01-requirements/01-prd.md`
- HLD：`documents/02-design/01-hld-smpl-service.md`
- Tracker：`documents/99-project-planning.md`
