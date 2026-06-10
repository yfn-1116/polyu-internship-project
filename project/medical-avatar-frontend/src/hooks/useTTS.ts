/**
 * useTTS — 浏览器文字转语音 Hook
 *
 * 使用 Web Speech API (SpeechSynthesis) 朗读文字。
 * 支持中文语音，自动选择最佳可用语音。
 *
 * 扩展方向：
 *  - 接入千问 DashScope TTS API（自然度更高）
 *  - 接入 Web Audio API 做口型同步
 */

import { useCallback, useRef } from 'react'

/** 选择最佳中文语音 */
function getBestVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  // 优先级：中文普通话 → 中文 → 任何中文
  const preferred = voices.find(
    (v) => v.lang.startsWith('zh-CN') || v.lang.startsWith('zh-TW') || v.lang.startsWith('zh-HK')
  )
  if (preferred) return preferred

  // 回退：任何包含 "zh" 的
  return voices.find((v) => v.lang.includes('zh')) ?? voices[0] ?? null
}

export function useTTS() {
  const speakingRef = useRef(false)

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      console.warn('[TTS] SpeechSynthesis not supported')
      return
    }

    // 停止当前朗读
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 0.9

    const voice = getBestVoice()
    if (voice) utterance.voice = voice

    utterance.onstart = () => { speakingRef.current = true }
    utterance.onend = () => { speakingRef.current = false }
    utterance.onerror = () => { speakingRef.current = false }

    window.speechSynthesis.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    speakingRef.current = false
  }, [])

  const isSpeaking = () => speakingRef.current

  return { speak, stop, isSpeaking }
}
