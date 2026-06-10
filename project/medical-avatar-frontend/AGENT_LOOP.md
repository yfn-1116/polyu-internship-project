# Agent Loop — Phase 2: 虚拟病人讲解交互

## Round 2 / 5 — 相机自动聚焦

## 验收标准
1. ✅ npm run build 通过
2. 点击身体部位 → 相机平滑 zoom 到该部位
3. 取消选中 → 恢复全景
4. 3D 标注文字浮在部位旁
5. 高亮脉冲动画
6. TTS 语音播报 AI 回答
7. 讲解时自动高亮相关身体部位

## Agent 分工

| Agent | 职责 |
|-------|------|
| Agent 1 | CameraZoom — 相机聚焦逻辑 |
| Agent 2 | PulseHighlight — 脉冲高亮动画 |
| Agent 3 | Annotation3D — 3D 标注标签 |
| Agent 4 | TTS Voice — 浏览器语音合成 |
| Agent 5 | BodyTour — 讲解联动部位高亮 |
| Agent 6 | Tester — 每步 build 验证 |
