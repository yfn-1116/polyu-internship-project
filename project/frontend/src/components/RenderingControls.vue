<template>
  <div class="card">
    <div class="card-header">
      <span class="card-icon">&#9671;</span>
      <h2 class="card-title">Render</h2>
    </div>

    <div class="control-row">
      <label class="control-label">Mode</label>
      <div class="btn-group">
        <button
          v-for="mode in modes"
          :key="mode.id"
          class="btn-sm"
          :class="{ active: store.renderMode === mode.id }"
          @click="store.renderMode = mode.id"
        >
          {{ mode.label }}
        </button>
      </div>
    </div>

    <div class="control-row">
      <label class="control-label">Light</label>
      <div class="btn-group">
        <button
          v-for="light in lights"
          :key="light.id"
          class="btn-sm"
          :class="{ active: store.lightingPreset === light.id }"
          @click="store.lightingPreset = light.id"
        >
          {{ light.label }}
        </button>
      </div>
    </div>

    <div class="control-row">
      <label class="control-label">Tools</label>
      <div class="btn-group">
        <button
          class="btn-sm"
          :class="{ active: store.showGrid }"
          @click="store.showGrid = !store.showGrid"
        >
          Grid
        </button>
        <button
          class="btn-sm"
          :class="{ active: store.showMeasurements }"
          @click="store.showMeasurements = !store.showMeasurements"
        >
          Measure
        </button>
        <button
          class="btn-sm"
          :class="{ active: store.compareMode }"
          @click="toggleCompare"
        >
          Compare
        </button>
      </div>
    </div>

    <div class="control-row">
      <button class="btn-action" @click="captureScreenshot">
        &#128247; Screenshot
      </button>
    </div>
  </div>
</template>

<script setup>
import { store } from '../stores/viewerStore.js'

const modes = [
  { id: 'solid', label: 'Solid' },
  { id: 'wireframe', label: 'Wire' },
  { id: 'xray', label: 'X-Ray' },
]

const lights = [
  { id: 'studio', label: 'Studio' },
  { id: 'bright', label: 'Bright' },
  { id: 'dim', label: 'Dim' },
]

function toggleCompare() {
  store.compareMode = !store.compareMode
  if (!store.compareMode) {
    store.compareSample = null
  } else if (!store.compareSample) {
    store.compareSample = store.activeSample
  }
}

function captureScreenshot() {
  const canvas = document.querySelector('canvas')
  if (!canvas) return
  const link = document.createElement('a')
  link.download = `smpl-screenshot-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
</script>
