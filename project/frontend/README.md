# Frontend Viewer 说明

本目录是 SMPL 人体建模服务的最小 3D Viewer。第一周目标是先能展示 `.obj` 模型和 manifest 信息，证明后端输出可以被用户直观看到。

## 当前能力

```text
sample-human manifest -> sample-human OBJ -> Three.js Viewer
```

当前 Viewer 使用 vanilla Three.js，不依赖 React、`@react-three/fiber` 或 `@vitejs/plugin-react`。

当前默认加载 `public/sample-human/body.obj`。这是低多边形人体 proxy mesh，只用于展示 Viewer 能力，不是 SMPL/SMPL-X 真实输出。

## 目录职责

```text
project/frontend/
├── package.json
├── index.html
├── public/sample/
└── src/
```

| 路径 | 作用 |
| --- | --- |
| `package.json` | npm 脚本和依赖 |
| `index.html` | 页面入口和信息面板容器 |
| `public/sample/manifest.json` | 静态样例 manifest |
| `public/sample/body.obj` | 静态样例 OBJ |
| `src/main.js` | Three.js 场景、相机、灯光、模型加载和交互 |
| `src/style.css` | 页面布局和视觉样式 |

## 运行

```bash
cd /home/yfn/polyu-internship-project/project/frontend
npm install
npm run dev
```

成功标志：

- 页面标题显示 `SMPL Viewer`。
- 右侧 3D 区域显示样例 mesh。
- 鼠标可以旋转、缩放、平移模型。

## 验证

```bash
npm run build
```

成功标志：

- Vite build 完成。
- 生成 `dist/index.html` 和静态资源。

验证 sample-human：

```bash
npm test
```

成功标志：

- 输出 `sample-human verified: 48 vertices, 72 faces`。

## 后续扩展

- 从后端 API 读取任务 manifest。
- 加载后端实际输出的 mesh。
- 增加体态测量 overlay。
- 增加产品级材质、光照、报告展示。
