/** AvatarModel — GLB 骨骼动画数字人 + Fallback 几何体 */

import React, { Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { AvatarState } from '../../types/digitalHuman'
import FallbackMedicalAvatar, { type BodyPartRefs } from './FallbackMedicalAvatar'

const MODEL_PATH = '/models/avatar.glb'

interface AvatarModelProps {
  state: AvatarState
  bodyRefs: BodyPartRefs
  modelMode?: 'doctor' | 'smplx'
  onSceneReady?: (scene: THREE.Group, animations: THREE.AnimationClip[]) => void
}

function GLBDoctor({ onSceneReady }: { onSceneReady?: (scene: THREE.Group, animations: THREE.AnimationClip[]) => void }) {
  const { scene, animations } = useGLTF(MODEL_PATH)
  const memoScene = useMemo(() => scene, [scene])
  if (onSceneReady && memoScene) {
    setTimeout(() => onSceneReady(memoScene, animations), 0)
  }
  return <primitive object={memoScene} />
}

export default function AvatarModel({ bodyRefs, onSceneReady }: AvatarModelProps) {
  const [glbAvailable, setGlbAvailable] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    let cancelled = false
    fetch(MODEL_PATH, { method: 'HEAD' })
      .then((r) => { if (!cancelled) setGlbAvailable(r.ok) })
      .catch(() => { if (!cancelled) setGlbAvailable(false) })
    return () => { cancelled = true }
  }, [])

  if (glbAvailable === null) {
    return <FallbackMedicalAvatar bodyRefs={bodyRefs} />
  }

  if (glbAvailable) {
    return (
      <Suspense fallback={<FallbackMedicalAvatar bodyRefs={bodyRefs} />}>
        <GLBDoctor onSceneReady={onSceneReady} />
      </Suspense>
    )
  }

  return <FallbackMedicalAvatar bodyRefs={bodyRefs} />
}
