# SMPL 论文笔记

## 资料

SMPL: A Skinned Multi-Person Linear Model。

## 对本项目有用的结论

- SMPL 是参数化人体模型：输入体型参数和姿态参数，输出标准拓扑人体 mesh。
- SMPL 论文训练模型所需的数据和流程不适合一周内复现。
- 本项目应使用已有 SMPL/SMPL-X 模型和开源实现，重点做工程封装。

## 影响的设计

- `ModelBackend` 必须可替换。
- 第一周验收不要求训练模型。
- 模型文件路径必须配置化，不能写死或提交模型权重。

## 关联文档

- `documents/02-design/04-lld-model-m2-smpl-backend.md`
- `documents/03-faq/README.md`
