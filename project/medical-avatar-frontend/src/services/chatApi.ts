/**
 * Chat API 服务封装
 *
 * === 当前模式：Mock ===
 * 所有请求返回 mock 数据，Promise 模拟网络延迟。
 *
 * === 切换到真实后端 ===
 * 设置环境变量 VITE_API_BASE=http://localhost:8001
 * 后端需实现 POST /api/chat 接口，返回 ChatResponse 格式。
 *
 * === 接口约定 ===
 * Request:  { message: string, mode: 'text'|'voice', patientId?: string }
 * Response: { answer, subtitle, avatarState, riskLevel, suggestedDepartments, knowledgeSources }
 */

import type { ChatRequest, ChatResponse } from '../types/chat'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

/** 模拟网络延迟 */
function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** 发送对话消息 */
export async function sendChatMessage(req: ChatRequest): Promise<ChatResponse> {
  // ── Mock 模式 ──
  if (!API_BASE) {
    await delay(1200)
    return {
      answer:
        '我已收到您的问题：「' +
        req.message +
        '」。当前系统处于 Demo 演示模式，后续可接入医疗知识库、大语言模型和 SMPL-X 动作驱动，为您提供完整的数字人健康咨询服务。',
      subtitle: '收到，正在为您分析...',
      avatarState: 'talking',
      riskLevel: 'low',
      suggestedDepartments: ['内科', '全科门诊'],
      knowledgeSources: ['临床指南知识库', '常见病问答库'],
    }
  }

  // ── 真实 API 模式 ──
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(`Chat API error: ${res.status}`)
  return res.json()
}

/**
 * 获取数字人状态
 * GET /api/avatar/status → { state: AvatarState, currentAction?: AvatarAction }
 */
export async function getAvatarStatus(): Promise<{
  state: string
  currentAction?: string
}> {
  if (!API_BASE) {
    await delay(300)
    return { state: 'idle', currentAction: 'idle' }
  }
  const res = await fetch(`${API_BASE}/api/avatar/status`)
  if (!res.ok) throw new Error(`Avatar status error: ${res.status}`)
  return res.json()
}
