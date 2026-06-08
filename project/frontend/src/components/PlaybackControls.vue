<template>
  <div class="card">
    <div class="card-header">
      <span class="card-icon">&#9654;</span>
      <h2 class="card-title">播放控制</h2>
    </div>

    <div class="playback-row">
      <button class="btn-play" @click="anim.toggle()">
        {{ store.isAnimating ? '⏸' : '▶' }}
      </button>
      <select class="ctrl-select" :value="store.animSpeed" @change="anim.setSpeed($event.target.value)">
        <option value="0.5">0.5x</option>
        <option value="1">1x</option>
        <option value="2">2x</option>
      </select>
    </div>

    <div class="seek-row">
      <input
        type="range"
        class="seek-bar"
        min="0"
        :max="store.animTotalFrames || 100"
        :value="store.animFrame"
        @input="anim.seek($event.target.value)"
      />
    </div>

    <div class="playback-info">
      <span>帧 {{ store.animFrame }} / {{ store.animTotalFrames }}</span>
    </div>
  </div>
</template>

<script setup>
import { store } from '../stores/viewerStore.js'
import { useAnimation } from '../composables/useAnimation.js'

const anim = useAnimation()
</script>
