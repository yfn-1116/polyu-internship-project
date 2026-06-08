<template>
  <div class="card">
    <div class="card-header">
      <span class="card-icon">&#9432;</span>
      <h2 class="card-title">模型信息</h2>
    </div>

    <dl class="info-list">
      <div class="info-row">
        <dt>任务</dt>
        <dd>{{ store.modelInfo.taskId }}</dd>
      </div>
      <div class="info-row">
        <dt>类型</dt>
        <dd>{{ store.modelInfo.modelType }}</dd>
      </div>
      <div v-if="store.modelInfo.verticesCount" class="info-row">
        <dt>顶点</dt>
        <dd>{{ store.modelInfo.verticesCount.toLocaleString() }}</dd>
      </div>
      <div v-if="store.modelInfo.facesCount" class="info-row">
        <dt>面片</dt>
        <dd>{{ store.modelInfo.facesCount.toLocaleString() }}</dd>
      </div>
    </dl>
  </div>
</template>

<script setup>
import { store } from '../stores/viewerStore.js'
</script>
