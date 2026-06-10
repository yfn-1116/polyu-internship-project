import { useState, useCallback } from 'react'
import { useDigitalHumanStore } from '../../store/useDigitalHumanStore'
import IconButton from '../ui/IconButton'

export default function VoiceControl() {
  const [inputText, setInputText] = useState('')
  const isRecording = useDigitalHumanStore((s) => s.isRecording)
  const isThinking = useDigitalHumanStore((s) => s.isThinking)
  const setRecording = useDigitalHumanStore((s) => s.setRecording)

  const handleSubmit = useCallback(() => {
    const text = inputText.trim()
    if (!text) return
    setInputText('')
    // Dispatch via window event so App.tsx handles the flow
    window.dispatchEvent(new CustomEvent('digital-human:question', { detail: { text } }))
  }, [inputText])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  const handleRecordToggle = useCallback(() => {
    // Toggle mock recording state
    setRecording(!isRecording)
    if (!isRecording) {
      // Start mock recording — after 2s submit a voice question
      setTimeout(() => {
        setRecording(false)
        window.dispatchEvent(new CustomEvent('digital-human:question', {
          detail: { text: '我最近早上起床总是头晕，应该挂什么科？', mode: 'voice' },
        }))
      }, 2000)
    }
  }, [isRecording, setRecording])

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white/40">
      {/* Record button */}
      <IconButton
        icon={isRecording ? '⏹' : '🎤'}
        variant="record"
        size="lg"
        active={isRecording}
        onClick={handleRecordToggle}
        label={isRecording ? '停止' : ''}
      />

      {/* Text input */}
      <div className="flex-1 relative">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? '正在聆听...' : isThinking ? 'AI 思考中...' : '输入您的健康问题...'}
          disabled={isRecording || isThinking}
          className="w-full h-10 px-4 rounded-full bg-white/70 backdrop-blur border border-[#E0ECF8] text-sm text-[#102A43] placeholder:text-[#BCCCDC] outline-none focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/15 transition-all disabled:opacity-50"
        />
      </div>

      {/* Send button */}
      <IconButton
        icon="➤"
        variant="primary"
        size="md"
        onClick={handleSubmit}
        disabled={!inputText.trim() || isThinking}
      />
    </div>
  )
}
