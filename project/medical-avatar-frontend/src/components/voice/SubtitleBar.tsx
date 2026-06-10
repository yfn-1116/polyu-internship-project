import { useEffect, useState } from 'react'
import { useDigitalHumanStore } from '../../store/useDigitalHumanStore'

export default function SubtitleBar() {
  const subtitle = useDigitalHumanStore((s) => s.subtitle)
  const avatarState = useDigitalHumanStore((s) => s.avatarState)

  const stateLabels: Record<string, string> = {
    listening: '🎤 正在聆听您的问题...',
    thinking: '🤔 AI 正在分析中...',
  }

  return (
    <div className="subtitle-bar px-6 py-2.5 flex items-center justify-center min-h-[40px]">
      {stateLabels[avatarState] ? (
        <p className="text-sm text-[#627D98] animate-pulse">
          {stateLabels[avatarState]}
        </p>
      ) : (
        <p className="text-sm text-[#102A43] text-center max-w-[600px] truncate">
          {subtitle}
        </p>
      )}
    </div>
  )
}
