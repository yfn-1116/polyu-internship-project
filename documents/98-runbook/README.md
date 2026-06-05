# Runbook 目录说明

本目录只写“怎么操作”：安装、运行、测试、排错。不要在这里解释技术取舍，原因写 FAQ，设计写 HLD/LLD。

## 当前运行状态

后端 Python 骨架、mock pipeline 和前端 3D Viewer 已可运行。

## 本地环境检查

当前已验证：

```bash
python --version
python -m pytest --version
node --version
npm --version
```

已验证版本：

- Python 3.12.13
- pytest 9.0.3
- Node v24.15.0
- npm 11.12.1

## Backend Mock Pipeline

运行后端 mock pipeline：

```bash
cd /home/yfn/polyu-internship-project
PYTHONPATH=project/backend/src python -m smpl_service run \
  --source-type mock \
  --input-path data/samples/mock/sample_001.json \
  --model-type mock \
  --output-dir outputs
```

成功标志：

- 命令退出码为 0。
- 生成 `outputs/job_sample_001/manifest.json`。
- 生成 `outputs/job_sample_001/body.obj`。

## Backend 验证命令

运行后端测试：

```bash
cd /home/yfn/polyu-internship-project/project/backend
python -m pytest -v
```

当前通过情况：

- `7 passed`

## Frontend 3D Viewer

安装依赖：

```bash
cd /home/yfn/polyu-internship-project/project/frontend
npm install
```

如果网络较慢，可以使用镜像：

```bash
npm install --registry=https://registry.npmmirror.com
```

启动开发服务器：

```bash
npm run dev
```

成功标志：

- 终端输出 `Local: http://localhost:5173/` 或类似地址。
- 浏览器打开该地址后显示 `SMPL Viewer`。
- 页面加载 `public/sample/body.obj`，鼠标可旋转、缩放、平移。
- 当前默认加载 `public/sample-human/body.obj`，这是低多边形人体 proxy，不是 SMPL 真实模型。

构建验证：

```bash
npm run build
```

当前通过情况：

- Vite build 通过。

### 常见问题：缺少 `@vitejs/plugin-react`

如果看到：

```text
Cannot find module '@vitejs/plugin-react'
```

说明前端目录里存在 React 版 Vite 配置，但当前 MVP 使用 vanilla Three.js，不需要 React。当前仓库已移除未使用的 `vite.config.ts`、`tsconfig.json` 和 React/R3F 示例文件；正常执行 `npm run build` 即可。

## 文档格式检查

```bash
cd /home/yfn/polyu-internship-project
git diff --check
```

## Frontend Sample 验证

```bash
cd /home/yfn/polyu-internship-project/project/frontend
npm test
```

当前通过情况：

- `sample-human verified: 48 vertices, 72 faces`

## Model Module 环境检查

运行模型环境检查：

```bash
cd /home/yfn/polyu-internship-project/project/model
PYTHONPATH=src python -m smpl_model check-env --project-root /home/yfn/polyu-internship-project
```

当前检查结果：

- `torch`: present
- `smplx`: missing
- `trimesh`: missing
- `models/smpl`: missing
- `models/smplx`: missing

模型文件应放在：

```text
/home/yfn/polyu-internship-project/models/smpl/
/home/yfn/polyu-internship-project/models/smplx/
```

`models/` 已加入 `.gitignore`，不要提交模型权重。

运行模型模块测试：

```bash
cd /home/yfn/polyu-internship-project/project/model
python -m pytest -v
```

## 当前排错入口

- 数据拿不到：看 `documents/04-challenges/01-technical-risks.md`。
- 不知道为什么用 mock：看 `documents/03-faq/README.md`。
- 不知道下一步做什么：看 `documents/99-project-planning.md`。
