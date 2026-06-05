# Runbook 目录说明

本目录只写“怎么操作”：安装、运行、测试、排错。不要在这里解释技术取舍，原因写 FAQ，设计写 HLD/LLD。

## 当前运行状态

后端 Python 骨架、mock pipeline、THuman sample dataset-obj pipeline、前端 3D Viewer、模型环境检查和默认 SMPL-X mesh 导出已可运行。下一步是把模型模块输出接入后端 pipeline。

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

## Backend THuman Sample Pipeline

运行 THuman sample OBJ passthrough pipeline：

```bash
cd /home/yfn/polyu-internship-project
PYTHONPATH=project/backend/src python -m smpl_service run \
  --source-type dataset-obj \
  --input-path data/datasets/raw/thuman2/THuman2.0-Dataset/data_sample/0525/0525.obj \
  --model-type passthrough \
  --output-dir outputs
```

成功标志：

- 命令退出码为 0。
- 生成 `outputs/job_0525/manifest.json`。
- 生成 `outputs/job_0525/body.obj`。
- 同目录复制 `material0.mtl` 和 `material0.jpeg`，方便 OBJ 材质检查。

## Backend 验证命令

运行后端测试：

```bash
cd /home/yfn/polyu-internship-project/project/backend
python -m pytest -v
```

当前通过情况：

- `9 passed`

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

准备 THuman sample 前端展示资源：

```bash
cd /home/yfn/polyu-internship-project/project/frontend
npm run prepare:thuman
```

该命令会把本地 ignored 的 THuman sample 复制到 `project/frontend/public/sample-thuman/`；该目录不提交 Git。

```bash
cd /home/yfn/polyu-internship-project/project/frontend
npm test
```

当前通过情况：

- `sample-thuman verified: 289106 vertices, 500000 faces`

## Model Module 环境检查

运行模型环境检查：

```bash
cd /home/yfn/polyu-internship-project/project/model
PYTHONPATH=src python -m smpl_model check-env --project-root /home/yfn/polyu-internship-project
```

当前检查结果：

- `torch`: present
- `smplx`: present
- `trimesh`: present
- `models/smpl`: present
- `models/smplx`: present

模型文件应放在：

```text
/home/yfn/polyu-internship-project/models/smpl/
/home/yfn/polyu-internship-project/models/smplx/
```

`models/` 已加入 `.gitignore`，不要提交模型权重。

当前 SMPL-X 文件：

- `models/smplx/SMPLX_FEMALE.npz`
- `models/smplx/SMPLX_MALE.npz`
- `models/smplx/SMPLX_NEUTRAL.npz`
- 同目录还保留对应 `.pkl` 文件和 `version.txt`

当前 SMPL v1.1.0 文件：

- `models/smpl/SMPL_python_v.1.1.0/smpl/models/basicmodel_f_lbs_10_207_0_v1.1.0.pkl`
- `models/smpl/SMPL_python_v.1.1.0/smpl/models/basicmodel_m_lbs_10_207_0_v1.1.0.pkl`
- `models/smpl/SMPL_python_v.1.1.0/smpl/models/basicmodel_neutral_lbs_10_207_0_v1.1.0.pkl`
- 同目录还保留官方 `smpl_webuser/` 示例代码；后续接 SMPL backend 时可参考，但当前主线仍优先 SMPL-X。

运行模型模块测试：

```bash
cd /home/yfn/polyu-internship-project/project/model
python -m pytest -v
```

当前通过情况：

- `4 passed`

## Model Module 导出默认 SMPL-X 人体

```bash
cd /home/yfn/polyu-internship-project/project/model
PYTHONPATH=src python -m smpl_model export-default-smplx \
  --project-root /home/yfn/polyu-internship-project \
  --output-dir /home/yfn/polyu-internship-project/outputs/smplx_default_neutral \
  --gender neutral
```

成功标志：

- 生成 `outputs/smplx_default_neutral/body.obj`
- 生成 `outputs/smplx_default_neutral/manifest.json`
- manifest 中 `vertices_count=10475`，`faces_count=20908`

## Dataset 获取准备

数据集统一放到本地目录，不提交 Git：

```bash
cd /home/yfn/polyu-internship-project
mkdir -p data/datasets/thuman2 data/datasets/faust data/datasets/agora
```

THuman2.0/2.1 需要先在官方 GitHub 阅读协议，邮件申请下载链接；拿到链接后再执行：

```bash
cd /home/yfn/polyu-internship-project
git clone https://github.com/ytrock/THuman2.0-Dataset.git \
  data/datasets/raw/thuman2/THuman2.0-Dataset
```

说明：

- 上面 clone 的是文档仓库，不是完整数据集。
- 本地样例 OBJ 在 `data/datasets/raw/thuman2/THuman2.0-Dataset/data_sample/0525/0525.obj`。
- 完整数据集仍需填写 agreement 并邮件申请下载链接。

拿到完整数据链接后再执行：

```bash
cd /home/yfn/polyu-internship-project
wget -O data/datasets/raw/thuman2/thuman2_download.zip "<THUMAN_DOWNLOAD_LINK>"
unzip data/datasets/raw/thuman2/thuman2_download.zip -d data/datasets/raw/thuman2/
```

FAUST 需要从官方入口注册/获取下载链接；拿到链接后执行：

```bash
cd /home/yfn/polyu-internship-project
wget -O data/datasets/raw/faust/faust.zip "<FAUST_DOWNLOAD_LINK>"
unzip data/datasets/raw/faust/faust.zip -d data/datasets/raw/faust/
```

AGORA 只能从官网登录后下载，官网说明下载链接只在网站内有效；拿到文件后放入：

```text
data/datasets/raw/agora/
```

## 当前排错入口

- 数据拿不到：看 `documents/04-challenges/01-technical-risks.md`。
- 不知道为什么用 mock：看 `documents/03-faq/README.md`。
- 不知道下一步做什么：看 `documents/99-project-planning.md`。
