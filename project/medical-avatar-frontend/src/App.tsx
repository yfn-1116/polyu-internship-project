/**
 * AI 医疗数字人交互展示系统 — 主应用
 *
 * 布局：左侧面板 | 中央 3D 舞台 | 右侧面板
 *       ─────────── 底部输入栏 ───────────
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { useDigitalHumanStore } from './store/useDigitalHumanStore'
import { useAvatarState } from './hooks/useAvatarState'
import { useChatMock } from './hooks/useChatMock'
import type { AvatarAction } from './types/avatar'
import AvatarStatusBadge from './components/status/AvatarStatusBadge'
import PatientInfoPanel from './components/medical/PatientInfoPanel'
import MetricsPanel from './components/medical/MetricsPanel'
import ChatPanel from './components/chat/ChatPanel'
import AnimationControls from './components/avatar/AnimationControls'
import AvatarStage from './components/avatar/AvatarStage'
import { QUICK_QUESTIONS } from './data/mockMedicalData'

export default function App() {
  const { avatarState, stateLabel, applyAction } = useAvatarState()
  const { handleSend } = useChatMock()

  const [inputText, setInputText] = useState('')
  const [isRecording, setRecording] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const onSubmit = useCallback(() => {
    if (!inputText.trim()) return
    handleSend(inputText)
    setInputText('')
  }, [inputText, handleSend])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onSubmit()
      }
    },
    [onSubmit],
  )

  const onQuickQuestion = useCallback(
    (q: string) => handleSend(q),
    [handleSend],
  )

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      setRecording(false)
      return
    }
    setRecording(true)
    setTimeout(() => {
      setRecording(false)
      handleSend('我最近早上起床总是头晕，应该挂什么科？')
    }, 2000)
  }, [isRecording, handleSend])

  const onAction = useCallback(
    (action: AvatarAction) => applyAction(action),
    [applyAction],
  )

  // 映射 avatarState 到 AvatarStage 能识别的值
  const stageState = mapToStageState(avatarState)

  return (
    <div className="dark-gradient h-screen w-screen overflow-hidden p-4 text-[#e8edf2]">
      {/* ═══ 顶部标题栏 ═══ */}
      <header className="flex h-[56px] items-center justify-between rounded-2xl border border-[#00bcd4]/15 bg-[#111928]/70 px-6 backdrop-blur-xl mb-3">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#00bcd4]">AI Health Terminal</p>
            <h1 className="text-lg font-bold text-[#e8edf2] tracking-wide">
              AI 医疗数字人交互展示系统
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#00c897]/10 px-3 py-1 text-[11px] font-bold text-[#00c897] border border-[#00c897]/20">
            Demo v2
          </span>
          <AvatarStatusBadge state={stageState} />
        </div>
      </header>

      {/* ═══ 主内容区 ═══ */}
      <div className="flex gap-3" style={{ height: 'calc(100vh - 140px)' }}>
        {/* ── 左侧面板 ── */}
        <aside className="w-[260px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
          <PatientInfoPanel />
          <MetricsPanel />

          {/* 快捷问题 */}
          <div className="glass-card">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#00bcd4]">Quick Ask</p>
            <div className="flex flex-col gap-1.5">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => onQuickQuestion(q)}
                  className="text-left text-xs text-[#8899aa] hover:text-[#00bcd4] hover:bg-[#00bcd4]/5 rounded-lg px-2.5 py-1.5 transition-colors duration-150 border border-transparent hover:border-[#00bcd4]/15"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* 模型加载状态 */}
          <ModelStatusCard />
        </aside>

        {/* ── 中央 3D 舞台 ── */}
        <main className="flex-1 min-w-0 rounded-2xl border border-[#00bcd4]/15 bg-[#0d1520]/60 backdrop-blur-xl relative overflow-hidden stage-glow">
          {/* 舞台标签 */}
          <div className="pointer-events-none absolute top-4 left-6 z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00bcd4]/60">3D Digital Human</p>
            <p className="mt-0.5 text-xs text-[#5a6a7a]">SMPL-X / GLB 数字人实时渲染</p>
          </div>

          {/* 状态标签 — 居中上方 */}
          <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <AvatarStatusBadge state={stageState} />
          </div>

          {/* 3D 画布 */}
          <div className="absolute inset-0 avatar-stage-bg">
            <AvatarStage state={stageState} modelMode="doctor" compact={false} />
          </div>

          {/* 底部字幕叠加 */}
          {stageState !== 'idle' && (
            <div className="pointer-events-none absolute bottom-20 left-1/2 -translate-x-1/2 z-10 subtitle-bar rounded-full px-6 py-2 subtitle-enter">
              <p className="text-sm font-medium text-[#e8edf2]">
                {stageState === 'listening' && '🎤 正在聆听您的问题...'}
                {stageState === 'thinking' && '💭 正在分析中...'}
                {stageState === 'talking' && '🗣 正在回答...'}
                {stageState === 'speaking' && '🗣 正在回答...'}
                {stageState === 'gesture' && '👋 动作展示中...'}
                {stageState === 'walking' && '🚶 行走演示中...'}
              </p>
            </div>
          )}
        </main>

        {/* ── 右侧面板 ── */}
        <aside className="w-[320px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
          <ChatPanel />
          <AnimationControls currentState={avatarState} onAction={onAction} />
        </aside>
      </div>

      {/* ═══ 底部输入栏 ═══ */}
      <footer className="mt-3 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 glass-card !py-1.5 !px-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="输入您的健康问题，例如：我头晕应该挂什么科？"
            className="chat-input flex-1"
          />
          <button
            onClick={onSubmit}
            disabled={!inputText.trim()}
            className="rounded-xl bg-[#00bcd4] px-5 py-2 text-sm font-bold text-[#0a0e17] hover:bg-[#00d4ee] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_0_16px_rgba(0,188,212,0.3)]"
          >
            发送
          </button>
        </div>

        {/* 语音按钮 */}
        <button
          onClick={toggleRecording}
          className={`flex items-center justify-center w-12 h-12 rounded-2xl border transition-all duration-300 ${
            isRecording
              ? 'bg-[#ff5252]/20 border-[#ff5252]/40 record-btn-active'
              : 'bg-[#111928]/70 border-[#00bcd4]/15 hover:border-[#00bcd4]/40'
          }`}
          title={isRecording ? '录音中，点击停止' : '语音输入'}
        >
          <span className="text-xl">{isRecording ? '⏹' : '🎤'}</span>
        </button>
      </footer>
    </div>
  )
}

