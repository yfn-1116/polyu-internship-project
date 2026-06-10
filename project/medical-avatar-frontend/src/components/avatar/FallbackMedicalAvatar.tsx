/**
 * FallbackMedicalAvatar — 程序化医疗数字人（无 GLB 时的优雅兜底）
 *
 * 设计：深色背景下的浅色抽象人体，白大褂 + 肤色 + 科技蓝点缀
 * 比例：约 1.8 单位高，适配 AutoFit 自动居中
 */

import type { Group, Mesh } from 'three'
import * as THREE from 'three'

// ── 材质 ──
const skinMat = new THREE.MeshStandardMaterial({
  color: '#e8c4a8', roughness: 0.55, metalness: 0.02,
})
const coatMat = new THREE.MeshStandardMaterial({
  color: '#f4f7fb', roughness: 0.45, metalness: 0.03,
})
const pantsMat = new THREE.MeshStandardMaterial({
  color: '#1e3a5c', roughness: 0.6, metalness: 0.05,
})
const accentMat = new THREE.MeshStandardMaterial({
  color: '#00bcd4', roughness: 0.3, metalness: 0.4, emissive: '#002233', emissiveIntensity: 0.3,
})
const hairMat = new THREE.MeshStandardMaterial({
  color: '#2a3040', roughness: 0.7, metalness: 0.02,
})
const shoeMat = new THREE.MeshStandardMaterial({
  color: '#1a1a2e', roughness: 0.5, metalness: 0.1,
})
const eyeMat = new THREE.MeshStandardMaterial({
  color: '#0d1b2a', roughness: 0.25,
})
const mouthMat = new THREE.MeshStandardMaterial({
  color: '#c4816e', roughness: 0.5,
})
const badgeMat = new THREE.MeshStandardMaterial({
  color: '#00bcd4', roughness: 0.3, metalness: 0.5, emissive: '#001a22', emissiveIntensity: 0.4,
})

interface Props {
  headRef: React.RefObject<Group | null>
  rightArmRef: React.RefObject<Group | null>
  mouthRef: React.RefObject<Mesh | null>
}

