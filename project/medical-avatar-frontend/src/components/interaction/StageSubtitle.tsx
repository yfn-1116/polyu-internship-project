import type { AvatarState } from '../../types/digitalHuman'

const statusText: Partial<Record<AvatarState, string>> = {
  listening: '正在聆听您的问题...',
  thinking: 'AI 正在结合患者档案与知识库分析...',
  speaking: '数字人正在回答',
  rehab: '康复动作演示模式',
}

interface StageSubtitleProps {
  state: AvatarState
  subtitle: string
}

export default function StageSubtitle({ state, subtitle }: StageSubtitleProps) {
  const text = statusText[state] || subtitle || '您好，我是您的 AI 医疗助手，请问有什么可以帮您？'

  return (
    <div className="mx-auto w-full max-w-[680px] rounded-2xl border border-[#CFE3F5] bg-white/92 px-6 py-3 shadow-xl shadow-[#1E88E5]/10 backdrop-blur-md">
      <p className="line-clamp-3 text-center text-lg font-bold leading-8 text-[#102A43]">
        {text}
      </p>
    </div>
  )
}
