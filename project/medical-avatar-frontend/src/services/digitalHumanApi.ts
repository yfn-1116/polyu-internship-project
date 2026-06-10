import type { MedicalResponse } from '../types/digitalHuman'
import { getMockResponse } from '../data/mockMedicalResponses'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export interface ChatRequest {
  message: string
  mode: 'text' | 'voice'
  patientId?: string
}

export async function sendMessage(req: ChatRequest): Promise<MedicalResponse> {
  if (!API_BASE) {
    // Mock mode — no real backend yet
    return new Promise((resolve) => {
      setTimeout(() => resolve(getMockResponse(req.message)), 1200)
    })
  }

  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
