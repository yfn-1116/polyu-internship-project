# Frontend scripts 目录说明

本目录放前端本地准备和验证脚本。

## 当前文件

| 文件 | 作用 |
| --- | --- |
| `prepare-thuman-sample.mjs` | 将本地 THuman sample 复制到 ignored 的 `public/sample-thuman/` |
| `prepare-smplx-sample.mjs` | 将本地 SMPL-X preset 输出复制到 ignored 的 `public/sample-smplx-*` |
| `verify-samples.mjs` | 验证前端样例 manifest 和 OBJ 顶点/面数量 |

## 规则

- 脚本可以读取 ignored 的 `data/` 和 `outputs/`。
- 脚本生成的 public 样例不提交 Git。
- 新 viewer 样例必须加入 `verify-samples.mjs`。
