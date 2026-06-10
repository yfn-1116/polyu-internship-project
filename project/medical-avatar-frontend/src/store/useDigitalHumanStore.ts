import { create } from 'zustand'
import type { AvatarState, RiskLevel, MedicalCard, ConversationTurn } from '../types/digitalHuman'

export type { AvatarState, RiskLevel, MedicalCard, ConversationTurn }

export interface DigitalHumanState {
  avatarState: AvatarState
  currentQuestion: string
  currentAnswer: string
  subtitle: string
  subtitleIndex: number
  riskLevel: RiskLevel
  suggestedDepartments: string[]
  knowledgeSources: string[]
  cards: MedicalCard[]
  isRecording: boolean
  isThinking: boolean
  conversationHistory: ConversationTurn[]
  skinPreset: string | null

  setAvatarState: (state: AvatarState) => void
  setQuestion: (q: string) => void
  setAnswer: (a: string) => void
  setSubtitle: (s: string) => void
  setSubtitleIndex: (i: number) => void
  setRiskLevel: (r: RiskLevel) => void
  setSuggestedDepartments: (d: string[]) => void
  setKnowledgeSources: (s: string[]) => void
  setCards: (c: MedicalCard[]) => void
  setRecording: (r: boolean) => void
  setThinking: (t: boolean) => void
  addConversationTurn: (turn: ConversationTurn) => void
  setSkinPreset: (p: string | null) => void
  reset: () => void
}

const initialState = {
  avatarState: 'idle' as AvatarState,
  currentQuestion: '',
  currentAnswer: '',
  subtitle: '您好，我是您的AI医疗助手，请问有什么可以帮您？',
  subtitleIndex: 0,
  riskLevel: 'low' as RiskLevel,
  suggestedDepartments: [] as string[],
  knowledgeSources: [] as string[],
  cards: [] as MedicalCard[],
  isRecording: false,
  isThinking: false,
  conversationHistory: [] as ConversationTurn[],
  skinPreset: null as string | null,
}

export const useDigitalHumanStore = create<DigitalHumanState>((set) => ({
  ...initialState,

  setAvatarState: (s) => set({ avatarState: s }),
  setQuestion: (q) => set({ currentQuestion: q }),
  setAnswer: (a) => set({ currentAnswer: a }),
  setSubtitle: (s) => set({ subtitle: s }),
  setSubtitleIndex: (i) => set({ subtitleIndex: i }),
  setRiskLevel: (r) => set({ riskLevel: r }),
  setSuggestedDepartments: (d) => set({ suggestedDepartments: d }),
  setKnowledgeSources: (s) => set({ knowledgeSources: s }),
  setCards: (c) => set({ cards: c }),
  setRecording: (r) => set({ isRecording: r }),
  setThinking: (t) => set({ isThinking: t }),
  addConversationTurn: (turn) =>
    set((state) => ({ conversationHistory: [...state.conversationHistory, turn] })),
  setSkinPreset: (p) => set({ skinPreset: p }),
  reset: () => set(initialState),
}))
