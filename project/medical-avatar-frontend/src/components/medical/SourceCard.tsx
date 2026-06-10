import GlassCard from '../ui/GlassCard'

interface SourceCardProps {
  sources: string[]
}

export default function SourceCard({ sources }: SourceCardProps) {
  return (
    <GlassCard>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#627D98]">
        知识来源
      </h3>
      <ul className="space-y-2">
        {sources.map((src) => (
          <li key={src} className="flex items-center gap-2 text-sm font-semibold text-[#627D98]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1E88E5]/60" />
            {src}
          </li>
        ))}
      </ul>
    </GlassCard>
  )
}