/** 映射新 AvatarState → 旧 AvatarStage 兼容值 */
function mapToStageState(state: string): any {
  const map: Record<string, string> = {
    idle: 'idle',
    listening: 'listening',
    thinking: 'thinking',
    talking: 'speaking',
    speaking: 'speaking',
    gesture: 'guiding',
    walking: 'rehab',
  }
  return map[state] ?? 'idle'
}

/** 模型加载状态卡片 */
function ModelStatusCard() {
  const [modelExists, setModelExists] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/models/avatar.glb', { method: 'HEAD' })
      .then((r) => { if (!cancelled) setModelExists(r.ok) })
      .catch(() => { if (!cancelled) setModelExists(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="glass-card">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#00bcd4]">Model</p>
      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            modelExists === null
              ? 'bg-[#f5a623]'
              : modelExists
                ? 'bg-[#00c897]'
                : 'bg-[#ff5252]'
          }`}
          style={{
            boxShadow:
              modelExists === null
                ? '0 0 6px #f5a623'
                : modelExists
                  ? '0 0 6px #00c897'
                  : '0 0 6px #ff5252',
          }}
        />
        <span className="text-xs text-[#8899aa]">
          {modelExists === null
            ? '检测中...'
            : modelExists
              ? 'avatar.glb 已加载'
              : 'Fallback 几何体模式'}
        </span>
      </div>
      <p className="mt-2 text-[10px] text-[#5a6a7a] leading-relaxed">
        {modelExists === false
          ? '将 GLB 模型放入 public/models/avatar.glb 即可自动加载。当前使用程序化几何数字人。'
          : '将 GLB/glTF 数字人模型放入 public/models/ 目录即可自动替换。'}
      </p>
    </div>
  )
}
