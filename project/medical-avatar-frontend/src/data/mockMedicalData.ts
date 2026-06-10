/**
 * Mock 医疗数据 — Demo 展示用
 * 后续接真实后端 API 替换
 */

import type { ChatMessage } from '../types/chat'

/** 患者/用户信息 */
export interface PatientInfo {
  name: string
  age: number
  gender: string
  status: string          // 当前状态
  riskLevel: string
}

/** 体征数据 */
export interface VitalSigns {
  heartRate: number       // bpm
  bloodOxygen: number     // %
  temperature: number     // ℃
  bloodPressure: string   // mmHg
  respiratoryRate: number // 次/分钟
}

export const mockPatient: PatientInfo = {
  name: '演示用户',
  age: 32,
  gender: '男',
  status: '稳定',
  riskLevel: '低风险',
}

export const mockVitalSigns: VitalSigns = {
  heartRate: 76,
  bloodOxygen: 98,
  temperature: 36.6,
  bloodPressure: '120/80',
  respiratoryRate: 16,
}

/** 模拟 AI 回复 */
export const MOCK_AI_RESPONSE =
  '我已收到您的问题。当前系统处于 Demo 演示模式，后续接入医疗知识库和 AI 大模型后，将为您提供详细的健康建议。如果您的 SMPL-X 模型已生成 GLB，您可以拖放到 models 目录进行展示。'

/** 快捷问题 */
export const QUICK_QUESTIONS: string[] = [
  '我头晕应该挂什么科？',
  '体检前需要注意什么？',
  '演示肩颈康复动作',
  '查看我的健康报告',
]

/** 初始欢迎消息 */
export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    text: '您好，我是您的 AI 医疗数字人助手。您可以向我提问健康问题，或点击右侧按钮切换数字人动作。当前为 Demo 演示模式。',
    timestamp: Date.now(),
  },
]
