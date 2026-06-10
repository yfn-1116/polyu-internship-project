/**
 * CameraZoom — 选中身体部位时平滑聚焦相机
 *
 * 与 OrbitControls 配合：通过修改 controls.target + camera.position
 * 实现平滑 zoom-in / zoom-out
 */

import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { BodyPartKey } from '../medical/BodyPartSelector'

// 微调聚焦 — 保持全身可见，只是视角稍偏 + 注视点上移/下移
const PART_FOCUS: Record<BodyPartKey, [number, number, number]> = {
  head:      [0, 0.8, 0.5],    // 注视点偏上
  torso:     [0, 0.5, 0.3],    // 注视躯干中心
  leftArm:   [-0.35, 0.5, 0.2],
  rightArm:  [0.35, 0.5, 0.2],
  leftLeg:   [-0.12, 0.05, 0],
  rightLeg:  [0.12, 0.05, 0],
}

// 相机保持远距离，只微调注视点
const DEFAULT_TARGET = new THREE.Vector3(0, 0.4, 0)
const DEFAULT_POS = new THREE.Vector3(0, 1.0, 4.5)
const LERP_SPEED = 0.05

interface Props {
  selectedPart: BodyPartKey | null
  controlsRef: React.MutableRefObject<any>
}

export default function CameraZoom({ selectedPart, controlsRef }: Props) {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3().copy(DEFAULT_POS))
  const targetLookAt = useRef(new THREE.Vector3().copy(DEFAULT_TARGET))
  const animLookAt = useRef(new THREE.Vector3().copy(DEFAULT_TARGET))
  const animPos = useRef(new THREE.Vector3().copy(DEFAULT_POS))

  useEffect(() => {
    if (selectedPart) {
      const focus = PART_FOCUS[selectedPart]
      targetLookAt.current.set(...focus)
      // 相机保持远距离不变，只微调注视点 → 全身始终可见
      targetPos.current.copy(DEFAULT_POS)
    } else {
      targetPos.current.copy(DEFAULT_POS)
      targetLookAt.current.copy(DEFAULT_TARGET)
    }
  }, [selectedPart])

  useFrame(() => {
    // 平滑插值
    animPos.current.lerp(targetPos.current, LERP_SPEED)
    animLookAt.current.lerp(targetLookAt.current, LERP_SPEED)

    camera.position.copy(animPos.current)
    camera.lookAt(animLookAt.current)

    // 同步 OrbitControls
    const ctrl = controlsRef.current
    if (ctrl) {
      ctrl.target.copy(animLookAt.current)
      ctrl.update()
    }
  })

  return null
}
