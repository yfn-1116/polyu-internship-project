import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import * as THREE from 'three'
import { store, SAMPLES, isMoCapSample } from '../stores/viewerStore.js'

const objLoader = new OBJLoader()

export async function loadManifest(sampleId) {
  const response = await fetch(SAMPLES[sampleId])
  if (!response.ok) throw new Error(`failed to load manifest: ${response.status}`)
  return response.json()
}

export function applyMeshMaterial(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: 0x7c9cbf,
        roughness: 0.55,
        metalness: 0.05,
      })
      child.castShadow = true
      child.receiveShadow = true
    }
  })
}

export function loadObjMesh(meshPath) {
  return new Promise((resolve, reject) => {
    objLoader.load(
      meshPath,
      (object) => {
        applyMeshMaterial(object)
        resolve(object)
      },
      undefined,
      reject,
    )
  })
}

export function parseFacesFromObj(text) {
  const indices = []
  for (const line of text.split('\n')) {
    if (line.startsWith('f ')) {
      const parts = line.trim().split(/\s+/).slice(1)
      const a = parseInt(parts[0]) - 1
      const b = parseInt(parts[1]) - 1
      const c = parseInt(parts[2]) - 1
      indices.push(a, b, c)
    }
  }
  return indices
}

export async function loadMoCapData(basePath) {
  const [facesText, binResponse, metaResponse] = await Promise.all([
    fetch(`${basePath}/faces.obj`).then((r) => r.text()),
    fetch(`${basePath}/vertices.bin`),
    fetch(`${basePath}/animation_meta.json`).then((r) => r.json()),
  ])

  const binBuffer = await binResponse.arrayBuffer()
  const verticesData = new Float32Array(binBuffer)

  const faceIndices = parseFacesFromObj(facesText)
  const geometry = new THREE.BufferGeometry()
  const nVertices = metaResponse.vertices_count
  const nFrames = metaResponse.frame_count
  const fps = metaResponse.fps

  const firstFrame = new Float32Array(verticesData.buffer, 0, nVertices * 3).slice()
  geometry.setAttribute('position', new THREE.BufferAttribute(firstFrame, 3))
  geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(faceIndices), 1))
  geometry.computeVertexNormals()

  const material = new THREE.MeshStandardMaterial({
    color: 0x7c9cbf,
    roughness: 0.55,
    metalness: 0.05,
    side: THREE.DoubleSide,
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true

  return {
    mesh,
    verticesData,
    nVertices,
    nFrames,
    fps,
    meta: metaResponse,
  }
}

export async function loadSampleToScene(sampleId, sceneApi) {
  const isMocap = isMoCapSample(sampleId)
  store.status = 'Loading manifest'

  const manifest = await loadManifest(sampleId)
  const result = manifest.result

  store.modelInfo = {
    taskId: manifest.task_id,
    modelType: result.model_type,
    meshPath: result.output_paths.mesh,
    verticesCount: result.vertices_count || 0,
    facesCount: result.faces_count || 0,
  }

  if (!isMocap) {
    store.status = 'Loading mesh'
    const object = await loadObjMesh(result.output_paths.mesh)
    sceneApi.setObject(object)
    sceneApi.setRenderMode(store.renderMode)
    store.status = 'Loaded'
  }

  return { manifest, isMocap }
}
