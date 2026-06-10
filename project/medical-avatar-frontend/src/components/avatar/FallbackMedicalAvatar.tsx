/**
 * FallbackMedicalAvatar — 程序化医疗数字人 v2
 *
 * 升级：
 *  - PBR 材质（MeshPhysicalMaterial + clearcoat）
 *  - 暴露全部身体部位 refs（用于高亮标注）
 *  - 更精细的几何体
 *
 * 身体部位分组：
 *   headGroup / torsoGroup / leftArmGroup / rightArmGroup
 *   leftLegGroup / rightLegGroup
 */

import { useRef } from 'react'
import type { Group, Mesh } from 'three'
import * as THREE from 'three'

// ═══ PBR 材质 ═══
const skinMat = new THREE.MeshPhysicalMaterial({
  color: '#e8c4a8', roughness: 0.52, metalness: 0.01, clearcoat: 0.08, clearcoatRoughness: 0.85,
})
const coatMat = new THREE.MeshPhysicalMaterial({
  color: '#f4f7fb', roughness: 0.42, metalness: 0.02, clearcoat: 0.05,
})
const pantsMat = new THREE.MeshStandardMaterial({
  color: '#1e3a5c', roughness: 0.55, metalness: 0.04,
})
const accentMat = new THREE.MeshPhysicalMaterial({
  color: '#00bcd4', roughness: 0.25, metalness: 0.45, emissive: '#00111a', emissiveIntensity: 0.5,
})
const hairMat = new THREE.MeshStandardMaterial({ color: '#2a3040', roughness: 0.68 })
const shoeMat = new THREE.MeshStandardMaterial({ color: '#1a1a2e', roughness: 0.45, metalness: 0.08 })
const eyeMat = new THREE.MeshStandardMaterial({ color: '#0d1b2a', roughness: 0.22 })
const mouthMat = new THREE.MeshStandardMaterial({ color: '#c4816e', roughness: 0.48 })
const badgeMat = new THREE.MeshPhysicalMaterial({
  color: '#00bcd4', roughness: 0.25, metalness: 0.55, emissive: '#00141a', emissiveIntensity: 0.6,
})

// 高亮材质（选中身体部位时替换）
const highlightMat = new THREE.MeshStandardMaterial({
  color: '#00e5ff', roughness: 0.2, metalness: 0.1, emissive: '#004466', emissiveIntensity: 1.2, transparent: true, opacity: 0.7,
})
const highlightWarnMat = new THREE.MeshStandardMaterial({
  color: '#ff5252', roughness: 0.2, metalness: 0.1, emissive: '#440000', emissiveIntensity: 1.0, transparent: true, opacity: 0.7,
})

// ═══ 导出的 refs 类型 ═══
export interface BodyPartRefs {
  head: React.RefObject<Group | null>
  torso: React.RefObject<Group | null>
  leftArm: React.RefObject<Group | null>
  rightArm: React.RefObject<Group | null>
  leftLeg: React.RefObject<Group | null>
  rightLeg: React.RefObject<Group | null>
  mouth: React.RefObject<Mesh | null>
}

export const HIGHLIGHT_MAT = highlightMat
export const HIGHLIGHT_WARN_MAT = highlightWarnMat

// ═══ 原始材质缓存（用于取消高亮恢复）═══
const originalMaterials = new Map<string, THREE.Material | THREE.Material[]>()

/** 高亮一个身体部位 group（替换所有子 mesh 材质） */
export function highlightBodyGroup(group: Group | null, material: THREE.Material = highlightMat) {
  if (!group) return
  group.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh
      const key = mesh.uuid + ':highlighted'
      if (!originalMaterials.has(key)) {
        originalMaterials.set(key, mesh.material)
      }
      mesh.material = material
    }
  })
}

/** 取消高亮，恢复原始材质 */
export function unhighlightBodyGroup(group: Group | null) {
  if (!group) return
  group.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh
      const key = mesh.uuid + ':highlighted'
      const orig = originalMaterials.get(key)
      if (orig) {
        mesh.material = orig as THREE.Material
        originalMaterials.delete(key)
      }
    }
  })
}

/** 子组件：单个身体部位 mesh */
function BodyPartMesh({ geometry, material, position, rotation, scale, castShadow = true }: {
  geometry: THREE.BufferGeometry
  material: THREE.Material
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  castShadow?: boolean
}) {
  const meshRef = useRef<Mesh>(null!)
  return (
    <mesh ref={meshRef} geometry={geometry} material={material}
      position={position} rotation={rotation} scale={scale} castShadow={castShadow} receiveShadow
    />
  )
}

interface Props {
  bodyRefs: BodyPartRefs
}

