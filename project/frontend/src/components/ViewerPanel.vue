<template>
  <section class="viewer-area">
    <div ref="container" class="viewer-container viewer-full"></div>
  </section>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { store, isMoCapSample, interactiveMesh } from '../stores/viewerStore.js'
import { useScene } from '../composables/useScene.js'
import { useAnimation } from '../composables/useAnimation.js'
import { loadSampleToScene, loadMoCapData, applyMeshMaterial } from '../composables/useModelLoader.js'
import * as THREE from 'three'

const container = ref(null)

let sceneApi = null
let animFrameId = null
let lastTime = 0
const mocapCache = {}
const anim = useAnimation()

function animate(time) {
  const dt = lastTime ? (time - lastTime) / 1000 : 0.016
  lastTime = time
  anim.tick(dt)
  if (sceneApi) sceneApi.tick()
  animFrameId = requestAnimationFrame(animate)
}

async function loadSample(id) {
  anim.stop()
  store.isAnimating = false

  if (isMoCapSample(id)) {
    await loadMocapToScene(id)
  } else {
    await loadSampleToScene(id, sceneApi)
  }
}

async function loadMocapToScene(sampleId) {
  store.status = '加载动画中'

  const emotion = sampleId.replace('mocap', '').toLowerCase()
  const basePath = `/sample-mocap-${emotion}`

  const manifest = await (await fetch(`${basePath}/manifest.json`)).json()
  const result = manifest.result
  store.modelInfo = {
    taskId: manifest.task_id,
    modelType: `${result.model_type} (动作捕捉)`,
    meshPath: result.output_paths.mesh,
    verticesCount: 10475,
    facesCount: 20908,
  }

  if (!mocapCache[sampleId]) {
    mocapCache[sampleId] = await loadMoCapData(basePath)
  }
  const data = mocapCache[sampleId]

  sceneApi.setObject(data.mesh)

  anim.createPlayer(data.mesh, data.verticesData, data.nVertices, data.nFrames, data.fps)
  store.animTotalFrames = data.nFrames - 1
  anim.play()
  store.isAnimating = true
  store.status = `${data.meta.emotion} · ${data.nFrames} 帧`
}

onMounted(() => {
  sceneApi = useScene(container)
  sceneApi.mount()
  loadSample(store.activeSample)
  lastTime = performance.now()
  animate(lastTime)
})

onUnmounted(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId)
})

// Watch interactive parameter changes
let interactiveObject = null

watch(() => interactiveMesh.version, () => {
  if (!sceneApi || !interactiveMesh.vertices) return

  anim.stop()
  store.isAnimating = false
  store.status = '参数模式'

  if (interactiveObject) {
    // Update existing mesh vertices only
    const posAttr = interactiveObject.geometry.attributes.position
    posAttr.array.set(interactiveMesh.vertices)
    posAttr.needsUpdate = true
    interactiveObject.geometry.computeVertexNormals()
  } else {
    // First time: create mesh from scratch
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(interactiveMesh.vertices.slice(), 3))
    const faceArr = []
    for (const f of interactiveMesh.faces || [[0, 1, 2]]) faceArr.push(f[0], f[1], f[2])
    geo.setIndex(new THREE.BufferAttribute(new Uint32Array(faceArr), 1))
    geo.computeVertexNormals()

    const mat = new THREE.MeshStandardMaterial({
      color: 0x7c9cbf, roughness: 0.55, metalness: 0.05, side: THREE.DoubleSide,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.castShadow = true
    mesh.receiveShadow = true

    sceneApi.setObject(mesh)
    interactiveObject = mesh
  }

  store.modelInfo = {
    taskId: 'interactive',
    modelType: 'SMPL-X (交互)',
    meshPath: '-',
    verticesCount: interactiveMesh.vCount,
    facesCount: interactiveMesh.fCount,
  }
})

watch(() => store.activeSample, (id) => {
  interactiveObject = null
  anim.stop()
  store.isAnimating = false
  loadSample(id)
})
</script>
