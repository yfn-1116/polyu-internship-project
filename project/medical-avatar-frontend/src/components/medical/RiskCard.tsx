import type { RiskLevel } from '../../types/digitalHuman'
import GlassCard from '../ui/GlassCard'

interface RiskCardProps {
  level: RiskLevel
}

const riskConfig: Record<RiskLevel, { label: string; color: string; bg: string; text: string }> = {
  low: {
    label: '低风险',
    color: '#10B981',
    bg: '#ECFDF5',
    text: '当前情况风险较低，可按建议进行日常管理。如有变化请及时就医。',
  },
  medium: {
    label: '中等风险',
    color: '#F59E0B',
    bg: '#FFFBEB',
    text: '建议近期就诊，进一步明确诊断。请关注症状变化，如加重请及时就医。',
  },
  high: {
    label: '高风险',
    color: '#EF4444',
    bg: '#FEF2F2',
    text: '需要尽快就医！如有紧急情况（剧烈疼痛、意识障碍、呼吸困难等），请立即拨打120。',
  },
}

export default function RiskCard({ level }: RiskCardProps) {
  const config = riskConfig[level]

  return (
    <GlassCard>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: config.color }}>
        风险提示
      </h3>
      <div
        className="rounded-xl px-3 py-2 text-sm font-bold"
        style={{ backgroundColor: config.bg, color: config.color }}
      >
        {config.label}
      </div>
      <p className="mt-3 text-sm font-medium leading-relaxed text-[#627D98]">
        {config.text}
      </p>
    </GlassCard>
  )
}
