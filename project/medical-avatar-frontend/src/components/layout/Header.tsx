import StatusBadge from '../ui/StatusBadge'
import type { AvatarState } from '../../types/digitalHuman'

interface HeaderProps {
  avatarState: AvatarState
}

export default function Header({ avatarState }: HeaderProps) {
  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white/60 backdrop-blur-md border-b border-[#E0ECF8] shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E88E5] to-[#00B8A9] flex items-center justify-center text-white font-bold text-sm">
          +
        </div>
        <h1 className="text-base font-semibold text-[#102A43] tracking-wide">
          智慧医疗数字人交互系统
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge state={avatarState} />
        <span className="text-xs text-[#627D98] bg-[#F0F7FF] px-2 py-1 rounded-full">
          AI 医疗助手 · Demo
        </span>
      </div>
    </header>
  )
}
