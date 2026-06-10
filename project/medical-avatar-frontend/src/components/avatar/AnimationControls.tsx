/**
 * AnimationControls — 数字人动作控制面板
 *
 * 按钮：待机 | 挥手 | 讲解 | 思考 | 行走
 * 点击后通过 useAvatarState.applyAction() 切换数字人状态
 */

import type { AvatarAction } from '../../types/avatar'

const ACTIONS: { action: AvatarAction; label: string; icon: string; targetState: string }[] = [
  { action: 'idle',    label: '待机', icon: '⊙', targetState: 'idle' },
  { action: 'wave',    label: '挥手', icon: '👋', targetState: 'gesture' },
  { action: 'explain', label: '讲解', icon: '✋', targetState: 'gesture' },
  { action: 'think',   label: '思考', icon: '💭', targetState: 'thinking' },
  { action: 'walk',    label: '行走', icon: '🚶', targetState: 'walking' },
]

interface Props {
  currentState: string
  onAction: (action: AvatarAction) => void
}

export default function AnimationControls({ currentState, onAction }: Props) {
  return (
    <div className="glass-card">
      <div className="mb-3 flex items-center gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#a78bfa]">Motion</p>
        <span className="text-[11px] text-[#5a6a7a]">动作控制</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map(({ action, label, icon, targetState }) => {
          const isActive = currentState === targetState
          return (
            <button
              key={action}
              onClick={() => onAction(action)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-[#a78bfa]/15 border border-[#a78bfa]/40 text-[#a78bfa] shadow-[0_0_12px_rgba(167,139,250,0.15)]'
                  : 'bg-[#111928]/70 border border-[#1e2d45] text-[#8899aa] hover:border-[#a78bfa]/30 hover:text-[#a78bfa]'
              }`}
            >
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
