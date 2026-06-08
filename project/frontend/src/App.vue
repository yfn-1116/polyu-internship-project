<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-left">
        <span class="brand-icon">&#9670;</span>
        <h1 class="brand-title">SMPL Viewer</h1>
        <span class="brand-badge">MVP</span>
      </div>
      <div class="header-right">
        <span class="status-dot" :class="statusClass"></span>
        <span class="status-text">{{ store.status }}</span>
      </div>
    </header>
    <div class="app-body">
      <Sidebar />
      <ViewerPanel />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Sidebar from './components/Sidebar.vue'
import ViewerPanel from './components/ViewerPanel.vue'
import { store } from './stores/viewerStore.js'

const statusClass = computed(() => {
  if (store.status.includes('加载')) return 'status-loading'
  if (store.status.includes('失败') || store.status.includes('错误')) return 'status-error'
  return 'status-ok'
})
</script>
