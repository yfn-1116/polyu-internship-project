/**
 * 3D 数字人 Avatar 类型定义
 *
 * 状态流转：
 *   idle → listening → thinking → speaking/talking → idle
 *                   ↘ gesture / walking
 */

/** 数字人动画状态 */
export type AvatarState =
  | 'idle'        // 待机：呼吸动画 / 微动
  | 'listening'   // 聆听：前倾 + 麦克风激活
  | 'thinking'    // 思考：点头 / 短暂停顿
  | 'talking'     // 回答：说话手势
  | 'gesture'     // 动作展示：挥手 / 讲解
  | 'walking'     // 行走

/** 数字人预设动作名称 */
export type AvatarAction =
  | 'idle'
  | 'wave'        // 挥手
  | 'explain'     // 讲解
  | 'think'       // 思考
  | 'walk'        // 行走
  | 'talk'        // 说话

/** 模型加载状态 */
export interface ModelLoadState {
  loaded: boolean
  loading: boolean
  error: string | null
  path: string
  animations: string[]           // 可用动画名称列表
}

/** 动画控制接口 */
export interface AnimationControl {
  name: string
  action: AvatarAction
  playing: boolean
  duration: number               // 秒
  currentTime: number            // 秒
}

/** WebSocket 消息 — 后端驱动数字人状态 */
export interface AvatarStateMessage {
  type: 'avatar_state'
  state: AvatarState
  action?: AvatarAction
  timestamp: number
}

/** WebSocket 消息 — 后端驱动动画 */
export interface AvatarAnimationMessage {
  type: 'avatar_animation'
  animation: string
  loop: boolean
  crossfadeDuration: number
  timestamp: number
}

/** WebSocket 消息 — SMPL-X 姿态参数 */
export interface SMPLXPoseMessage {
  type: 'smplx_pose'
  /** 55 个关节的旋转角 (axis-angle, 165 维展平) */
  poses: Float32Array | number[]
  /** 10 维体型 beta */
  betas?: number[]
  /** 3 维全局平移 */
  translation?: [number, number, number]
  timestamp: number
}

export type WsAvatarMessage =
  | AvatarStateMessage
  | AvatarAnimationMessage
  | SMPLXPoseMessage
