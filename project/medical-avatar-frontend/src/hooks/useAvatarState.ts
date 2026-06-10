/**
 * useAvatarState — 数字人状态管理 Hook
 *
 * 状态流转：
 *   idle → listening → thinking → talking → idle
 *                   ↘ gesture / walking
 */

import { useCallback } from 'react'
import { useDigitalHumanStore } from '../store/useDigitalHumanStore'
import type { AvatarAction } from '../types/avatar'

const STATE_LABELS: Record<string, string> = {
  idle: '待机中',
  listening: '正在聆听...',
  thinking: '思考中...',
  talking: '正在回答',
  gesture: '动作展示',
  walking: '行走中',
}

export function useAvatarState() {
  const avatarState = useDigitalHumanStore((s) => s.avatarState)
  const setAvatarState = useDigitalHumanStore((s) => s.setAvatarState)

  const stateLabel = STATE_LABELS[avatarState] ?? '待机中'

  const toIdle = useCallback(() => setAvatarState('idle'), [setAvatarState])
  const toListening = useCallback(() => setAvatarState('listening'), [setAvatarState])
  const toThinking = useCallback(() => setAvatarState('thinking'), [setAvatarState])
  const toTalking = useCallback(() => setAvatarState('talking'), [setAvatarState])
  const toGesture = useCallback(() => setAvatarState('gesture'), [setAvatarState])
  const toWalking = useCallback(() => setAvatarState('walking'), [setAvatarState])

  /** 根据 AvatarAction 切换状态 */
  const applyAction = useCallback(
    (action: AvatarAction) => {
      switch (action) {
        case 'idle': return toIdle()
        case 'wave':
        case 'explain': return toGesture()
        case 'think': return toThinking()
        case 'walk': return toWalking()
        case 'talk': return toTalking()
      }
    },
    [toIdle, toGesture, toThinking, toWalking, toTalking],
  )

  return {
    avatarState,
    stateLabel,
    setAvatarState,
    toIdle,
    toListening,
    toThinking,
    toTalking,
    toGesture,
    toWalking,
    applyAction,
  } as const
}
