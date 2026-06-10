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

interface AvatarStageProps {
  state: AvatarState
  isRehab?: boolean
  modelMode?: 'doctor' | 'smplx'
  compact?: boolean
}

/** 自动计算包围盒并居中+缩放到合适大小 */
function AutoFit({ scene }: { scene: THREE.Group | null }) {
  const { camera, controls } = useThree() as any

  useEffect(() => {
    if (!scene) return

    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)

    // 如果模型太大或太小，调整到 ~2.5 单位高度
    const targetHeight = 2.5
    const scale = targetHeight / (maxDim || 1)

    // 居中模型
    scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
    scene.scale.setScalar(scale)

    // 调整相机距离
    const dist = targetHeight * 1.8
    camera.position.set(0, targetHeight * 0.35, dist)
    camera.lookAt(0, targetHeight * 0.15, 0)

    // 更新 OrbitControls 目标
    if (controls) {
      (controls as any).target.set(0, targetHeight * 0.15, 0)
      ;(controls as any).update()
    }
  }, [scene, camera, controls])

  return null
}

/** Inner scene content — needs to be inside Canvas for hooks to work */
function SceneContent({ state, isRehab, modelMode, compact }: Omit<AvatarStageProps, 'modelMode'> & { modelMode: 'doctor' | 'smplx', compact: boolean }) {
  const avatarRef = useRef<Group>(null!)
  const headRef = useRef<Group>(null!)
  const rightArmRef = useRef<Group>(null!)
  const mouthRef = useRef<Mesh>(null!)

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

  return (
    <>
      {/* OrbitControls — 鼠标旋转/缩放/平移 */}
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={1.2}
        maxDistance={8}
        maxPolarAngle={Math.PI * 0.75}
        target={[0, 0.4, 0]}
      />

      <group ref={avatarRef}>
        <AvatarModel
          state={state}
          headRef={headRef}
          rightArmRef={rightArmRef}
          mouthRef={mouthRef}
          modelMode={modelMode}
          onSceneReady={handleSceneReady}
        />
      </group>

      {/* GLB 模型自动居中缩放 */}
      <AutoFit scene={glbScene} />

      <AvatarLights />

      {!hasSkeletalAnimations && (
        <AvatarControls
          state={state}
          avatarRef={avatarRef}
          headRef={headRef}
          rightArmRef={rightArmRef}
          mouthRef={mouthRef}
        />
      )}

      {/* Back halo */}
      {!compact && (
        <mesh position={[0, 0.02, -0.34]}>
          <circleGeometry args={[0.82, 96]} />
          <meshBasicMaterial color="#00bcd4" transparent opacity={0.08} side={2} />
        </mesh>
      )}

      {/* Ground glow pedestal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, 0]} receiveShadow>
        <ringGeometry args={compact ? [0.18, 0.26, 64] : [0.34, 0.52, 96]} />
        <meshBasicMaterial color="#00bcd4" transparent opacity={compact ? 0.1 : 0.18} side={2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.951, 0]}>
        <circleGeometry args={compact ? [0.18, 64] : [0.34, 96]} />
        <meshBasicMaterial color="#0a0e17" transparent opacity={0.85} side={2} />
      </mesh>

      {/* Grid */}
      <gridHelper args={compact ? [2, 10, '#1a2a3a', '#0d1520'] : [3, 14, '#1a2a3a', '#111928']} position={[0, -0.96, 0]} />

      <Environment preset="night" />
    </>
  )
}

export default function AvatarStage({
  state,
  isRehab = false,
  modelMode = 'doctor',
  compact = false,
}: AvatarStageProps) {
  const cameraPos: [number, number, number] = isRehab
    ? [0, 1.12, 5.8]
    : compact
      ? [0, 1.1, 5.1]
      : [0, 1.0, 4.5]
  const fov = compact ? 35 : isRehab ? 36 : 40

  return (
    <Canvas
      camera={{ position: cameraPos, fov, near: 0.1, far: 100 }}
      style={{ background: 'transparent' }}
      shadows
    >
      <Suspense fallback={null}>
        <SceneContent state={state} isRehab={isRehab} modelMode={modelMode} compact={compact} />
      </Suspense>
    </Canvas>
  )
}
