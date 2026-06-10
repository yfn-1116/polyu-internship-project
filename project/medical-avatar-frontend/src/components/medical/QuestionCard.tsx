import GlassCard from '../ui/GlassCard'

interface QuestionCardProps {
  question: string
}

export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <GlassCard>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#1E88E5]">
        当前问题
      </h3>
      <p className="text-base font-bold leading-7 text-[#102A43]">
        {question}
      </p>
      <span className="mt-3 inline-flex rounded-full bg-[#EAF7FF] px-3 py-1 text-xs font-bold text-[#1E88E5]">
        已识别
      </span>
    </GlassCard>
  )
}
