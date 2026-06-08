<template>
  <section class="viewer-area">
    <div ref="container" class="viewer-container viewer-full"></div>
  </section>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { store, isMoCapSample } from '../stores/viewerStore.js'
import { useScene } from '../composables/useScene.js'
import { useAnimation } from '../composables/useAnimation.js'
import { loadSampleToScene, loadMoCapData } from '../composables/useModelLoader.js'

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

watch(() => store.activeSample, (id) => {
  loadSample(id)
})
</script>
