import { Component, useMemo, type ReactNode } from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

const SMPLX_OBJ_PATH = '/sample-smplx-default/body.obj'

const bodyMaterial = new THREE.MeshStandardMaterial({
  color: '#ead6c6',
  roughness: 0.72,
  metalness: 0.02,
  side: THREE.DoubleSide,
})

interface SMPLXAvatarModelProps {
  fallback: ReactNode
}

export default function SMPLXAvatarModel({ fallback }: SMPLXAvatarModelProps) {
  return (
    <ModelErrorBoundary fallback={fallback}>
      <LoadedSMPLXAvatar />
    </ModelErrorBoundary>
  )
}

function LoadedSMPLXAvatar() {
  const object = useLoader(OBJLoader, SMPLX_OBJ_PATH)

  const preparedObject = useMemo(() => {
    const model = object.clone(true)
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      child.castShadow = true
      child.receiveShadow = true
      child.material = bodyMaterial
      child.geometry.computeVertexNormals()
    })

    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const height = size.y || 1
    const targetHeight = 1.08
    const scale = targetHeight / height

    model.position.sub(center)
    model.scale.setScalar(scale)

    return model
  }, [object])

  return (
    <group position={[0, -0.22, 0]} rotation={[0, 0, 0]}>
      <primitive object={preparedObject} />
    </group>
  )
}

class ModelErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return <>{this.props.fallback}</>
    return this.props.children
  }
}
