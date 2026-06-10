import GlassCard from '../ui/GlassCard'

interface AnswerCardProps {
  answer: string
}

export default function AnswerCard({ answer }: AnswerCardProps) {
  const lines = answer
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8)

  return (
    <GlassCard highlight>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#1E88E5]">
        AI 医疗建议
      </h3>
      <div className="max-h-[360px] space-y-2.5 overflow-y-auto pr-1 text-base leading-7 custom-scrollbar">
        {lines.map((line, i) => {
          if (line.startsWith('**') && line.endsWith('**')) {
            return (
              <p key={i} className="mt-2 text-lg font-bold text-[#102A43]">
                {line.replace(/\*\*/g, '')}
              </p>
            )
          }
          return (
            <p key={i} className="rounded-xl bg-[#F7FBFF] px-4 py-3 font-semibold text-[#243B53]">
              {line.replace(/^[-•]\s*/, '')}
            </p>
          )
        })}
      </div>
    </GlassCard>
  )
}
