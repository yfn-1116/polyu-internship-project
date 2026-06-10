/**
 * Avatar 控制 API 服务封装
 *
 * === 当前模式：Mock ===
 * 所有请求返回 mock 数据。
 *
 * === 切换到真实后端 ===
 * 设置环境变量 VITE_API_BASE=http://localhost:8001
 *
 * === WebSocket 连接 ===
 * 设置环境变量 VITE_WS_URL=ws://localhost:8001/ws/avatar
 * 用于接收后端实时驱动的数字人状态、动画和 SMPL-X 姿态参数。
 *
 * === SMPL-X 对接说明 ===
 * 1. 后端将 SMPL-X mesh 导出为 GLB/glTF（推荐用 trimesh 或 blender Python API）
 * 2. 将导出的 .glb 文件放入 public/models/avatar.glb
 * 3. 前端 AvatarModel 组件自动加载并展示
 * 4. 如需实时驱动，后端通过 WebSocket 发送 SMPLXPoseMessage
 *    前端收到后逐帧更新骨骼 / morph target
 */

import type { AvatarAction } from '../types/avatar'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''
const WS_URL = import.meta.env.VITE_WS_URL ?? ''

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** 发送动作指令 */
export async function sendAvatarAction(action: AvatarAction): Promise<{
  success: boolean
  action: AvatarAction
}> {
  if (!API_BASE) {
    await delay(200)
    return { success: true, action }
  }
  const res = await fetch(`${API_BASE}/api/avatar/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  })
  if (!res.ok) throw new Error(`Avatar action error: ${res.status}`)
  return res.json()
}

/**
 * 创建 WebSocket 连接（预留）
 * 后续用于实时数字人驱动
 *
 * 消息类型：
 * - avatar_state   : 后端切换数字人状态
 * - avatar_animation : 后端触发动画
 * - smplx_pose     : 后端推送 SMPL-X 实时姿态参数
 */
export function createAvatarWebSocket(
  onMessage: (data: unknown) => void,
  onError?: (err: Event) => void,
): WebSocket | null {
  if (!WS_URL) {
    console.log('[AvatarWS] No WS_URL configured, WebSocket disabled')
    return null
  }

  const ws = new WebSocket(WS_URL)

  ws.onopen = () => {
    console.log('[AvatarWS] Connected:', WS_URL)
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      onMessage(data)
    } catch {
      console.warn('[AvatarWS] Failed to parse message:', event.data)
    }
  }

  ws.onerror = (err) => {
    console.error('[AvatarWS] Error:', err)
    onError?.(err)
  }

  ws.onclose = () => {
    console.log('[AvatarWS] Disconnected')
  }

  return ws
}
