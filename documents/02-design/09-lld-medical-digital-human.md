# LLD M9：医疗数字人 3D 交互系统

## 1) 模块目标

构建一个"医疗数字人交互舱"前端 + AI 对话后端，将 SMPL-X 3D 人体建模能力与 LLM 医疗对话能力结合，提供自然语言驱动的 3D 数字人健康咨询服务。

## 2) 系统架构

```
┌─────────────────────────────────────────────────────┐
│                  用户浏览器                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ 3D 数字人 │  │ 医疗面板  │  │ 语音/文字输入     │  │
│  │ (R3F)    │  │ (Glass)  │  │ (Web Speech API) │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/WS
┌──────────────────────┴──────────────────────────────┐
│                  后端服务 (WSL2)                      │
│  Port 8000: SMPL-X API (已有)                        │
│  Port 8001: AI Chat API (新建)                       │
│    ├── llm_client   → 千问 DashScope (云端)          │
│    ├── rag_service  → ChromaDB (本地)                │
│    ├── chat_session → 对话上下文管理                  │
│    └── patient_store → 患者档案                      │
└─────────────────────────────────────────────────────┘
```

## 3) 前端技术栈

| 技术 | 用途 |
|---|---|
| React 18+ | UI 框架 |
| Vite 6 | 构建工具 |
| TypeScript | 类型安全 |
| Tailwind CSS 4 | 样式（医疗蓝白玻璃拟态） |
| @react-three/fiber | React Three.js 集成 |
| @react-three/drei | Three.js 工具集 |
| Zustand | 全局状态管理 |

## 4) 前端组件结构

```
src/
├── types/digitalHuman.ts          # AvatarState 等类型
├── store/useDigitalHumanStore.ts  # Zustand 全局状态
├── data/mockMedicalResponses.ts   # Mock 问答数据（4 组）
├── services/digitalHumanApi.ts    # API 封装（mock/真实切换）
└── components/
    ├── layout/   (AppShell, Header, MainLayout)
    ├── avatar/   (Stage, Model, Lights, Controls, Fallback)
    ├── medical/  (Panel + 6 卡片)
    ├── voice/    (VoiceControl, SubtitleBar, QuickQuestions)
    └── ui/       (GlassCard, StatusBadge, IconButton)
```

## 5) AvatarState 动画状态机

```
idle ──→ listening ──→ thinking ──→ speaking ──→ idle
  │                       │              │
  └───────────────────────┴──────────────┘
          guiding / warning / rehab
```

| 状态 | 动画 | 相机 |
|---|---|---|
| idle | 身体 Y 轴 ±0.03 浮动，2.5s 周期 | 半身 (0, 1.4, 3.2) |
| listening | 身体前倾 8°，麦克风发光脉冲 | 半身 |
| thinking | 头部 nodding ±0.08 | 半身 |
| speaking | 头部 multi-axis + 右手微抬 | 半身 |
| guiding | 右臂外展 45° 指向 | 半身 |
| warning | 身体轻微 shake | 半身 |
| rehab | 全身站立，无动画 | 全身 (0, 1.2, 4.5) |

## 6) Mock 对话流程

```
点击快捷问题/输入文字
  → store.setAvatarState("listening")
  → delay 800ms
  → store.setAvatarState("thinking")
  → sendMessage() → getMockResponse()
  → delay 1200ms
  → store.setAvatarState(response.avatarState)
  → 字幕逐字显示 (每 40ms 2 字)
  → 更新医疗卡片
  → delay 1500ms
  → store.setAvatarState("idle")
```

## 7) MedicalResponse 数据契约

```typescript
interface MedicalResponse {
  answer: string              // 完整回答（Markdown）
  subtitle: string            // 字幕文本
  avatarState: AvatarState    // 数字人状态
  gesture?: string            // 手势标签
  riskLevel: 'low' | 'medium' | 'high'
  suggestedDepartments: string[]
  knowledgeSources: string[]
  cards: { title: string; content: string }[]
  audioUrl?: string           // TTS 音频（预留）
  animation?: string          // 动画名称（预留）
}
```

## 8) 后端 API 设计

### POST /api/chat

```json
// Request
{ "message": "我头晕应该挂什么科？", "mode": "text" }

// Response (MedicalResponse)
{
  "answer": "根据您的描述...",
  "subtitle": "建议先到全科或神经内科...",
  "avatarState": "speaking",
  "gesture": "explain",
  "riskLevel": "medium",
  "suggestedDepartments": ["全科", "神经内科"],
  "knowledgeSources": ["医院导诊知识库"],
  "cards": [{"title": "建议科室", "content": "全科/神经内科"}]
}
```

## 9) RAG 设计

### Pipeline

```
医学文档 → text-embedding-v3 → ChromaDB (本地)
用户提问 → 语义检索 Top-5 → LLM 重排序 → 注入 System Prompt → 千问生成
```

### 知识库分类

| 类别 | 内容 | 预估量 |
|---|---|---|
| 疾病知识 | 常见病症状/诊断/治疗 | ~50 篇 |
| 科室导诊 | 症状→科室映射 | ~200 条 |
| 药品知识 | 说明书/相互作用 | ~100 种 |
| 体检指标 | 正常值/异常解读 | ~80 项 |
| 康复动作 | 步骤 + SMPL-X 参数 | ~20 组 |
| 老年医学 | CGA/Beers/跌倒预防 | ~10 篇 |

## 10) 全息投影接口预留

### 后端

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/hologram/stream` | WebSocket | 30fps 实时顶点推流 |
| `/api/hologram/export` | POST | 导出 glTF/GLB/USD |
| `/api/hologram/multiview/{n}` | GET | N 视角离线渲染 |
| `/api/hologram/config` | GET | 设备能力查询 |

### 前端

```typescript
class HologramOutput {
  exportGLB(scene: Scene): Promise<ArrayBuffer>
  connectStream(wsUrl: string): void
  renderMultiview(n: number): HTMLCanvasElement[]
  getDeviceConfig(): Promise<HologramConfig>
}
```

MVP 阶段只做接口定义，不实现具体硬件对接。

## 11) 网络部署

- WSL2 mirrored 网络模式，局域网 IP: `192.168.1.91`
- Vite dev server: `host: 0.0.0.0`, port: 5173
- 前端 API 通过 `VITE_API_BASE` 环境变量切换 mock/真实后端
- 3D 渲染在访问者浏览器（WebGL），服务器 GPU 只跑后端推理

## 12) 文件清单

| 文件 | 操作 | 说明 |
|---|---|---|
| `project/medical-avatar-frontend/` | 新建 | 完整 React 项目 |
| `project/backend/.../chat_api.py` | 待建 | AI 对话 API |
| `project/backend/.../llm_client.py` | 待建 | 千问 API 封装 |
| `project/backend/.../rag_service.py` | 待建 | RAG 检索 |
| `project/backend/.../hologram_api.py` | 待建 | 全息接口 |
