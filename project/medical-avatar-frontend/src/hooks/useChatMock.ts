/**
 * useChatMock — Mock 对话逻辑 Hook
 *
 * 模拟用户发送消息 → AI 回复的完整流程。
 * 后续替换 sendChatMessage() 的实现即可切换到真实后端。
 */

import { useCallback, useRef } from 'react'
import { useDigitalHumanStore } from '../store/useDigitalHumanStore'
import { sendChatMessage } from '../services/chatApi'
import type { ChatMessage } from '../types/chat'
import { MOCK_AI_RESPONSE } from '../data/mockMedicalData'

let msgCounter = 0

export function useChatMock() {
  const addConversationTurn = useDigitalHumanStore((s) => s.addConversationTurn)
  const setQuestion = useDigitalHumanStore((s) => s.setQuestion)
  const processingRef = useRef(false)

  /** 发送消息 → listening → thinking → talking → idle */
  const handleSend = useCallback(
    async (text: string) => {
      if (processingRef.current || !text.trim()) return
      processingRef.current = true

      // 用户消息
      msgCounter++
      const userMsg: ChatMessage = {
        id: `msg-${msgCounter}`,
        role: 'user',
        text: text.trim(),
        timestamp: Date.now(),
      }
      addConversationTurn(userMsg as any)
      setQuestion(text.trim())

      // → listening
      useDigitalHumanStore.getState().setAvatarState('listening')
      await delay(800)

      // → thinking
      useDigitalHumanStore.getState().setAvatarState('thinking')
      await delay(1000)

      // → talking (call mock API)
      useDigitalHumanStore.getState().setAvatarState('talking')
      try {
        const response = await sendChatMessage({ message: text, mode: 'text' })
        msgCounter++
        const aiMsg: ChatMessage = {
          id: `msg-${msgCounter}`,
          role: 'assistant',
          text: response.answer,
          timestamp: Date.now(),
        }
        addConversationTurn(aiMsg as any)
        useDigitalHumanStore.getState().setAnswer(response.answer)
      } catch {
        msgCounter++
        const errMsg: ChatMessage = {
          id: `msg-${msgCounter}`,
          role: 'assistant',
          text: MOCK_AI_RESPONSE,
          timestamp: Date.now(),
        }
        addConversationTurn(errMsg as any)
      }

      await delay(3000)

      // → idle
      useDigitalHumanStore.getState().setAvatarState('idle')
      processingRef.current = false
    },
    [addConversationTurn, setQuestion],
  )

  return { handleSend, isProcessing: processingRef }
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
