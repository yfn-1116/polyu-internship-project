/** AvatarModel — GLB 骨骼动画数字人 + Fallback 几何体.
 *
 *  模型获取：
 *    1. Mixamo → Blender → GLB → public/models/avatar.glb
 *    2. Ready Player Me → GLB → public/models/avatar.glb
 *    3. SMPL-X trimesh export → GLB → public/models/avatar.glb
 *    4. 无模型时自动使用 Fallback 几何体，不会白屏
 */

import React, { Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { AvatarState } from '../../types/digitalHuman'
import FallbackMedicalAvatar from './FallbackMedicalAvatar'
import type { Group, Mesh } from 'three'

const MODEL_PATH = '/models/avatar.glb'

interface AvatarModelProps {
  state: AvatarState
  headRef: React.RefObject<Group | null>
  rightArmRef: React.RefObject<Group | null>
  mouthRef?: React.RefObject<Mesh | null>
  modelMode?: 'doctor' | 'smplx'
  onSceneReady?: (scene: THREE.Group, animations: THREE.AnimationClip[]) => void
}

/** Inner component — only rendered if GLB exists (loaded via R3F Suspense) */
function GLBDoctor({ onSceneReady }: { onSceneReady?: (scene: THREE.Group, animations: THREE.AnimationClip[]) => void }) {
  const { scene, animations } = useGLTF(MODEL_PATH)
  const memoScene = useMemo(() => scene, [scene])

  // Notify parent of scene + animations availability
  if (onSceneReady && memoScene) {
    setTimeout(() => onSceneReady(memoScene, animations), 0)
  }

  return <primitive object={memoScene} />
}

export default function AvatarModel({
  headRef, rightArmRef, mouthRef, onSceneReady,
}: AvatarModelProps) {
  const [glbAvailable, setGlbAvailable] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    let cancelled = false
    fetch(MODEL_PATH, { method: 'HEAD' })
      .then((r) => { if (!cancelled) setGlbAvailable(r.ok) })
      .catch(() => { if (!cancelled) setGlbAvailable(false) })
    return () => { cancelled = true }
  }, [])

  // Still checking → show fallback
  if (glbAvailable === null) {
    return <FallbackMedicalAvatar headRef={headRef} rightArmRef={rightArmRef} mouthRef={mouthRef} />
  }

  // GLB exists → load with skeletal animation support
  if (glbAvailable) {
    return (
      <Suspense fallback={<FallbackMedicalAvatar headRef={headRef} rightArmRef={rightArmRef} mouthRef={mouthRef} />}>
        <GLBDoctor onSceneReady={onSceneReady} />
      </Suspense>
    )
  }

  // GLB not available → geometric fallback
  return <FallbackMedicalAvatar headRef={headRef} rightArmRef={rightArmRef} mouthRef={mouthRef} />
}
