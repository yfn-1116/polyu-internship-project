import { ref } from 'vue'

const API_BASE = 'http://localhost:8000'

export function useSMPLXAPI() {
  const loading = ref(false)
  const error = ref(null)
  let timer = null

  async function generate(params) {
    error.value = null
    loading.value = true
    try {
      const res = await fetch(`${API_BASE}/api/smplx/generate-semantic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (!res.ok) throw new Error(`API ${res.status}`)
      return await res.json()
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  function debouncedGenerate(params, callback, delay = 100) {
    clearTimeout(timer)
    timer = setTimeout(async () => {
      const result = await generate(params)
      if (result && callback) callback(result)
    }, delay)
  }

  return { generate, debouncedGenerate, loading, error }
}