export default function FallbackMedicalAvatar({ bodyRefs }: Props) {
  return (
    <group position={[0, -0.15, 0]}>
      {/* ═══ 头部 ═══ */}
      <group ref={bodyRefs.head} position={[0, 1.35, 0]}>
        <mesh material={skinMat} castShadow scale={[0.82, 1.05, 0.74]}>
          <sphereGeometry args={[0.16, 40, 32]} />
        </mesh>
        <mesh position={[0, -0.14, 0.03]} material={skinMat} scale={[0.62, 0.55, 0.58]}>
          <sphereGeometry args={[0.1, 28, 20]} />
        </mesh>
        <mesh position={[0, -0.22, 0.02]} material={skinMat}>
          <cylinderGeometry args={[0.045, 0.055, 0.1, 20]} />
        </mesh>
        <mesh position={[0, 0.1, -0.02]} material={hairMat} scale={[0.86, 0.38, 0.78]}>
          <sphereGeometry args={[0.16, 32, 14, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
        </mesh>
        <mesh position={[-0.05, 0.02, 0.12]} material={eyeMat}>
          <sphereGeometry args={[0.012, 14, 10]} />
        </mesh>
        <mesh position={[0.05, 0.02, 0.12]} material={eyeMat}>
          <sphereGeometry args={[0.012, 14, 10]} />
        </mesh>
        <mesh ref={bodyRefs.mouth} position={[0, -0.06, 0.13]} material={mouthMat}>
          <boxGeometry args={[0.055, 0.007, 0.005]} />
        </mesh>
      </group>

      {/* ═══ 躯干 ═══ */}
      <group ref={bodyRefs.torso} position={[0, 0.65, 0]}>
        <mesh material={coatMat} castShadow>
          <capsuleGeometry args={[0.2, 0.42, 10, 22]} />
        </mesh>
        <mesh position={[0, -0.28, 0]} material={coatMat} castShadow scale={[0.82, 0.7, 0.65]}>
          <sphereGeometry args={[0.2, 22, 16]} />
        </mesh>
        <mesh position={[-0.23, 0.18, 0]} rotation={[0, 0, 0.25]} material={coatMat} scale={[0.6, 0.9, 0.7]}>
          <sphereGeometry args={[0.1, 16, 12]} />
        </mesh>
        <mesh position={[0.23, 0.18, 0]} rotation={[0, 0, -0.25]} material={coatMat} scale={[0.6, 0.9, 0.7]}>
          <sphereGeometry args={[0.1, 16, 12]} />
        </mesh>
        <mesh position={[0, 0.32, 0.16]} material={accentMat}>
          <boxGeometry args={[0.28, 0.012, 0.008]} />
        </mesh>
        <mesh position={[0.12, 0.08, 0.18]} material={badgeMat}>
          <boxGeometry args={[0.06, 0.04, 0.008]} />
        </mesh>
      </group>

      {/* ═══ 左臂 ═══ */}
      <group ref={bodyRefs.leftArm} position={[-0.31, 0.62, 0.02]} rotation={[0.08, 0.05, -0.22]}>
        <mesh material={coatMat} castShadow>
          <capsuleGeometry args={[0.06, 0.38, 10, 16]} />
        </mesh>
        <mesh position={[-0.02, -0.26, 0.01]} rotation={[0, 0, 0.08]} material={coatMat}>
          <capsuleGeometry args={[0.05, 0.3, 10, 14]} />
        </mesh>
        <mesh position={[-0.02, -0.44, 0.01]} material={skinMat}>
          <sphereGeometry args={[0.045, 14, 12]} />
        </mesh>
      </group>

      {/* ═══ 右臂 ═══ */}
      <group ref={bodyRefs.rightArm} position={[0.31, 0.62, 0.02]} rotation={[0.08, -0.05, 0.04]}>
        <mesh material={coatMat} castShadow>
          <capsuleGeometry args={[0.06, 0.38, 10, 16]} />
        </mesh>
        <mesh position={[0.02, -0.26, 0.01]} rotation={[0, 0, -0.08]} material={coatMat}>
          <capsuleGeometry args={[0.05, 0.3, 10, 14]} />
        </mesh>
        <mesh position={[0.02, -0.44, 0.01]} material={skinMat}>
          <sphereGeometry args={[0.045, 14, 12]} />
        </mesh>
      </group>

      {/* ═══ 下半身 ═══ */}
      <group position={[0, 0.1, 0]}>
        <mesh position={[0, -0.22, -0.02]} material={pantsMat} scale={[0.9, 0.55, 0.7]}>
          <sphereGeometry args={[0.2, 20, 16]} />
        </mesh>
        {/* 左腿 */}
        <group ref={bodyRefs.leftLeg}>
          <mesh position={[-0.1, -0.45, 0]} material={pantsMat} castShadow>
            <capsuleGeometry args={[0.07, 0.32, 10, 14]} />
          </mesh>
          <mesh position={[-0.1, -0.65, 0.04]} material={shoeMat}>
            <boxGeometry args={[0.09, 0.06, 0.15]} />
          </mesh>
        </group>
        {/* 右腿 */}
        <group ref={bodyRefs.rightLeg}>
          <mesh position={[0.1, -0.45, 0]} material={pantsMat} castShadow>
            <capsuleGeometry args={[0.07, 0.32, 10, 14]} />
          </mesh>
          <mesh position={[0.1, -0.65, 0.04]} material={shoeMat}>
            <boxGeometry args={[0.09, 0.06, 0.15]} />
          </mesh>
        </group>
        <mesh position={[0, -0.18, 0.1]} material={accentMat}>
          <boxGeometry args={[0.3, 0.02, 0.04]} />
        </mesh>
      </group>

      {/* 光环 */}
      <mesh position={[0, 1.05, -0.25]} rotation={[0.15, 0, 0]}>
        <torusGeometry args={[0.24, 0.008, 12, 48]} />
        <meshBasicMaterial color="#00bcd4" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}
