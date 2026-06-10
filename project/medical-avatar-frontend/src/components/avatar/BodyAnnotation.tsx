/**
 * BodyAnnotation — 3D 空间中显示身体部位标注标签
 *
 * 使用 Html from drei 在 3D 坐标上渲染 HTML <div>
 * 选中部位上方浮出半透明标注气泡
 */

import { Html } from '@react-three/drei'
import type { BodyPartKey } from '../medical/BodyPartSelector'

const PART_LABELS: Record<BodyPartKey, { label: string; pos: [number, number, number] }> = {
  head:      { label: '头部 / 脑', pos: [0, 1.62, 0.15] },
  torso:     { label: '躯干 / 脏器', pos: [0, 1.02, 0.3] },
  leftArm:   { label: '左臂 / 肩肘', pos: [-0.42, 0.85, 0.1] },
  rightArm:  { label: '右臂 / 肩肘', pos: [0.42, 0.85, 0.1] },
  leftLeg:   { label: '左腿 / 膝踝', pos: [-0.12, -0.05, 0.15] },
  rightLeg:  { label: '右腿 / 膝踝', pos: [0.12, -0.05, 0.15] },
}

interface Props {
  part: BodyPartKey | null
}

export default function BodyAnnotation({ part }: Props) {
  if (!part) return null

  const info = PART_LABELS[part]
  if (!info) return null

  return (
    <Html position={info.pos} center distanceFactor={8} occlude>
      <div
        className="pointer-events-none select-none rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap"
        style={{
          background: 'rgba(0, 188, 212, 0.18)',
          border: '1px solid rgba(0, 188, 212, 0.45)',
          color: '#00e5ff',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 0 16px rgba(0, 188, 212, 0.25)',
          animation: 'fadeUp 0.3s ease-out',
        }}
      >
        {info.label}
        {/* 脉冲指示点 */}
        <span
          className="ml-2 inline-block h-1.5 w-1.5 rounded-full animate-pulse"
          style={{ background: '#00e5ff', boxShadow: '0 0 6px #00e5ff' }}
        />
      </div>
    </Html>
  )
}
