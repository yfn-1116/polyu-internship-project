# LLD M4：前端 3D Viewer MVP

## 0) 模块职责与边界

3D Viewer 负责把后端生成的 mesh 或样例模型展示给用户，让第一周成果可以被直观看到。它不负责模型拟合、体态诊断或商业级真实渲染。

## 1) MVP 功能

- 加载 `.obj`、`.ply` 或 `.glb` 中的一种可视化格式。
- 支持旋转、缩放、平移。
- 显示任务状态、model_type、manifest 路径和输出文件路径。
- 提供默认样例模型，避免后端真实模型未就绪时前端无法演示。
- Viewer v2 增加五个样例模式：THuman Scan、SMPL-X Default、SMPL-X Slim、SMPL-X Broad、SMPL-X Tall。
- SMPL-X 样例是 beta preset 生成的演示模型，不是 THuman scan fitting 结果。
- 加载 mesh 后自动居中和缩放模型。

### 1.1) MoCap 动画播放功能

- 加载 MoCap 动画序列（vertices.bin + faces.obj + animation_meta.json）。
- AnimationPlayer 逐帧更新 BufferGeometry 的 position attribute。
- 播放控制：play/pause toggle、进度条 seek、播放速度（0.5x / 1x / 2x）。
- 情绪切换按钮组：左侧面板新增 MoCap 情绪选择（Happy、Angry、Sad 等）。
- 按需加载：切换情绪时才加载对应 vertices.bin，不预加载全部情绪。
- 使用 TypedArray 直接操作 BufferGeometry，避免逐帧重新创建 geometry。

### 1.2) 动画数据加载格式

```text
public/sample-mocap-<emotion>/
├── faces.obj              # 面片定义（OBJ 格式，只含 f 行）
├── vertices.bin           # float32 二进制，每帧 10475×3×4 bytes
├── animation_meta.json    # {fps, frame_count, emotion, duration}
└── manifest.json
```

## 2) 推荐技术

- React 或 Vite 前端骨架。
- Three.js 负责 3D 渲染。
- 第一周优先本地开发服务器，不要求生产部署。

## 3) 核心流程

1. 用户打开 Viewer 页面。
2. Viewer 默认加载 THuman Scan manifest。
3. 根据 manifest 找到 mesh 文件。
4. Three.js 加载 mesh 并展示。
5. 用户通过鼠标旋转、缩放、平移查看人体模型。
6. 用户可切换 THuman Scan 和多组 SMPL-X preset 样例。
7. 用户可切换 MoCap 情绪动画，使用播放控制查看动画序列。

## 4) Failure Modes

- manifest 不存在：页面显示可读错误。
- mesh 路径不存在：页面显示错误并保留默认样例入口。
- mesh 格式不支持：提示支持格式。
- 后端未启动：允许先用静态样例演示。

## 5) 测试策略与 DoD

- 本地启动命令写入 Runbook。
- 页面能显示一个人体或占位 mesh。
- 页面能切换 THuman Scan、SMPL-X Default、SMPL-X Slim、SMPL-X Broad、SMPL-X Tall。
- 旋转、缩放、平移可用。
- 不要求真实皮肤、衣物、纹理、PBR 材质。

## References

- PRD：`documents/01-requirements/01-prd.md`
- HLD：`documents/02-design/01-hld-smpl-service.md`
- Tracker：`documents/99-project-planning.md`
