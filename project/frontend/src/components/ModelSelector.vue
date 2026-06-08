<template>
  <div class="card">
    <div class="card-header">
      <span class="card-icon">&#9783;</span>
      <h2 class="card-title">Models</h2>
    </div>

    <div v-for="group in SAMPLE_GROUPS" :key="group.key" class="model-group">
      <h3 class="group-label">{{ group.label }}</h3>
      <div class="model-grid">
        <button
          v-for="item in group.items"
          :key="item.id"
          class="model-btn"
          :class="{
            active: store.activeSample === item.id,
            mocap: group.key === 'mocap',
          }"
          @click="selectSample(item.id)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <div v-if="store.compareMode" class="compare-section">
      <hr class="divider" />
      <h3 class="group-label">Compare (Right)</h3>
      <div class="model-grid">
        <button
          v-for="item in allItems"
          :key="'cmp-' + item.id"
          class="model-btn"
          :class="{ active: store.compareSample === item.id }"
          @click="selectCompare(item.id)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { store, SAMPLE_GROUPS, isMoCapSample } from '../stores/viewerStore.js'

const allItems = SAMPLE_GROUPS.flatMap((g) => g.items)

function selectSample(id) {
  store.activeSample = id
}

function selectCompare(id) {
  store.compareSample = id
}
</script>
