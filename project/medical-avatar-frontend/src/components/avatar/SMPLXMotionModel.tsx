import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface AnimationMeta {
  frame_count: number
  fps: number
  vertices_count: number
}

interface SMPLXMotionModelProps {
  basePath?: string
  playing: boolean
  speed: number
  rotationY?: number
  targetHeight?: number
  resetToken?: number
  onFrame?: (frame: number, total: number) => void
}

const material = new THREE.MeshStandardMaterial({
  color: '#e8d6c8',
  roughness: 0.68,
  metalness: 0.02,
  side: THREE.DoubleSide,
})

export default function SMPLXMotionModel({
  basePath = '/sample-mocap-happy',
  playing,
  speed,
  rotationY = 0,
  targetHeight = 1.42,
  resetToken = 0,
  onFrame,
}: SMPLXMotionModelProps) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)
  const verticesRef = useRef<Float32Array | null>(null)
  const transformedRef = useRef<Float32Array | null>(null)
  const metaRef = useRef<AnimationMeta | null>(null)
  const scaleRef = useRef(1)
  const frameRef = useRef(0)
  const onFrameRef = useRef(onFrame)

  useEffect(() => {
    onFrameRef.current = onFrame
  }, [onFrame])

  useEffect(() => {
    let cancelled = false

    async function loadMotion() {
      const [facesText, verticesBuffer, meta] = await Promise.all([
        fetch(`${basePath}/faces.obj`).then((r) => r.text()),
        fetch(`${basePath}/vertices.bin`).then((r) => r.arrayBuffer()),
        fetch(`${basePath}/animation_meta.json`).then((r) => r.json() as Promise<AnimationMeta>),
      ])

      if (cancelled) return

      const indices = parseFacesFromObj(facesText)
      const vertices = new Float32Array(verticesBuffer)
      const transformed = new Float32Array(meta.vertices_count * 3)
      scaleRef.current = getMotionScale(vertices, meta, targetHeight)
      writeFrame(vertices, transformed, meta, 0, scaleRef.current)
      const nextGeometry = new THREE.BufferGeometry()
      nextGeometry.setAttribute('position', new THREE.BufferAttribute(transformed, 3))
      nextGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))
      nextGeometry.computeVertexNormals()

      verticesRef.current = vertices
      transformedRef.current = transformed
      metaRef.current = meta
      frameRef.current = 0
      setGeometry(nextGeometry)
      onFrameRef.current?.(0, meta.frame_count)
    }

    loadMotion().catch(() => {
      if (!cancelled) setGeometry(null)
    })

    return () => {
      cancelled = true
    }
  }, [basePath, targetHeight])

  useEffect(() => {
    return () => {
      geometry?.dispose()
    }
  }, [geometry])

  useFrame((_, delta) => {
    if (!playing || !geometry || !verticesRef.current || !transformedRef.current || !metaRef.current) return

    const meta = metaRef.current
    frameRef.current += delta * meta.fps * speed
    if (frameRef.current >= meta.frame_count) frameRef.current = 0

    const frame = Math.floor(frameRef.current)
    writeFrame(verticesRef.current, transformedRef.current, meta, frame, scaleRef.current)
    const attr = geometry.attributes.position as THREE.BufferAttribute
    attr.needsUpdate = true
    if (frame % 2 === 0) geometry.computeVertexNormals()
    onFrameRef.current?.(frame, meta.frame_count)
  })

  useEffect(() => {
    frameRef.current = 0
    if (!geometry || !verticesRef.current || !transformedRef.current || !metaRef.current) return
    const meta = metaRef.current
    writeFrame(verticesRef.current, transformedRef.current, meta, 0, scaleRef.current)
    const attr = geometry.attributes.position as THREE.BufferAttribute
    attr.needsUpdate = true
    geometry.computeVertexNormals()
    onFrameRef.current?.(0, meta.frame_count)
  }, [resetToken, geometry])

  const ready = useMemo(() => Boolean(geometry), [geometry])

  if (!geometry || !ready) return null

  return (
    <group rotation={[0, rotationY, 0]} position={[0, -0.9, 0]}>
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
    </group>
  )
}

function getMotionScale(vertices: Float32Array, meta: AnimationMeta, targetHeight: number) {
  let minZ = Infinity
  let maxZ = -Infinity
  const sampleStep = Math.max(1, Math.floor(meta.frame_count / 12))

  for (let frame = 0; frame < meta.frame_count; frame += sampleStep) {
    const offset = frame * meta.vertices_count * 3
    for (let index = 0; index < meta.vertices_count; index += 8) {
      const z = vertices[offset + index * 3 + 2]
      if (z < minZ) minZ = z
      if (z > maxZ) maxZ = z
    }
  }

  return targetHeight / Math.max(maxZ - minZ, 1)
}

function writeFrame(
  vertices: Float32Array,
  target: Float32Array,
  meta: AnimationMeta,
  frame: number,
  scale: number,
) {
  const offset = frame * meta.vertices_count * 3
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let minZ = Infinity
  let maxZ = -Infinity

  for (let index = 0; index < meta.vertices_count; index++) {
    const sourceIndex = offset + index * 3
    const x = vertices[sourceIndex]
    const sourceY = vertices[sourceIndex + 1]
    const sourceZ = vertices[sourceIndex + 2]
    const renderZ = -sourceY

    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (sourceZ < minY) minY = sourceZ
    if (renderZ < minZ) minZ = renderZ
    if (renderZ > maxZ) maxZ = renderZ
  }

  const centerX = (minX + maxX) / 2
  const centerZ = (minZ + maxZ) / 2

  for (let index = 0; index < meta.vertices_count; index++) {
    const sourceIndex = offset + index * 3
    const targetIndex = index * 3
    const x = vertices[sourceIndex]
    const sourceY = vertices[sourceIndex + 1]
    const sourceZ = vertices[sourceIndex + 2]

    target[targetIndex] = (x - centerX) * scale
    target[targetIndex + 1] = (sourceZ - minY) * scale
    target[targetIndex + 2] = (-sourceY - centerZ) * scale
  }
}

function parseFacesFromObj(text: string): number[] {
  const indices: number[] = []
  for (const line of text.split('\n')) {
    if (!line.startsWith('f ')) continue
    const parts = line.trim().split(/\s+/).slice(1)
    if (parts.length < 3) continue
    indices.push(
      parseInt(parts[0], 10) - 1,
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10) - 1,
    )
  }
  return indices
}
