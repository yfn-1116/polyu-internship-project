/**
 * BodyPartSelector — 身体部位选择面板
 *
 * 点击按钮高亮 3D 模型对应部位，
 * 展开该部位的关联健康数据。
 */

import { useState } from 'react'

export type BodyPartKey = 'head' | 'torso' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg'

interface BodyPartInfo {
  key: BodyPartKey
  label: string
  icon: string
  organs: string
  relatedMetrics: string[]
}

const BODY_PARTS: BodyPartInfo[] = [
  {
    key: 'head', label: '头部', icon: '🧠',
    organs: '脑、眼、耳、鼻、口腔',
    relatedMetrics: ['血压', 'MMSE 26/30', '颈动脉斑块'],
  },
  {
    key: 'torso', label: '躯干', icon: '🫁',
    organs: '心脏、肺、肝、胃、肾',
    relatedMetrics: ['心率 78bpm', '血氧 98%', 'eGFR 72', 'HbA1c 7.2%'],
  },
  {
    key: 'leftArm', label: '左臂', icon: '💪',
    organs: '肩关节、肘关节、腕关节',
    relatedMetrics: ['血压 148/92', '握力 ? kg'],
  },
  {
    key: 'rightArm', label: '右臂', icon: '💪',
    organs: '肩关节、肘关节、腕关节',
    relatedMetrics: ['血压 148/92', '握力 ? kg'],
  },
  {
    key: 'leftLeg', label: '左腿', icon: '🦵',
    organs: '髋关节、膝关节、踝关节',
    relatedMetrics: ['骨密度 T=-2.1', 'VAS 4-5分', 'Tinetti 22/28'],
  },
  {
    key: 'rightLeg', label: '右腿', icon: '🦵',
    organs: '髋关节、膝关节、踝关节',
    relatedMetrics: ['骨密度 T=-2.1', 'VAS 4-5分'],
  },
]

interface Props {
  selectedPart: BodyPartKey | null
  onSelect: (part: BodyPartKey | null) => void
}

export default function BodyPartSelector({ selectedPart, onSelect }: Props) {
  const [expandedPart, setExpandedPart] = useState<BodyPartKey | null>(null)

  return (
    <div className="glass-card">
      <div className="mb-3 flex items-center gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#00bcd4]">Anatomy</p>
        <span className="text-[11px] text-[#5a6a7a]">身体标注</span>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {BODY_PARTS.map((part) => {
          const isSelected = selectedPart === part.key
          const isExpanded = expandedPart === part.key

          return (
            <div key={part.key}>
              <button
                onClick={() => {
                  if (isSelected) {
                    onSelect(null)
                    setExpandedPart(null)
                  } else {
                    onSelect(part.key)
                    setExpandedPart(part.key)
                  }
                }}
                className={`w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#00bcd4]/15 border border-[#00bcd4]/40 text-[#00bcd4] shadow-[0_0_12px_rgba(0,188,212,0.2)]'
                    : 'bg-[#111928]/70 border border-[#1e2d45] text-[#8899aa] hover:border-[#00bcd4]/30 hover:text-[#bcc8d4]'
                }`}
              >
                <span className="text-base">{part.icon}</span>
                <span>{part.label}</span>
                {isSelected && (
                  <span className="ml-auto inline-block h-1.5 w-1.5 rounded-full bg-[#00bcd4] shadow-[0_0_6px_#00bcd4] animate-pulse" />
                )}
              </button>

              {/* 展开的指标详情 */}
              {isExpanded && isSelected && (
                <div className="mt-1.5 rounded-xl border border-[#00bcd4]/20 bg-[#0d1520]/80 p-3 animate-[fadeUp_0.2s_ease-out]">
                  <p className="text-[10px] font-bold text-[#00bcd4] mb-1.5 uppercase tracking-wider">
                    关联结构
                  </p>
                  <p className="text-xs text-[#8899aa]">{part.organs}</p>
                  <p className="text-[10px] font-bold text-[#f5a623] mt-2 mb-1 uppercase tracking-wider">
                    当前指标
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {part.relatedMetrics.map((m) => (
                      <span key={m} className="rounded-md bg-[#f5a623]/10 px-2 py-0.5 text-[10px] text-[#f5a623] border border-[#f5a623]/15">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
