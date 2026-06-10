import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import type { AvatarState } from '../../types/digitalHuman'

interface AvatarControlsProps {
  state: AvatarState
  avatarRef: React.RefObject<Group | null>
  headRef: React.RefObject<Group | null>
  rightArmRef: React.RefObject<Group | null>
  mouthRef?: React.RefObject<Mesh | null>
}

export default function AvatarControls({ state, avatarRef, headRef, rightArmRef, mouthRef }: AvatarControlsProps) {
  const time = useRef(0)

  useFrame((_, delta) => {
    time.current += delta

    if (!avatarRef.current) return

    switch (state) {
      case 'idle': {
        // Gentle breathing float
        avatarRef.current.position.y = Math.sin(time.current * 2.5) * 0.03
        avatarRef.current.rotation.x = 0
        avatarRef.current.rotation.z = Math.sin(time.current * 1.2) * 0.01
        if (headRef.current) {
          headRef.current.rotation.x = Math.sin(time.current * 1.8) * 0.025
          headRef.current.rotation.y = Math.sin(time.current * 1.1) * 0.025
        }
        if (mouthRef?.current) mouthRef.current.scale.y = 1
        break
      }
      case 'listening': {
        // Lean forward slightly
        avatarRef.current.position.y = Math.sin(time.current * 2.5) * 0.02
        avatarRef.current.rotation.x = Math.sin(time.current * 2.4) * 0.025 + 0.055
        if (headRef.current) {
          headRef.current.rotation.x = 0.055
          headRef.current.rotation.y = Math.sin(time.current * 1.4) * 0.035
        }
        if (mouthRef?.current) mouthRef.current.scale.y = 1
        break
      }
      case 'thinking': {
        // Gentle nodding
        avatarRef.current.position.y = Math.sin(time.current * 2) * 0.02
        if (headRef.current) {
          headRef.current.rotation.x = Math.sin(time.current * 1.5) * 0.055
          headRef.current.rotation.y = -0.04
        }
        if (mouthRef?.current) mouthRef.current.scale.y = 0.85
        break
      }
      case 'speaking': {
        // Subtle head movement + right hand gesture
        avatarRef.current.position.y = Math.sin(time.current * 2.5) * 0.025
        if (headRef.current) {
          headRef.current.rotation.x = Math.sin(time.current * 2.2) * 0.05
          headRef.current.rotation.y = Math.sin(time.current * 1.7) * 0.06
          headRef.current.rotation.z = Math.sin(time.current * 2) * 0.03
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = Math.sin(time.current * 1.5) * 0.12 + 0.18
          rightArmRef.current.rotation.x = Math.sin(time.current * 1.8) * 0.05
        }
        if (mouthRef?.current) {
          mouthRef.current.scale.y = 1 + Math.max(0, Math.sin(time.current * 10)) * 1.35
          mouthRef.current.scale.x = 1 + Math.max(0, Math.sin(time.current * 7)) * 0.08
        }
        break
      }
      case 'guiding': {
        // Pointing gesture with right arm
        avatarRef.current.position.y = Math.sin(time.current * 2.5) * 0.02
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = 0.7 + Math.sin(time.current * 2) * 0.1
        }
        if (headRef.current) {
          headRef.current.rotation.y = 0.15
        }
        if (mouthRef?.current) mouthRef.current.scale.y = 1
        break
      }
      case 'warning': {
        // Slight shake
        avatarRef.current.position.y = Math.sin(time.current * 3) * 0.02
        avatarRef.current.rotation.z = Math.sin(time.current * 4) * 0.02
        break
      }
      case 'rehab': {
        // Stand straighter, arms at sides
        avatarRef.current.position.y = Math.sin(time.current * 1.5) * 0.01
        avatarRef.current.rotation.x = 0
        if (rightArmRef.current) rightArmRef.current.rotation.z = 0
        if (headRef.current) headRef.current.rotation.x = 0
        if (mouthRef?.current) mouthRef.current.scale.y = 1
        break
      }
    }
  })

  return null
}
