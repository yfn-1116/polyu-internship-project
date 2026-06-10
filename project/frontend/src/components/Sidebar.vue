<template>
  <aside class="sidebar">
    <div class="sidebar-inner">
      <ModelSelector />
      <ParameterPanel />
      <PlaybackControls v-if="isMocapSelected" />
      <ModelInfo />
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import ModelSelector from './ModelSelector.vue'
import ParameterPanel from './ParameterPanel.vue'
import PlaybackControls from './PlaybackControls.vue'
import ModelInfo from './ModelInfo.vue'
import { store, isMoCapSample } from '../stores/viewerStore.js'

const isMocapSelected = computed(() => isMoCapSample(store.activeSample))
</script>
