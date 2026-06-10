interface QuickQuestionsProps {
  onSelect: (question: string) => void
  disabled?: boolean
}

const questions = [
  '我头晕应该挂什么科？',
  '体检前需要注意什么？',
  '糖尿病患者日常要注意什么？',
  '帮我演示一个肩颈康复动作',
]

export default function QuickQuestions({ onSelect, disabled = false }: QuickQuestionsProps) {
  return (
    <div className="flex gap-2 px-4 pb-3 flex-wrap">
      {questions.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          disabled={disabled}
          className="text-xs px-3 py-1.5 rounded-full bg-white/70 border border-[#E0ECF8] text-[#486581] hover:bg-[#F0F7FF] hover:border-[#1E88E5]/30 hover:text-[#1E88E5] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {q}
        </button>
      ))}
    </div>
  )
}
