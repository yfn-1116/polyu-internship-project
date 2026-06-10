/** AvatarLights — 暗色科技风灯光：主光 + 补光 + 轮廓光 */
export default function AvatarLights() {
  return (
    <>
      {/* 低环境光 — 避免过亮 */}
      <ambientLight intensity={0.6} color="#1a2a3a" />

      {/* 主方向光 — 带阴影 */}
      <directionalLight
        position={[2.3, 3.7, 3.7]}
        intensity={2.8}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* 左补光 — 冷蓝 */}
      <directionalLight
        position={[-2.4, 1.5, 2.6]}
        intensity={0.9}
        color="#667799"
      />

      {/* 轮廓光 — 青色 rim */}
      <directionalLight
        position={[0, 1.6, -3.5]}
        intensity={1.2}
        color="#00bcd4"
      />

      {/* 底部补光 — 减弱暗面 */}
      <directionalLight
        position={[0, -0.5, 0.8]}
        intensity={0.35}
        color="#334455"
      />
    </>
  )
}
