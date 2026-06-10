# Tasks Checklist（最终状态）

## Round 1：项目搭建确认 ✅
- [x] 检查现有依赖完整性
- [x] 基础目录结构确认
- [x] npm install 通过
- [x] 基础设施文件创建（types/services/data/styles）

## Round 2：核心功能实现 ✅
- [x] 3D 舞台升级（暗色 + 发光边框 + 地面）
- [x] GLB 模型加载 + fallback 几何体
- [x] 左侧面板（标题 + 患者信息 + 体征指标）
- [x] 右侧面板（聊天记录 + 动作控制）
- [x] 底部栏（输入框 + 语音按钮）
- [x] 对话 mock 流程（listening → thinking → talking → idle）
- [x] 动作按钮切换状态
- [x] App.tsx Dashboard 布局重写

## Round 3：视觉优化 ✅
- [x] 暗色主题完善（深蓝/黑/青配色）
- [x] 发光边框动画（stage-glow）
- [x] 卡片 hover 效果
- [x] 状态标签动画（pulse-dot）
- [x] 舞台灯光和阴影（AvatarLights 重写）

## Round 4：接口预留和文档 ✅
- [x] services/ 接口封装（chatApi, avatarApi）
- [x] README.md 完整（运行/替换模型/SMPL-X/ASR/TTS/LipSync）
- [x] public/models/README.md（模型替换指南）
- [x] WebSocket 预留代码
- [x] Dockerfile + nginx.conf + docker-compose.yml
- [x] requirements.txt + requirements-dev.txt（项目根）

## Round 5：测试和修复 ✅
- [x] npm run build 通过（tsc + vite）
- [x] TypeScript 类型错误修复（5 处）
- [x] 无 GLB 模型不白屏验证
- [x] 最终自检
