import { useRef, useState, Suspense, useCallback, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { Group, Mesh } from 'three'
import type { AvatarState } from '../../types/digitalHuman'
import AvatarModel from './AvatarModel'
import AvatarLights from './AvatarLights'
import AvatarControls from './AvatarControls'
import { useSkeletalAnimation } from '../../composables/useSkeletalAnimation'
import { type BodyPartRefs, highlightBodyGroup, unhighlightBodyGroup } from './FallbackMedicalAvatar'

export type { BodyPartRefs }

interface AvatarStageProps {
  state: AvatarState
  isRehab?: boolean
  modelMode?: 'doctor' | 'smplx'
  compact?: boolean
  selectedPart?: string | null
}

function AutoFit({ scene }: { scene: THREE.Group | null }) {
  const { camera, controls } = useThree() as any

  useEffect(() => {
    if (!scene) return
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const targetHeight = 2.5
    const scale = targetHeight / (maxDim || 1)
    scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
    scene.scale.setScalar(scale)
    const dist = targetHeight * 1.8
    camera.position.set(0, targetHeight * 0.35, dist)
    camera.lookAt(0, targetHeight * 0.15, 0)
    if (controls) {
      (controls as any).target.set(0, targetHeight * 0.15, 0)
      ;(controls as any).update()
    }
  }, [scene, camera, controls])

  return null
}

function SceneContent({ state, isRehab, modelMode, compact, selectedPart }: Omit<AvatarStageProps, 'modelMode'> & { modelMode: 'doctor' | 'smplx', compact: boolean }) {
  const avatarRef = useRef<Group>(null!)

  // 身体部位 refs
  const bodyRefs: BodyPartRefs = {
    head: useRef<Group>(null!),
    torso: useRef<Group>(null!),
    leftArm: useRef<Group>(null!),
    rightArm: useRef<Group>(null!),
    leftLeg: useRef<Group>(null!),
    rightLeg: useRef<Group>(null!),
    mouth: useRef<Mesh>(null!),
  }

  const [glbScene, setGlbScene] = useState<THREE.Group | null>(null)
  const [glbAnimations, setGlbAnimations] = useState<THREE.AnimationClip[]>([])

  const handleSceneReady = useCallback((scene: THREE.Group, animations: THREE.AnimationClip[]) => {
    setGlbScene(scene)
    if (animations?.length) setGlbAnimations(animations)
  }, [])

  const { hasSkeletalAnimations } = useSkeletalAnimation({
    scene: glbScene,
    externalClips: glbAnimations.length > 0 ? glbAnimations : undefined,
    avatarState: state,
    autoPlay: true,
  })

  // 高亮选中部位
  useEffect(() => {
    // 先清除所有高亮
    Object.values(bodyRefs).forEach((ref) => {
      if (ref && 'current' in ref) unhighlightBodyGroup(ref.current)
    })

    // 设置新高亮
    if (selectedPart && selectedPart in bodyRefs) {
      const ref = (bodyRefs as any)[selectedPart]
      if (ref?.current) {
        highlightBodyGroup(ref.current as Group)
      }
    }
  }, [selectedPart, bodyRefs])

  return (
    <>
      <OrbitControls
        enableDamping dampingFactor={0.08}
        minDistance={1.2} maxDistance={8}
        maxPolarAngle={Math.PI * 0.75}
        target={[0, 0.4, 0]}
      />

      <group ref={avatarRef}>
        <AvatarModel
          state={state}
          bodyRefs={bodyRefs}
          modelMode={modelMode}
          onSceneReady={handleSceneReady}
        />
      </group>

      <AutoFit scene={glbScene} />
      <AvatarLights />

      {!hasSkeletalAnimations && (
        <AvatarControls state={state} bodyRefs={bodyRefs} />
      )}

      {!compact && (
        <mesh position={[0, 0.02, -0.34]}>
          <circleGeometry args={[0.82, 96]} />
          <meshBasicMaterial color="#00bcd4" transparent opacity={0.08} side={2} />
        </mesh>
      )}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, 0]} receiveShadow>
        <ringGeometry args={compact ? [0.18, 0.26, 64] : [0.34, 0.52, 96]} />
        <meshBasicMaterial color="#00bcd4" transparent opacity={compact ? 0.1 : 0.18} side={2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.951, 0]}>
        <circleGeometry args={compact ? [0.18, 64] : [0.34, 96]} />
        <meshBasicMaterial color="#0a0e17" transparent opacity={0.85} side={2} />
      </mesh>

      <gridHelper args={compact ? [2, 10, '#1a2a3a', '#0d1520'] : [3, 14, '#1a2a3a', '#111928']} position={[0, -0.96, 0]} />
      <Environment preset="night" />
    </>
  )
}

export default function AvatarStage({
  state, isRehab = false, modelMode = 'doctor', compact = false, selectedPart = null,
}: AvatarStageProps) {
  const cameraPos: [number, number, number] = isRehab
    ? [0, 1.12, 5.8] : compact ? [0, 1.1, 5.1] : [0, 1.0, 4.5]
  const fov = compact ? 35 : isRehab ? 36 : 40

  return (
    <Canvas
      camera={{ position: cameraPos, fov, near: 0.1, far: 100 }}
      style={{ background: 'transparent' }}
      shadows
    >
      <Suspense fallback={null}>
        <SceneContent state={state} isRehab={isRehab} modelMode={modelMode} compact={compact} selectedPart={selectedPart} />
      </Suspense>
    </Canvas>
  )
}
