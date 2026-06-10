/**
 * HighlightPulse — 高亮选中身体部位时脉冲发光
 *
 * 在 useFrame 中动态调整高亮材质的 emissiveIntensity 实现呼吸脉冲效果
 */

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { HIGHLIGHT_MAT } from './FallbackMedicalAvatar'

interface Props {
  active: boolean
}

export default function HighlightPulse({ active }: Props) {
  const timeRef = useRef(0)
  const baseIntensity = 1.2
  const pulseRange = 0.5

  useFrame((_, delta) => {
    if (!active) {
      // 重置
      HIGHLIGHT_MAT.emissiveIntensity = baseIntensity
      HIGHLIGHT_MAT.opacity = 0.7
      return
    }

    timeRef.current += delta
    // 呼吸脉冲：sin 波在 [base-pulseRange, base+pulseRange]
    const pulse = Math.sin(timeRef.current * 3.0) * pulseRange
    HIGHLIGHT_MAT.emissiveIntensity = baseIntensity + pulse
    HIGHLIGHT_MAT.opacity = 0.55 + Math.abs(Math.sin(timeRef.current * 3.0)) * 0.35
  })

  return null
}
