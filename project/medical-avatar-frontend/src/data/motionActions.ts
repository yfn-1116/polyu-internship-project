export interface MotionAction {
  id: string
  label: string
  tone: string
  basePath: string
}

export const motionActions: MotionAction[] = [
  { id: 'neutral', label: '平静', tone: '基础站姿', basePath: '/sample-mocap-neutral' },
  { id: 'happy', label: '开心', tone: '积极回应', basePath: '/sample-mocap-happy' },
  { id: 'relaxed', label: '放松', tone: '康复舒缓', basePath: '/sample-mocap-relaxed' },
  { id: 'pleased', label: '满意', tone: '正向反馈', basePath: '/sample-mocap-pleased' },
  { id: 'excited', label: '兴奋', tone: '活跃演示', basePath: '/sample-mocap-excited' },
  { id: 'tired', label: '疲惫', tone: '疲劳状态', basePath: '/sample-mocap-tired' },
  { id: 'sad', label: '悲伤', tone: '低落状态', basePath: '/sample-mocap-sad' },
  { id: 'angry', label: '生气', tone: '情绪演示', basePath: '/sample-mocap-angry' },
  { id: 'afraid', label: '害怕', tone: '风险反应', basePath: '/sample-mocap-afraid' },
  { id: 'bored', label: '无聊', tone: '低活跃度', basePath: '/sample-mocap-bored' },
]

export const defaultMotionAction = motionActions[0]
