import GlassCard from '../ui/GlassCard'

interface DepartmentCardProps {
  departments: string[]
}

export default function DepartmentCard({ departments }: DepartmentCardProps) {
  return (
    <GlassCard>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#00B8A9]">
        建议科室
      </h3>
      <div className="flex flex-wrap gap-2">
        {departments.map((dept) => (
          <span
            key={dept}
            className="inline-block rounded-full bg-[#E8F8F5] px-3 py-1.5 text-sm font-bold text-[#00B8A9]"
          >
            {dept}
          </span>
        ))}
      </div>
    </GlassCard>
  )
}
