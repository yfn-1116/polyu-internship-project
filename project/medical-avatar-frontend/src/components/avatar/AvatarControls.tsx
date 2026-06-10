/** AvatarControls — 程序化动画（无骨骼动画时的 fallback） */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import type { AvatarState } from '../../types/digitalHuman'
import { type BodyPartRefs } from './FallbackMedicalAvatar'

interface Props {
  state: AvatarState
  bodyRefs: BodyPartRefs
}

export default function AvatarControls({ state, bodyRefs }: Props) {
  const time = useRef(0)
  const { head, rightArm, mouth } = bodyRefs

  useFrame((_, delta) => {
    time.current += delta
    if (!head.current && !rightArm.current) return

    switch (state) {
      case 'idle': {
        head.current && (head.current.position.y = 1.35 + Math.sin(time.current * 2.5) * 0.03)
        head.current && (head.current.rotation.z = Math.sin(time.current * 1.2) * 0.01)
        mouth.current && (mouth.current.scale.y = 1)
        break
      }
      case 'listening': {
        head.current && (head.current.rotation.x = Math.sin(time.current * 2.4) * 0.02 + 0.08)
        mouth.current && (mouth.current.scale.y = 1)
        break
      }
      case 'thinking': {
        head.current && (head.current.rotation.x = Math.sin(time.current * 1.5) * 0.06)
        mouth.current && (mouth.current.scale.y = 0.7)
        break
      }
      case 'speaking':
      case 'talking': {
        head.current && (head.current.rotation.x = Math.sin(time.current * 2.2) * 0.04)
        head.current && (head.current.rotation.y = Math.sin(time.current * 1.7) * 0.05)
        if (rightArm.current) {
          rightArm.current.rotation.z = Math.sin(time.current * 1.5) * 0.15 + 0.2
        }
        if (mouth.current) {
          mouth.current.scale.y = 1 + Math.max(0, Math.sin(time.current * 10)) * 1.5
          mouth.current.scale.x = 1 + Math.max(0, Math.sin(time.current * 7)) * 0.08
        }
        break
      }
      case 'gesture':
      case 'guiding': {
        if (rightArm.current) {
          rightArm.current.rotation.z = 0.8 + Math.sin(time.current * 2) * 0.12
        }
        head.current && (head.current.rotation.y = 0.2)
        mouth.current && (mouth.current.scale.y = 1)
        break
      }
      case 'walking':
      case 'rehab': {
        head.current && (head.current.position.y = 1.35 + Math.sin(time.current * 1.5) * 0.02)
        break
      }
      case 'warning': {
        head.current && (head.current.rotation.z = Math.sin(time.current * 5) * 0.03)
        break
      }
    }
  })

  return null
}
