/**
 * ChatPanel — 对话记录面板（暗色科技风）
 */

import { useDigitalHumanStore } from '../../store/useDigitalHumanStore'
import type { ChatMessage } from '../../types/chat'

export default function ChatPanel() {
  const history = useDigitalHumanStore((s) => s.conversationHistory)

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00bcd4]">AI Dialog</p>
          <h2 className="text-base font-bold text-[#e8edf2]">对话记录</h2>
        </div>
        <span className="rounded-full bg-[#00bcd4]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#00bcd4] border border-[#00bcd4]/20">
          {history.length} 条
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
        {history.length === 0 ? (
          <div className="glass-card p-4 text-center">
            <p className="text-sm text-[#5a6a7a]">还没有对话记录</p>
            <p className="mt-1 text-xs text-[#5a6a7a]">在底部输入问题开始对话</p>
          </div>
        ) : (
          history.map((turn) => (
            <ChatBubble key={turn.id} msg={turn as any} />
          ))
        )}
      </div>
    </div>
  )
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-[#00bcd4]/15 border border-[#00bcd4]/25 text-[#e8edf2]'
            : 'glass-card text-[#bcc8d4]'
        }`}
      >
        {!isUser && (
          <p className="mb-1 text-[11px] font-bold text-[#00bcd4]">AI 助手</p>
        )}
        <p className="whitespace-pre-line">{msg.text}</p>
        {!isUser && (
          <p className="mt-2 text-[10px] text-[#5a6a7a]">
            {new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
}
