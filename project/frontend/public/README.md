# Frontend public 目录说明

本目录放 Vite 静态资源。可提交小型样例，真实数据或生成样例必须 ignored。

## 当前内容

| 路径 | 作用 | 是否提交 Git |
| --- | --- | --- |
| `sample/` | 早期静态 OBJ 样例 | 是 |
| `sample-human/` | 小型 proxy human 样例 | 是 |
| `sample-thuman/` | THuman sample 前端展示资源 | 否 |
| `sample-smplx-*` | SMPL-X preset 前端展示资源 | 否 |

## 规则

- 大 OBJ、纹理和生成资源不提交 Git。
- 需要展示真实数据时，通过 `npm run prepare:samples` 生成。
- manifest 中路径必须以 `/sample-name/...` 形式供 Vite 读取。
