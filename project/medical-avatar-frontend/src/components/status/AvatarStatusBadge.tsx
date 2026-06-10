/**
 * AvatarStatusBadge — 数字人状态标签
 * 不同状态显示不同颜色和动画（暗色科技风）
 */

import type { AvatarState } from '../../types/avatar'

/** 兼容旧类型 */
type CompatState = AvatarState | 'speaking' | 'guiding' | 'warning' | 'rehab'

const STATE_CONFIG: Record<string, { label: string; color: string; glow: string }> = {
  idle:      { label: '待机中',   color: '#00bcd4', glow: 'rgba(0,188,212,0.4)' },
  listening: { label: '正在聆听', color: '#00c897', glow: 'rgba(0,200,151,0.4)' },
  thinking:  { label: '思考中',   color: '#f5a623', glow: 'rgba(245,166,35,0.4)' },
  talking:   { label: '正在回答', color: '#4399ff', glow: 'rgba(67,153,255,0.4)' },
  speaking:  { label: '正在回答', color: '#4399ff', glow: 'rgba(67,153,255,0.4)' },
  gesture:   { label: '动作展示', color: '#a78bfa', glow: 'rgba(167,139,250,0.4)' },
  walking:   { label: '行走中',   color: '#f472b6', glow: 'rgba(244,114,182,0.4)' },
  guiding:   { label: '正在指引', color: '#a78bfa', glow: 'rgba(167,139,250,0.4)' },
  warning:   { label: '风险提示', color: '#ff5252', glow: 'rgba(255,82,82,0.4)' },
  rehab:     { label: '康复演示', color: '#a78bfa', glow: 'rgba(167,139,250,0.4)' },
}

interface Props {
  state: CompatState
  className?: string
}

export default function AvatarStatusBadge({ state, className = '' }: Props) {
  const config = STATE_CONFIG[state] ?? STATE_CONFIG.idle
  const isPulsing = ['listening', 'thinking', 'talking', 'speaking'].includes(state)

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wider ${className}`}
      style={{
        background: `rgba(17,25,40,0.85)`,
        border: `1px solid ${config.glow}`,
        boxShadow: `0 0 12px ${config.glow}`,
        color: config.color,
      }}
    >
      <span
        className={`inline-block h-2 w-2 rounded-full ${isPulsing ? 'animate-pulse' : ''}`}
        style={{ background: config.color, boxShadow: `0 0 6px ${config.color}` }}
      />
      {config.label}
    </span>
  )
}
