import type { AvatarState } from '../../types/digitalHuman'

const quickQuestions = [
  '我头晕应该挂什么科？',
  '体检前需要注意什么？',
  '糖尿病患者要注意什么？',
  '演示肩颈康复动作',
]

const promptByState: Partial<Record<AvatarState, string>> = {
  idle: '点击开始提问',
  listening: '正在聆听...',
  thinking: 'AI 正在思考...',
  speaking: '数字人正在回答...',
  rehab: '康复演示中...',
}

interface VoiceDockProps {
  state: AvatarState
  inputText: string
  isRecording: boolean
  isProcessing: boolean
  showInput: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
  onInputChange: (value: string) => void
  onSubmit: () => void
  onRecordToggle: () => void
  onShowInput: () => void
  onQuestion: (text: string) => void
}

export default function VoiceDock({
  state,
  inputText,
  isRecording,
  isProcessing,
  showInput,
  inputRef,
  onInputChange,
  onSubmit,
  onRecordToggle,
  onShowInput,
  onQuestion,
}: VoiceDockProps) {
  const dockStateText = promptByState[state] || '点击开始提问'
  const micClass = state === 'speaking'
    ? 'bg-[#00B8A9] hover:bg-[#009f93]'
    : isRecording
      ? 'bg-[#EF4444] record-btn-active scale-105'
      : 'bg-[#1E88E5] hover:bg-[#1976D2]'

  return (
    <div className="rounded-[24px] border border-[#CFE3F5] bg-white/88 p-4 shadow-2xl shadow-[#1E88E5]/12 backdrop-blur-xl">
      <div className="mb-3 flex flex-wrap justify-center gap-2">
        {quickQuestions.map((q) => (
          <button
            key={q}
            onClick={() => onQuestion(q)}
            disabled={isProcessing}
            className="rounded-full border border-[#D9EAF7] bg-white px-4 py-2 text-sm font-semibold text-[#243B53] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#1E88E5]/50 hover:text-[#1E88E5] disabled:translate-y-0 disabled:opacity-35"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onRecordToggle}
          disabled={isProcessing && !isRecording}
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl text-white shadow-lg transition-all hover:scale-105 disabled:opacity-45 ${micClass}`}
          aria-label="语音输入"
        >
          {isRecording ? '⏹' : '🎤'}
        </button>

        <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${showInput ? 'w-[430px] opacity-100' : 'w-0 opacity-0'}`}>
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                onSubmit()
              }
            }}
            placeholder="输入健康问题..."
            disabled={isProcessing}
            className="h-12 flex-1 rounded-full border border-[#CFE3F5] bg-white px-5 text-base font-semibold text-[#102A43] shadow-sm outline-none transition-all placeholder:text-[#829AB1] focus:border-[#1E88E5]"
          />
          <button
            onClick={onSubmit}
            disabled={!inputText.trim() || isProcessing}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1E88E5] text-lg font-bold text-white transition-all hover:bg-[#1976D2] disabled:opacity-35"
          >
            ➤
          </button>
        </div>

        {!showInput && (
          <button
            onClick={onShowInput}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#CFE3F5] bg-white text-lg text-[#243B53] shadow-sm transition-all hover:border-[#1E88E5]/50 hover:text-[#1E88E5]"
            aria-label="文字输入"
          >
            💬
          </button>
        )}

        <span className="hidden min-w-[112px] text-sm font-semibold text-[#627D98] md:inline">
          {dockStateText}
        </span>
      </div>
    </div>
  )
}
