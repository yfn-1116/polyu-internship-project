# LLD M10：医疗数字人前端

## 0) 模块职责与边界

`project/medical-avatar-frontend` 是 React 医疗数字人交互舱。它只负责浏览器端 UI、3D 渲染、交互状态和后端 API 消费。

它不负责生成 SMPL-X 模型、不直接调用千问、不管理 RAG 入库。

## 1) 源码分层

| 路径 | 职责 |
| --- | --- |
| `components/workspace/` | 三栏工作台和页面组合 |
| `components/avatar/` | R3F 舞台、医生数字人、SMPL-X 展示边界 |
| `components/medical/` | AI 医疗信息卡片 |
| `components/interaction/` | 字幕条、快捷问题、语音/文字 Dock |
| `store/` | Zustand 状态 |
| `services/` | `VITE_API_BASE` mock/真实 API 切换 |
| `types/` | `AvatarState`、`MedicalResponse` 契约 |

## 2) 页面组合

桌面端使用三栏结构：

```text
左侧 280px：患者档案 / 体征 / 健康背景
中间 flex：3D 医疗数字人主舞台 / 字幕 / 交互 Dock
右侧 400px：当前问题 / AI 回答 / 科室 / 风险 / 来源 / 免责声明
```

`App.tsx` 只保留问答流程和状态调度。布局由 `DigitalHumanWorkspace`、`MainStage`、`PatientDataPanel`、`MedicalPanel` 承担。

## 3) 3D 模型策略

主交互形象使用医生数字人 fallback，负责 idle/listening/thinking/speaking 等状态动画。

SMPL-X OBJ/时序动作模型作为体态建模结果展示，不强行作为说话医生。后续高质量交互数字人应接入带骨骼动画的 GLB/VRM。

## 4) 交互流程

```text
快捷问题/文字/语音入口
-> listening
-> thinking
-> sendMessage
-> speaking / rehab
-> 字幕条显示当前播报内容
-> 右侧面板显示完整结构化回答
-> idle
```

## 5) API 契约

前端消费 `MedicalResponse`：

```typescript
answer: string
subtitle: string
avatarState: AvatarState
riskLevel: 'low' | 'medium' | 'high'
suggestedDepartments: string[]
knowledgeSources: string[]
cards: { title: string; content: string }[]
```

## 6) 失败模式

- 后端不可用：显示服务暂不可用，状态回到 `idle`。
- SMPL-X 资源缺失：模型组件回退到医生 fallback。
- 长回答：中间只显示字幕，完整内容放右侧面板滚动区。

## 7) 测试策略与 DoD

```bash
cd project/medical-avatar-frontend
npm run test:architecture
npm run build
```

验收：

- 三栏布局清晰。
- 右侧信息不拥挤。
- 中间长回答不遮挡人物。
- mock 问答和状态切换仍可用。
- 没有模型文件时 fallback 仍可显示。
