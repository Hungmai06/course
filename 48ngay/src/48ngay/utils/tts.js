function prefers(voiceName) {
  if (!voiceName) return 0
  const name = voiceName.toLowerCase()
  // prefer Google / Neural / enhanced system voices first
  if (name.includes('google') || name.includes('neural') || name.includes('wave')) return 4
  if (name.includes('female') || name.includes('woman')) return 3
  if (name.includes('male') || name.includes('man')) return 2
  return 1
}

function findBestVoice(voices, langPrefix, preferredGender = 'female') {
  if (!voices || voices.length === 0) return null
  const candidates = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith(langPrefix.toLowerCase()))
  const pool = candidates.length === 0 ? voices : candidates

  // scoring: prefers(...) + bonus for matching preferredGender in name
  const genderKeywords = {
    female: ['female', 'woman', 'lady', 'girl'],
    male: ['male', 'man', 'guy', 'boy'],
  }

  pool.sort((a, b) => {
    const aScore = prefers(a.name) + (genderKeywords[preferredGender]?.some((k) => a.name.toLowerCase().includes(k)) ? 2 : 0)
    const bScore = prefers(b.name) + (genderKeywords[preferredGender]?.some((k) => b.name.toLowerCase().includes(k)) ? 2 : 0)
    return bScore - aScore
  })

  return pool[0]
}

export function speakText(text, opts = {}) {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) return

  const { lang = 'en-US', rate = 0.9, pitch = 1, preferGender = 'female' } = opts

  // Tạo utterance trong hàm doSpeak để tránh bị dùng lại sau cancel()
  function doSpeak(voices) {
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = lang
    utter.rate = rate
    utter.pitch = pitch

    const best = findBestVoice(voices, lang, preferGender)
    if (best) utter.voice = best

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  const voices = window.speechSynthesis.getVoices()

  if (voices && voices.length > 0) {
    // Voices đã sẵn sàng → đọc ngay
    doSpeak(voices)
    return
  }

  // Voices chưa load — dùng voiceschanged event
  let handled = false

  const handler = () => {
    if (handled) return
    handled = true
    window.speechSynthesis.removeEventListener('voiceschanged', handler)
    doSpeak(window.speechSynthesis.getVoices() || [])
  }

  window.speechSynthesis.addEventListener('voiceschanged', handler)

  // Fallback polling cho iOS Safari (không bao giờ fire voiceschanged)
  // Thử lại mỗi 100ms, tối đa 20 lần (= 2 giây)
  let attempts = 0
  const poll = setInterval(() => {
    attempts++
    const v = window.speechSynthesis.getVoices()
    if ((v && v.length > 0) || attempts >= 20) {
      clearInterval(poll)
      if (!handled) {
        handled = true
        window.speechSynthesis.removeEventListener('voiceschanged', handler)
        doSpeak(v || [])
      }
    }
  }, 100)
}

export function listAvailableVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return []
  return window.speechSynthesis.getVoices()
}

export default { speakText, listAvailableVoices }
