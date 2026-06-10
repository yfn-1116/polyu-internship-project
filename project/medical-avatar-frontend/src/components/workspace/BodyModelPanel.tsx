import type { AvatarState } from '../../types/digitalHuman'
import type { MotionAction } from '../../data/motionActions'
import { motionActions } from '../../data/motionActions'

interface BodyModelPanelProps {
  state: AvatarState
  selectedAction: MotionAction
  playing: boolean
  speed: number
  rotationY: number
  frameInfo: { frame: number; total: number }
  onActionChange: (action: MotionAction) => void
  onPlayingChange: (playing: boolean) => void
  onSpeedChange: (speed: number) => void
  onRotationChange: (rotationY: number) => void
  onReplay: () => void
}

export default function BodyModelPanel({
  selectedAction,
  playing,
  speed,
  frameInfo,
  onActionChange,
  onPlayingChange,
  onSpeedChange,
  onRotationChange,
  onReplay,
}: BodyModelPanelProps) {
  return (
    <section className="absolute left-6 top-24 z-20 w-[380px] overflow-hidden rounded-2xl border border-[#CFE3F5] bg-white shadow-xl shadow-[#1E88E5]/10">
      <div className="px-4 py-3 bg-white/95 border-b border-[#E6F0FA]">
        <p className="text-xs font-bold text-[#1E88E5] tracking-wide uppercase">SMPL-X Patient Model</p>
        <p className="mt-1 text-sm font-semibold text-[#102A43]">动作库：{selectedAction.label} · {selectedAction.tone}</p>
      </div>
      <div className="rounded-xl bg-white/94 px-3 py-3 space-y-3">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#627D98]">动作选择</p>
          <div className="grid grid-cols-5 gap-1.5">
            {motionActions.map((action) => {
              const active = action.id === selectedAction.id
              return (
                <button
                  key={action.id}
                  onClick={() => onActionChange(action)}
                  className={[
                    'rounded-full px-2 py-1.5 text-[11px] font-bold transition',
                    active
                      ? 'bg-[#1E88E5] text-white shadow-sm shadow-[#1E88E5]/20'
                      : 'border border-[#D9EAF7] bg-[#F7FBFF] text-[#44617A] hover:-translate-y-0.5 hover:border-[#4FC3F7] hover:text-[#1E88E5]',
                  ].join(' ')}
                  title={`${action.label}：${action.tone}`}
                >
                  {action.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => onPlayingChange(!playing)}
            className="rounded-full bg-[#1E88E5] px-3 py-1.5 text-xs font-bold text-white shadow-sm"
          >
            {playing ? '暂停' : '播放动作'}
          </button>
          <button
            onClick={onReplay}
            className="rounded-full border border-[#CFE3F5] bg-white px-3 py-1.5 text-xs font-bold text-[#1E88E5]"
          >
            重播
          </button>
          <select
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="rounded-full border border-[#CFE3F5] bg-white px-2 py-1 text-xs font-bold text-[#102A43]"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
          </select>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => onRotationChange(0)}
            className="rounded-full bg-[#EAF7FF] px-2.5 py-1 text-[11px] font-bold text-[#1E88E5]"
          >
            正面
          </button>
          <button
            onClick={() => onRotationChange(-Math.PI / 2)}
            className="rounded-full bg-[#F5FAFF] px-2.5 py-1 text-[11px] font-bold text-[#627D98]"
          >
            左侧
          </button>
          <button
            onClick={() => onRotationChange(Math.PI / 2)}
            className="rounded-full bg-[#F5FAFF] px-2.5 py-1 text-[11px] font-bold text-[#627D98]"
          >
            右侧
          </button>
          <button
            onClick={() => onRotationChange(Math.PI)}
            className="rounded-full bg-[#F5FAFF] px-2.5 py-1 text-[11px] font-bold text-[#627D98]"
          >
            背面
          </button>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EAF7FF]">
          <div
            className="h-full rounded-full bg-[#00B8A9]"
            style={{ width: `${frameInfo.total ? (frameInfo.frame / frameInfo.total) * 100 : 0}%` }}
          />
        </div>
        <p className="mt-1 text-[11px] font-semibold text-[#627D98]">
          Frame {frameInfo.frame} / {frameInfo.total || '-'}
        </p>
      </div>
    </section>
  )
}
