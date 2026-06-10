import type { AvatarState } from '../../types/digitalHuman'

const stateConfig: Partial<Record<AvatarState, { label: string; color: string }>> = {
  idle: { label: '待机', color: '#1E88E5' },
  listening: { label: '正在聆听', color: '#10B981' },
  thinking: { label: '思考中', color: '#F59E0B' },
  speaking: { label: '正在回答', color: '#1E88E5' },
  talking: { label: '正在回答', color: '#4399ff' },
  guiding: { label: '正在指引', color: '#00B8A9' },
  warning: { label: '风险提示', color: '#EF4444' },
  rehab: { label: '康复演示', color: '#8B5CF6' },
  gesture: { label: '动作展示', color: '#a78bfa' },
  walking: { label: '行走中', color: '#f472b6' },
}

interface StatusBadgeProps {
  state: AvatarState
  className?: string
}

export default function StatusBadge({ state, className = '' }: StatusBadgeProps) {
  const config = stateConfig[state] ?? stateConfig.idle!
  return (
    <span className={`status-badge ${className}`}>
      <span className={`status-dot ${state}`} style={{ backgroundColor: config.color }} />
      <span style={{ color: '#102A43' }}>{config.label}</span>
    </span>
  )
}
