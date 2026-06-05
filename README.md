# SMPL Body Modeling Service

本仓库是一个面向医疗体态系统的 SMPL/SMPL-X 人体建模服务 MVP。目标是在本地跑通可复现、可交接的最小闭环：

```text
sample input -> backend pipeline -> mesh/manifest output -> 3D viewer
```

当前项目重点不是从零训练人体模型，而是把输入适配、模型 backend、输出 contract 和前端展示拆成可替换模块，后续可以接入公开人体数据集、SMPL/SMPL-X 模型能力和医院 3D 扫描仪输出。

## 当前能力

- 后端 mock pipeline：从 mock 输入生成 `manifest.json` 和 `.obj`。
- 后端 dataset OBJ pipeline：支持 THuman sample OBJ passthrough。
- 模型模块：检查 SMPL/SMPL-X 本地环境，导出默认或 preset SMPL-X mesh。
- 前端 Viewer：基于 Vite + vanilla Three.js，支持加载 THuman sample 和多组 SMPL-X preset 样例。
- 工程文档：包含 PRD、HLD/LLD、Runbook、Journal、Tracker 和风险记录。

## 目录结构

| 路径 | 作用 |
| --- | --- |
| `project/backend/` | 后端 pipeline、输入适配器、模型接口、输出 manifest/OBJ |
| `project/model/` | SMPL/SMPL-X 模型能力、环境检查、mesh 导出 |
| `project/frontend/` | Three.js 3D Viewer |
| `documents/` | 需求、设计、运行手册、日志、计划和知识库 |
| `data/` | 本地样本和数据集目录说明；真实数据集不提交 Git |
| `models/` | 本地 SMPL/SMPL-X 模型权重目录说明；模型权重不提交 Git |
| `outputs/` | 本地生成结果；不提交 Git |

## 快速运行

### 后端 mock pipeline

```bash
cd /home/yfn/polyu-internship-project
PYTHONPATH=project/backend/src python -m smpl_service run \
  --source-type mock \
  --input-path data/samples/mock/sample_001.json \
  --model-type mock \
  --output-dir outputs
```

成功后会生成：

- `outputs/job_sample_001/manifest.json`
- `outputs/job_sample_001/body.obj`

### 模型环境检查

```bash
cd /home/yfn/polyu-internship-project/project/model
PYTHONPATH=src python -m smpl_model check-env --project-root /home/yfn/polyu-internship-project
```

模型文件应放在仓库根目录的本地 ignored 路径：

- `models/smpl/`
- `models/smplx/`

### 前端 3D Viewer

```bash
cd /home/yfn/polyu-internship-project/project/frontend
npm install
npm run prepare:samples
npm run dev
```

浏览器打开 Vite 输出的本地地址后，可以切换查看 THuman Scan 和多组 SMPL-X preset mesh。

## 验证命令

```bash
cd /home/yfn/polyu-internship-project/project/backend
python -m pytest -v
```

```bash
cd /home/yfn/polyu-internship-project/project/model
python -m pytest -v
```

```bash
cd /home/yfn/polyu-internship-project/project/frontend
npm test
npm run build
```

## 文档入口

- 项目计划和 Tracker：`documents/99-project-planning.md`
- 最近进展：`documents/97-journal.md`
- PRD：`documents/01-requirements/01-prd.md`
- 设计文档：`documents/02-design/README.md`
- 运行手册：`documents/98-runbook/README.md`
- 风险记录：`documents/04-challenges/01-technical-risks.md`

## 数据和模型提交规则

以下内容只保存在本地，不提交 Git：

- 真实数据集和公开数据集下载内容。
- SMPL/SMPL-X 模型权重。
- 生成的 mesh、manifest、截图和其他输出结果。

仓库只提交代码、轻量样例、目录说明和工程文档。
