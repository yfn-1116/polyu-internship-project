<template>
  <div class="card">
    <div class="card-header">
      <span class="card-icon">&#9881;</span>
      <h2 class="card-title">参数调整</h2>
    </div>

    <!-- 体型 -->
    <div class="control-row">
      <label class="control-label">体型</label>
      <div v-for="s in shapeSliders" :key="s.key" class="slider-row">
        <span class="slider-label">{{ s.label }}</span>
        <input type="range" :min="s.min" :max="s.max" :step="0.1"
          :value="shape[s.key]" @input="setShape(s.key, $event.target.value)" />
        <span class="slider-val">{{ shape[s.key].toFixed(1) }}</span>
      </div>
    </div>

    <!-- 姿态 -->
    <div class="control-row">
      <label class="control-label">姿态</label>
      <div v-for="p in poseSliders" :key="p.key" class="slider-row">
        <span class="slider-label">{{ p.label }}</span>
        <input type="range" :min="p.min" :max="p.max" :step="0.05"
          :value="poseParams[p.key]" @input="setPose(p.key, $event.target.value)" />
        <span class="slider-val">{{ poseParams[p.key].toFixed(2) }}</span>
      </div>
    </div>

    <div v-if="loading" style="font-size:12px;color:#64748b">生成中...</div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useSMPLXAPI } from '../composables/useSMPLXAPI.js'
import { updateInteractiveMesh } from '../stores/viewerStore.js'

const { debouncedGenerate, loading } = useSMPLXAPI()

const shape = reactive({
  height: 0.0, weight: 0.0, shoulder: 0.0, waist: 0.0, hip: 0.0,
})

const poseParams = reactive({
  leftArm: 0.0, rightArm: 0.0,
  leftLeg: 0.0, rightLeg: 0.0,
  spine: 0.0, head: 0.0,
})

const shapeSliders = [
  { key: 'height', label: '身高', min: -3, max: 3 },
  { key: 'weight', label: '体重', min: -3, max: 3 },
  { key: 'shoulder', label: '肩宽', min: -2, max: 2 },
  { key: 'waist', label: '腰围', min: -2, max: 2 },
  { key: 'hip', label: '臀围', min: -2, max: 2 },
]

const poseSliders = [
  { key: 'leftArm', label: '左臂', min: -1.5, max: 1.5 },
  { key: 'rightArm', label: '右臂', min: -1.5, max: 1.5 },
  { key: 'leftLeg', label: '左腿', min: -1.0, max: 1.0 },
  { key: 'rightLeg', label: '右腿', min: -1.0, max: 1.0 },
  { key: 'spine', label: '脊柱', min: -0.8, max: 0.8 },
  { key: 'head', label: '头部', min: -0.8, max: 0.8 },
]

// Pose slider → body_pose index mapping
const POSE_MAP = {
  leftArm: 16, rightArm: 17, leftLeg: 1, rightLeg: 2,
  spine: 3, head: 15,
}

function buildBodyPose() {
  const pose = new Array(63).fill(0.0)
  for (const [key, jointIdx] of Object.entries(POSE_MAP)) {
    pose[jointIdx * 3 + 2] = parseFloat(poseParams[key])  // z-axis rotation
  }
  return pose
}

function requestMesh() {
  const body_pose = buildBodyPose()
  debouncedGenerate({
    height: Number(shape.height),
    weight: Number(shape.weight),
    shoulder: Number(shape.shoulder),
    waist: Number(shape.waist),
    hip: Number(shape.hip),
    body_pose,
    gender: 'neutral',
  }, (result) => {
    updateInteractiveMesh(result)
  })
}

function setShape(key, val) {
  shape[key] = parseFloat(val)
  requestMesh()
}

function setPose(key, val) {
  poseParams[key] = parseFloat(val)
  requestMesh()
}
</script>
