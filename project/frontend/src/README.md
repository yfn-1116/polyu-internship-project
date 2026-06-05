# Frontend src 目录说明

本目录放 Three.js Viewer 源码。

## 当前文件

| 文件 | 作用 |
| --- | --- |
| `main.js` | Three.js 场景、相机、控制器、OBJ 加载和样例切换 |
| `style.css` | 页面布局、左侧面板、按钮和 viewer 样式 |

## 规则

- 前端只读取 `public/` 下的 manifest/OBJ。
- 不直接读取 `models/` 或 `data/datasets/`。
- 新展示模式要同步 `scripts/verify-samples.mjs` 和 Runbook。
