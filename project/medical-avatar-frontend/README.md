# AI 医疗数字人交互展示系统

基于 React + Three.js + SMPL-X 的 3D 数字人前端 Demo，用于医疗/大健康场景的数字人交互展示。

## 快速启动

```bash
cd project/medical-avatar-frontend
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`（WSL2 用户可通过局域网 IP 访问）。

## 构建

```bash
npm run build    # TypeScript 类型检查 + Vite 构建
```

## 技术栈

| 技术 | 用途 |
|------|------|
| React 18 | UI 框架 |
| TypeScript | 类型安全 |
| Vite 6 | 构建工具 |
| Tailwind CSS 4 | 样式（暗色科技医疗风） |
| @react-three/fiber | React Three.js 集成 |
| @react-three/drei | 3D 工具集（OrbitControls, useGLTF, useAnimations 等） |
| Zustand | 全局状态管理 |

## 功能特性

### 已实现
- ✅ 3D 数字人展示（GLB 骨骼模型 + Fallback 几何体兜底，无模型不白屏）
- ✅ 暗色科技医疗风 UI（深蓝/黑/青配色，玻璃拟态卡片）
- ✅ OrbitControls（旋转/缩放/平移视角）
- ✅ 多灯光系统（环境光 + 主光 + 轮廓光 + 底部补光）
- ✅ 科技感舞台（圆形底座 + 网格地面 + 青色光晕）
- ✅ 数字人状态机（idle → listening → thinking → talking → idle）
- ✅ 程序化动画（呼吸浮动/前倾聆听/点头思考/说话手势/挥手指引）
- ✅ Mock AI 对话（快捷问题 + 文字输入 + 模拟回复）
- ✅ 动作控制面板（待机/挥手/讲解/思考/行走）
- ✅ 医疗数据面板（患者信息 + 体征指标）
- ✅ 对话记录面板
- ✅ 语音按钮预留（UI 到位，后续接 Web Speech API）
- ✅ 模型文件存在性检测

### API 预留
- `POST /api/chat` — AI 对话接口
- `GET /api/avatar/status` — 数字人状态查询
- `POST /api/avatar/action` — 动作控制
- `WebSocket /ws/avatar` — 实时状态/动画/姿态推送

## 切换到真实后端

```bash
export VITE_API_BASE=http://localhost:8001
export VITE_WS_URL=ws://localhost:8001/ws/avatar
npm run dev
```

不设置环境变量时自动使用 Mock 模式。

## 如何替换 3D 数字人模型

将 GLB/glTF 模型文件放入 `public/models/avatar.glb`，刷新页面即可自动加载。

详见 [`public/models/README.md`](public/models/README.md)

## 如何接入 Mixamo 动画

1. 在 [mixamo.com](https://www.mixamo.com/) 选择角色和动作
2. 下载 FBX（含骨骼 + 动画）
3. 在 Blender 中导入 FBX → 导出 GLB
4. 放入 `public/models/avatar.glb`
5. 前端通过 `useAnimations` 自动检测动画 clips 并播放

## 如何接入 SMPL-X 后端

### 静态模型（推荐先走通）

```python
# 后端 Python 示例 — 使用 trimesh 导出 GLB
import trimesh
mesh = trimesh.Trimesh(vertices=vertices, faces=faces)
mesh.export('avatar.glb')
```

### 实时动作驱动（WebSocket）

```
后端 SMPL-X 推理 → 逐帧姿态参数 → WebSocket → 前端更新骨骼/morph
```

消息格式见 `src/types/avatar.ts` → `SMPLXPoseMessage`

### SMPL-X 项目对接路径

本 Demo 对接的 SMPL-X 项目位于：`/home/yfn/polyu-internship-project/project/model/`

- 默认人体导出：`python -m smpl_model export-default-smplx`
- MoCap 动画导出：`python -m smpl_model export-mocap-smplx`

## 如何接入语音识别（ASR）

使用浏览器 Web Speech API，扩展位置：`src/hooks/useChatMock.ts`

## 如何接入 TTS（文字转语音）

使用 `SpeechSynthesisUtterance`，扩展位置：`src/hooks/useChatMock.ts`

## 如何接入口型同步（Viseme Lip Sync）

Web Audio API 分析音频 → 映射嘴部 morph target / 骨骼 → 扩展 `AvatarControls.tsx`

## 目录结构

```
src/
  main.tsx / App.tsx            # 入口 + 主 Dashboard 布局
  index.css                     # 暗色科技医疗风全局样式
  types/                        # avatar.ts, chat.ts, digitalHuman.ts
  data/mockMedicalData.ts       # Mock 医疗数据
  services/                     # avatarApi.ts, chatApi.ts, digitalHumanApi.ts
  hooks/                        # useAvatarState.ts, useChatMock.ts
  store/useDigitalHumanStore.ts # Zustand 状态
  components/
    avatar/   — AvatarStage, AvatarModel, AvatarLights, AvatarControls, FallbackMedicalAvatar, AnimationControls
    chat/     — ChatPanel
    medical/  — PatientInfoPanel, MetricsPanel, MedicalPanel (legacy)
    status/   — AvatarStatusBadge
public/models/README.md         # 模型替换指南
```

## 相关文档

- `documents/02-design/10-lld-medical-avatar-frontend.md`
- `documents/98-runbook/02-medical-avatar-frontend.md`
