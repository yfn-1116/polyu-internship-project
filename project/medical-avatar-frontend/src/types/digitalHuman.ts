export type AvatarState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'talking'
  | 'guiding'
  | 'warning'
  | 'rehab'
  | 'gesture'
  | 'walking'

export type RiskLevel = 'low' | 'medium' | 'high'

export interface MedicalCard {
  title: string
  content: string
}

export interface MedicalResponse {
  answer: string
  subtitle: string
  avatarState: AvatarState
  gesture?: string
  riskLevel: RiskLevel
  suggestedDepartments: string[]
  knowledgeSources: string[]
  cards: MedicalCard[]
  audioUrl?: string
  animation?: string
}

export interface ConversationTurn {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: number
}
