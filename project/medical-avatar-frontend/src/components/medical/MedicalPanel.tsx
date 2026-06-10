import { useDigitalHumanStore } from '../../store/useDigitalHumanStore'
import QuestionCard from './QuestionCard'
import AnswerCard from './AnswerCard'
import DepartmentCard from './DepartmentCard'
import RiskCard from './RiskCard'
import SourceCard from './SourceCard'
import SafetyNotice from './SafetyNotice'

export default function MedicalPanel() {
  const currentQuestion = useDigitalHumanStore((s) => s.currentQuestion)
  const currentAnswer = useDigitalHumanStore((s) => s.currentAnswer)
  const riskLevel = useDigitalHumanStore((s) => s.riskLevel)
  const suggestedDepartments = useDigitalHumanStore((s) => s.suggestedDepartments)
  const knowledgeSources = useDigitalHumanStore((s) => s.knowledgeSources)
  const cards = useDigitalHumanStore((s) => s.cards)

  return (
    <aside className="min-h-0 rounded-[24px] border border-[#CFE3F5] bg-white/72 p-4 shadow-xl shadow-[#1E88E5]/8 backdrop-blur-xl max-[1180px]:hidden">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#00B8A9]">AI Medical Panel</p>
          <h2 className="mt-1 text-lg font-bold text-[#102A43]">医疗建议</h2>
        </div>
        <span className="rounded-full bg-[#E8F8F5] px-3 py-1 text-xs font-bold text-[#00B8A9]">在线</span>
      </div>

      <div className="flex h-[calc(100%-56px)] flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
        {currentQuestion ? <QuestionCard question={currentQuestion} /> : <QuestionCard question="等待用户提问" />}
        {currentAnswer ? <AnswerCard answer={currentAnswer} /> : (
          <div className="glass-card p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#1E88E5]">AI 医疗建议</h3>
            <p className="text-base font-semibold leading-7 text-[#627D98]">
              提问后，这里会展示结构化回答、建议科室、风险提示和知识来源。
            </p>
          </div>
        )}

        {cards.map((card, i) => (
          <div key={i} className="glass-card p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#1E88E5]">
              {card.title}
            </h3>
            <p className="whitespace-pre-line text-base font-semibold leading-7 text-[#243B53]">
              {card.content}
            </p>
          </div>
        ))}

        {suggestedDepartments.length > 0 && !cards.some(c => c.title === '建议科室') && (
          <DepartmentCard departments={suggestedDepartments} />
        )}

        {riskLevel && <RiskCard level={riskLevel} />}

        {knowledgeSources.length > 0 ? <SourceCard sources={knowledgeSources} /> : (
          <SourceCard sources={['AI 医疗助手知识库', '医院导诊知识库', '常见疾病科普库']} />
        )}

        <SafetyNotice />
      </div>
    </aside>
  )
}
