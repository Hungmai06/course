import { useCallback, useState } from 'react'
import { speakText } from '../utils/tts'

export default function Flashcard({ word }) {
  const [flipped, setFlipped] = useState(false)

  const speakWord = useCallback((event) => {
    event.stopPropagation()

    if (!word) return
    // speak using centralized helper which picks a consistent voice when available
    speakText(word.word, { lang: 'en-US', rate: 0.85 })
  }, [word])

  if (!word) return null

  const pronunciation = word.pronunciation ?? ''

  return (
    <div className="flashcard-wrap">
      <div
        role="button"
        tabIndex={0}
        className={`flip-card ${flipped ? 'is-flipped' : ''}`}
        onClick={() => setFlipped((s) => !s)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setFlipped((s) => !s)
        }}
        aria-pressed={flipped}
      >
        <div className="flip-card-inner">
          <div className="flip-card-front">
            <div className="flashcard-topline">
              <span className="flashcard-tag">Thuật ngữ</span>
              <button type="button" className="flashcard-listen" onClick={speakWord}>
                Nghe
              </button>
            </div>

            <div className="flashcard-main">
              <div className="flashcard-word">{word.word}</div>

              {pronunciation ? (
                <div className="flashcard-pron">{pronunciation}</div>
              ) : (
                <div className="flashcard-pron flashcard-pron-empty">Nhấn Nghe để luyện phát âm</div>
              )}
            </div>

            <div className="flashcard-hint">Chạm hoặc nhấn Enter để lật thẻ</div>
          </div>

          <div className="flip-card-back">
            <div className="flashcard-topline">
              <span className="flashcard-back-badge">Nghĩa</span>
              <button type="button" className="flashcard-replay" onClick={speakWord}>
                Nghe lại
              </button>
            </div>

            <div className="flashcard-back-content">
              <div className="flashcard-meaning">{word.meaning}</div>

              {word.example && (
                <>
                  <div className="flashcard-example-label">Ví dụ</div>
                  <div className="flashcard-example">{word.example}</div>
                  {word.exampleMeaning && (
                    <div className="flashcard-example-meaning">{word.exampleMeaning}</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
