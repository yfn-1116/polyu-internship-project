/**
 * 对话 / 聊天类型定义
 */

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  text: string
  timestamp: number
}

export interface ChatRequest {
  message: string
  mode: 'text' | 'voice'
  patientId?: string
}

export interface ChatResponse {
  answer: string
  subtitle: string
  avatarState: string
  riskLevel: 'low' | 'medium' | 'high'
  suggestedDepartments: string[]
  knowledgeSources: string[]
}

/** 建议科室 */
export interface Department {
  name: string
  confidence: number
}

/** 风险等级 */
export type RiskLevel = 'low' | 'medium' | 'high'
