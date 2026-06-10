/** Mixamo + Three.js skeletal animation manager.
 *
 *  Mixamo 动画命名约定（下载后可在 Blender/Three.js 中重命名）：
 *    idle       → Idle / Standing Idle
 *    listening  → Listening / Lean Forward
 *    thinking   → Thinking / Head Nod
 *    speaking   → Talking / Gesturing
 *    guiding    → Pointing / Arm Gesture
 *    rehab      → Stretching / Exercise
 */

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { AvatarState } from '../types/digitalHuman'

// Mixamo animation clip name → AvatarState mapping
const CLIP_MAP: Record<string, AvatarState> = {
  idle: 'idle',
  listening: 'listening',
  thinking: 'thinking',
  speaking: 'speaking',
  guiding: 'guiding',
  rehab: 'rehab',
}

// AvatarState → preferred clip name (fallback chain)
// 兼容 Mixamo 命名约定 和 RobotExpressive 模型动画
const STATE_CLIP: Partial<Record<AvatarState, string[]>> = {
  idle:      ['Idle', 'idle', 'Standing Idle', 'Breathing Idle', 'Standing'],
  listening: ['Yes', 'listening', 'Listening', 'Lean Forward', 'ThumbsUp'],
  thinking:  ['No', 'thinking', 'Thinking', 'Head Nod', 'Thinking Idle'],
  speaking:  ['Wave', 'speaking', 'Talking', 'Talking Gesture', 'Arm Gesture'],
  talking:   ['Wave', 'talking', 'speaking', 'Talking Gesture', 'Arm Gesture'],
  guiding:   ['Wave', 'guiding', 'Pointing', 'Pointing Gesture', 'Arm Stretch'],
  warning:   ['No', 'warning', 'Shake Head', 'Disapprove'],
  rehab:     ['Running', 'rehab', 'Stretch', 'Stretching', 'Exercise'],
  gesture:   ['Wave', 'ThumbsUp', 'gesture', 'wave', 'Pointing', 'Pointing Gesture'],
  walking:   ['Walking', 'Running', 'walking', 'walk', 'Walk'],
}

interface UseSkeletalAnimationOptions {
  scene: THREE.Group | null
  externalClips?: THREE.AnimationClip[]   // GLTF animations from useGLTF
  avatarState: AvatarState
  autoPlay?: boolean
}

export function useSkeletalAnimation({ scene, externalClips, avatarState, autoPlay = true }: UseSkeletalAnimationOptions) {
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const clipsRef = useRef<Map<string, THREE.AnimationClip>>(new Map())
  const currentActionRef = useRef<THREE.AnimationAction | null>(null)
  const prevStateRef = useRef<AvatarState>('idle')

  // Initialize mixer and clip map from GLB scene
  useEffect(() => {
    if (!scene) return

    const clips: THREE.AnimationClip[] = []

    // 优先使用外部传入的 animations（来自 useGLTF().animations）
    if (externalClips && externalClips.length > 0) {
      clips.push(...externalClips)
    }

    // 也遍历场景子节点中的 animations（兜底）
    scene.traverse((child) => {
      if ((child as any).animations?.length) {
        clips.push(...(child as any).animations)
      }
    })

    if (clips.length === 0) {
      // No skeletal animations in GLB — use procedural fallback
      return
    }

    const mixer = new THREE.AnimationMixer(scene)
    mixerRef.current = mixer

    const clipMap = new Map<string, THREE.AnimationClip>()
    for (const clip of clips) {
      // Normalize clip name
      const name = clip.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
      clipMap.set(clip.name, clip)
      clipMap.set(name, clip)
    }
    clipsRef.current = clipMap

    // Auto-play idle
    if (autoPlay) {
      playState('idle')
    }

    return () => {
      mixer.stopAllAction()
    }
  }, [scene, externalClips])

  // Switch animation when avatarState changes
  useEffect(() => {
    if (prevStateRef.current === avatarState) return
    prevStateRef.current = avatarState

    if (clipsRef.current.size === 0) return
    playState(avatarState)
  }, [avatarState])

  function playState(state: AvatarState) {
    const mixer = mixerRef.current
    if (!mixer) return

    const candidates = STATE_CLIP[state] || [state]
    let targetClip: THREE.AnimationClip | undefined

    for (const name of candidates) {
      targetClip = clipsRef.current.get(name)
      if (targetClip) break
    }

    // Fallback to idle
    if (!targetClip) {
      for (const name of STATE_CLIP.idle) {
        targetClip = clipsRef.current.get(name)
        if (targetClip) break
      }
    }
    if (!targetClip) return

    // Smooth transition
    const prevAction = currentActionRef.current
    const nextAction = mixer.clipAction(targetClip)

    if (prevAction && prevAction !== nextAction) {
      prevAction.fadeOut(0.3)
    }

    nextAction.reset().fadeIn(0.3).play()
    currentActionRef.current = nextAction
  }

  // Tick mixer each frame
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(Math.min(delta, 0.1)) // cap delta to avoid huge jumps
    }
  })

  return {
    mixer: mixerRef,
    clips: clipsRef,
    playState,
    hasSkeletalAnimations: clipsRef.current.size > 0,
  }
}