export default function FallbackMedicalAvatar({ headRef, rightArmRef, mouthRef }: Props) {
  return (
    <group position={[0, -0.15, 0]}>
      {/* ═══ 头部 ═══ */}
      <group ref={headRef} position={[0, 1.35, 0]}>
        {/* 头骨 — 略扁椭圆 */}
        <mesh material={skinMat} castShadow scale={[0.82, 1.05, 0.74]}>
          <sphereGeometry args={[0.16, 40, 32]} />
        </mesh>
        {/* 下颌 */}
        <mesh position={[0, -0.14, 0.03]} material={skinMat} scale={[0.62, 0.55, 0.58]}>
          <sphereGeometry args={[0.1, 28, 20]} />
        </mesh>
        {/* 脖子 */}
        <mesh position={[0, -0.22, 0.02]} material={skinMat}>
          <cylinderGeometry args={[0.045, 0.055, 0.1, 20]} />
        </mesh>
        {/* 头发 */}
        <mesh position={[0, 0.1, -0.02]} material={hairMat} scale={[0.86, 0.38, 0.78]}>
          <sphereGeometry args={[0.16, 32, 14, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
        </mesh>
        {/* 耳朵 */}
        <mesh position={[-0.115, 0.0, 0]} material={skinMat} scale={[0.3, 0.55, 0.22]}>
          <sphereGeometry args={[0.06, 16, 12]} />
        </mesh>
        <mesh position={[0.115, 0.0, 0]} material={skinMat} scale={[0.3, 0.55, 0.22]}>
          <sphereGeometry args={[0.06, 16, 12]} />
        </mesh>
        {/* 眼睛 */}
        <mesh position={[-0.05, 0.02, 0.12]} material={eyeMat}>
          <sphereGeometry args={[0.012, 14, 10]} />
        </mesh>
        <mesh position={[0.05, 0.02, 0.12]} material={eyeMat}>
          <sphereGeometry args={[0.012, 14, 10]} />
        </mesh>
        {/* 眉毛 */}
        <mesh position={[-0.05, 0.05, 0.125]} rotation={[0, 0, 0.12]} material={hairMat}>
          <boxGeometry args={[0.04, 0.005, 0.005]} />
        </mesh>
        <mesh position={[0.05, 0.05, 0.125]} rotation={[0, 0, -0.12]} material={hairMat}>
          <boxGeometry args={[0.04, 0.005, 0.005]} />
        </mesh>
        {/* 嘴 */}
        <mesh ref={mouthRef} position={[0, -0.06, 0.13]} material={mouthMat}>
          <boxGeometry args={[0.055, 0.007, 0.005]} />
        </mesh>
        {/* 鼻子 */}
        <mesh position={[0, -0.01, 0.13]} material={skinMat} scale={[0.5, 0.7, 0.35]}>
          <sphereGeometry args={[0.025, 12, 10]} />
        </mesh>
      </group>

      {/* ═══ 身体 ═══ */}
      <group position={[0, 0.65, 0]}>
        {/* 躯干 — 白大褂上层 */}
        <mesh material={coatMat} castShadow>
          <capsuleGeometry args={[0.2, 0.42, 10, 22]} />
        </mesh>
        {/* 腰部 — 收窄 */}
        <mesh position={[0, -0.28, 0]} material={coatMat} castShadow scale={[0.82, 0.7, 0.65]}>
          <sphereGeometry args={[0.2, 22, 16]} />
        </mesh>
        {/* 肩膀 */}
        <mesh position={[-0.23, 0.18, 0]} rotation={[0, 0, 0.25]} material={coatMat} scale={[0.6, 0.9, 0.7]}>
          <sphereGeometry args={[0.1, 16, 12]} />
        </mesh>
        <mesh position={[0.23, 0.18, 0]} rotation={[0, 0, -0.25]} material={coatMat} scale={[0.6, 0.9, 0.7]}>
          <sphereGeometry args={[0.1, 16, 12]} />
        </mesh>
        {/* 领口 V 字 */}
        <mesh position={[0, 0.15, 0.17]} rotation={[0.15, 0, 0]} material={pantsMat}>
          <boxGeometry args={[0.16, 0.12, 0.03]} />
        </mesh>
        {/* 领口装饰线 */}
        <mesh position={[0, 0.32, 0.16]} material={accentMat}>
          <boxGeometry args={[0.28, 0.012, 0.008]} />
        </mesh>
        {/* 胸牌 */}
        <mesh position={[0.12, 0.08, 0.18]} material={badgeMat}>
          <boxGeometry args={[0.06, 0.04, 0.008]} />
        </mesh>
        {/* 纽扣 */}
        {[-0.05, -0.13, -0.21].map((y) => (
          <mesh key={y} position={[0, y, 0.17]} material={accentMat}>
            <sphereGeometry args={[0.015, 10, 8]} />
          </mesh>
        ))}
      </group>

      {/* ═══ 左臂 ═══ */}
      <group position={[-0.31, 0.62, 0.02]} rotation={[0.08, 0.05, -0.22]}>
        <mesh material={coatMat} castShadow>
          <capsuleGeometry args={[0.06, 0.38, 10, 16]} />
        </mesh>
        {/* 前臂 */}
        <mesh position={[-0.02, -0.26, 0.01]} rotation={[0, 0, 0.08]} material={coatMat}>
          <capsuleGeometry args={[0.05, 0.3, 10, 14]} />
        </mesh>
        {/* 手 */}
        <mesh position={[-0.02, -0.44, 0.01]} material={skinMat}>
          <sphereGeometry args={[0.045, 14, 12]} />
        </mesh>
      </group>

      {/* ═══ 右臂（可动） ═══ */}
      <group ref={rightArmRef} position={[0.31, 0.62, 0.02]} rotation={[0.08, -0.05, 0.04]}>
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
        {/* 臀部 */}
        <mesh position={[0, -0.22, -0.02]} material={pantsMat} scale={[0.9, 0.55, 0.7]}>
          <sphereGeometry args={[0.2, 20, 16]} />
        </mesh>
        {/* 左腿 */}
        <mesh position={[-0.1, -0.45, 0]} material={pantsMat} castShadow>
          <capsuleGeometry args={[0.07, 0.32, 10, 14]} />
        </mesh>
        {/* 右腿 */}
        <mesh position={[0.1, -0.45, 0]} material={pantsMat} castShadow>
          <capsuleGeometry args={[0.07, 0.32, 10, 14]} />
        </mesh>
        {/* 左鞋 */}
        <mesh position={[-0.1, -0.65, 0.04]} material={shoeMat}>
          <boxGeometry args={[0.09, 0.06, 0.15]} />
        </mesh>
        {/* 右鞋 */}
        <mesh position={[0.1, -0.65, 0.04]} material={shoeMat}>
          <boxGeometry args={[0.09, 0.06, 0.15]} />
        </mesh>
        {/* 腰带 */}
        <mesh position={[0, -0.18, 0.1]} material={accentMat}>
          <boxGeometry args={[0.3, 0.02, 0.04]} />
        </mesh>
      </group>

      {/* ═══ 科技光环（背后） ═══ */}
      <mesh position={[0, 1.05, -0.25]} rotation={[0.15, 0, 0]}>
        <torusGeometry args={[0.24, 0.008, 12, 48]} />
        <meshBasicMaterial color="#00bcd4" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}
