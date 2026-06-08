import { reactive } from 'vue'

export const SAMPLES = {
  thuman: '/sample-thuman/manifest.json',
  smplxDefault: '/sample-smplx-default/manifest.json',
  smplxSlim: '/sample-smplx-slim/manifest.json',
  smplxBroad: '/sample-smplx-broad/manifest.json',
  smplxTall: '/sample-smplx-tall/manifest.json',
  mocapHappy: '/sample-mocap-happy/manifest.json',
  mocapAngry: '/sample-mocap-angry/manifest.json',
  mocapSad: '/sample-mocap-sad/manifest.json',
  mocapNeutral: '/sample-mocap-neutral/manifest.json',
  mocapExcited: '/sample-mocap-excited/manifest.json',
  mocapAfraid: '/sample-mocap-afraid/manifest.json',
  mocapAnnoyed: '/sample-mocap-annoyed/manifest.json',
  mocapBored: '/sample-mocap-bored/manifest.json',
  mocapMiserable: '/sample-mocap-miserable/manifest.json',
  mocapPleased: '/sample-mocap-pleased/manifest.json',
  mocapRelaxed: '/sample-mocap-relaxed/manifest.json',
  mocapSatisfied: '/sample-mocap-satisfied/manifest.json',
  mocapTired: '/sample-mocap-tired/manifest.json',
}

export const SAMPLE_GROUPS = [
  {
    label: '静态模型',
    key: 'static',
    items: [
      { id: 'thuman', label: 'THuman 扫描' },
      { id: 'smplxDefault', label: '默认体型' },
      { id: 'smplxSlim', label: '偏瘦' },
      { id: 'smplxBroad', label: '偏壮' },
      { id: 'smplxTall', label: '偏高' },
    ],
  },
  {
    label: '动作捕捉动画',
    key: 'mocap',
    items: [
      { id: 'mocapHappy', label: '开心' },
      { id: 'mocapAngry', label: '愤怒' },
      { id: 'mocapSad', label: '悲伤' },
      { id: 'mocapNeutral', label: '中性' },
      { id: 'mocapExcited', label: '兴奋' },
      { id: 'mocapAfraid', label: '害怕' },
      { id: 'mocapAnnoyed', label: '烦躁' },
      { id: 'mocapBored', label: '无聊' },
      { id: 'mocapMiserable', label: '痛苦' },
      { id: 'mocapPleased', label: '满意' },
      { id: 'mocapRelaxed', label: '放松' },
      { id: 'mocapSatisfied', label: '满足' },
      { id: 'mocapTired', label: '疲惫' },
    ],
  },
]

export const store = reactive({
  activeSample: 'thuman',
  status: '就绪',
  modelInfo: {
    taskId: '-',
    modelType: '-',
    meshPath: '-',
    verticesCount: 0,
    facesCount: 0,
  },
  isAnimating: false,
  animFrame: 0,
  animTotalFrames: 0,
  animSpeed: 1.0,
})

export function isMoCapSample(id) {
  return id.startsWith('mocap')
}
