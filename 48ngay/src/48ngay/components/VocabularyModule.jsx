import { useState, useCallback, useRef, useEffect } from 'react'
import { LESSON_STATUS, setDayStatus, isVocabLearned } from '../services/courseService'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Flashcard from './Flashcard'
import { speakText } from '../utils/tts'

const PHONETIC_MAP = {
  foundation: '/faʊnˈdeɪʃən/',
  habit: '/ˈhæbɪt/',
  review: '/rɪˈvjuː/',
  confidence: '/ˈkɑːnfɪdəns/',
}

function enrichWord(word) {
  if (!word) return null
  const key = String(word.word || '').trim().toLowerCase()
  return {
    ...word,
    pronunciation: word.pronunciation ?? word.phonetic ?? PHONETIC_MAP[key] ?? '',
    meaning: word.meaning ?? '',
    example: word.example ?? '',
    exampleMeaning: word.exampleMeaning ?? word.exampleVi ?? '',
  }
}

function buildLeftItems(words) {
  return words.map((item) => {
    const word = enrichWord(item)
    return {
      id: word.id,
      word: word.word,
      pronunciation: word.pronunciation,
    }
  })
}

function buildRightItems(words) {
  return words
    .map((item) => {
      const word = enrichWord(item)
      return {
        id: word.id,
        meaning: word.meaning,
      }
    })
    .sort(() => Math.random() - 0.5)
}

function buildListenOptions(words, targetIndex) {
  const correct = enrichWord(words[targetIndex])
  const others = words
    .map((w, i) => (i === targetIndex ? null : enrichWord(w)))
    .filter(Boolean)

  // Shuffle others (Fisher-Yates)
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[others[i], others[j]] = [others[j], others[i]]
  }

  const limit = Math.min(3, others.length)
  const picked = []
  const seen = new Set()
  // mark correct as seen (use id when available, otherwise lowercase word)
  seen.add(correct.id ?? (String(correct.word || '').toLowerCase()))

  for (let i = 0; i < others.length && picked.length < limit; i++) {
    const candidate = others[i]
    const key = candidate.id ?? (String(candidate.word || '').toLowerCase())
    if (!seen.has(key)) {
      picked.push(candidate)
      seen.add(key)
    }
  }

  return [correct, ...picked].sort(() => Math.random() - 0.5)
}

function VocabularyModule({ day, words }) {
  const [cardIndex, setCardIndex] = useState(0)
  const [selected, setSelected] = useState('')
  const [feedback, setFeedback] = useState('')
  const [state, setState] = useLocalStorage(`english48.vocab.day${day}`, {
    learned: false,
    quizScore: 0,
  })
  const [mode, setMode] = useState('flashcard') // flashcard | select | listen
  const [listenTarget, setListenTarget] = useState(null)
  const [listenComplete, setListenComplete] = useState(false)
  const [listenIndex, setListenIndex] = useState(0)
  const [listenOptions, setListenOptions] = useState(() => buildListenOptions(words, 0))
  const [listenResult, setListenResult] = useState({ status: '', choice: '' })
  const [leftItems, setLeftItems] = useState(() => buildLeftItems(words))
  const [rightItems, setRightItems] = useState(() => buildRightItems(words))
  const [pairs, setPairs] = useState({})
  const [selectedLeft, setSelectedLeft] = useState(null)
  const [selectedRight, setSelectedRight] = useState(null)
  const [wrongPair, setWrongPair] = useState(null)
  const wrongPairTimerRef = useRef(null)
  const listenAdvanceTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (wrongPairTimerRef.current) {
        clearTimeout(wrongPairTimerRef.current)
      }

      if (listenAdvanceTimerRef.current) {
        clearTimeout(listenAdvanceTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    async function syncLearnedStatus() {
      const learned = await isVocabLearned(day)
      if (learned) {
        setState((prev) => ({ ...prev, learned: true }))
      }
    }
    syncLearnedStatus()
  }, [day, setState])

  const currentCard = enrichWord(words[cardIndex])
  const currentListenWord = enrichWord(words[listenIndex])

  const nextCard = () => {
    setCardIndex((prev) => (prev + 1) % words.length)
  }

  const speakWord = useCallback((text) => {
    speakText(text, { lang: 'en-US', rate: 0.85 })
  }, [])

  const startListenExercise = () => {
    if (listenAdvanceTimerRef.current) {
      clearTimeout(listenAdvanceTimerRef.current)
      listenAdvanceTimerRef.current = null
    }

    setListenTarget(0)
    setListenIndex(0)
    setListenOptions(buildListenOptions(words, 0))
    setListenComplete(false)
    setListenResult({ status: '', choice: '' })
    setSelected('')
    setFeedback('')
    setMode('listen')
    speakWord(enrichWord(words[0]).word)
  }

  function handleLeftClick(id) {
    if (pairs[id]) return // already matched as right value
    if (selectedLeft === id) {
      setSelectedLeft(null)
      return
    }
    setSelectedLeft(id)
    // if right already selected, try pair
    if (selectedRight) {
      attemptPair(id, selectedRight)
      setSelectedLeft(null)
      setSelectedRight(null)
    }
  }

  function handleRightClick(id) {
    if (Object.values(pairs).includes(id)) return // already matched
    if (selectedRight === id) {
      setSelectedRight(null)
      return
    }
    setSelectedRight(id)
    if (selectedLeft) {
      attemptPair(selectedLeft, id)
      setSelectedLeft(null)
      setSelectedRight(null)
    }
  }

  function attemptPair(leftId, rightId) {
    // find actual left word object and right meaning
    const left = leftItems.find((l) => l.id === leftId)
    const right = rightItems.find((r) => r.id === rightId)
    if (!left || !right) return

    const isCorrect = leftId === rightId

    if (wrongPairTimerRef.current) {
      clearTimeout(wrongPairTimerRef.current)
      wrongPairTimerRef.current = null
    }

    if (isCorrect) {
      setWrongPair(null)
      setPairs((prev) => ({ ...prev, [leftId]: rightId }))
      return
    }

    setWrongPair({ leftId, rightId })
    wrongPairTimerRef.current = setTimeout(() => {
      setWrongPair(null)
      wrongPairTimerRef.current = null
    }, 900)
  }

  function resetPairs() {
    setPairs({})
    setSelectedLeft(null)
    setSelectedRight(null)
    setWrongPair(null)
    setLeftItems(buildLeftItems(words))
    setRightItems(buildRightItems(words))
  }

  const restartListenExercise = () => {
    if (listenAdvanceTimerRef.current) {
      clearTimeout(listenAdvanceTimerRef.current)
      listenAdvanceTimerRef.current = null
    }

    setListenTarget(0)
    setListenIndex(0)
    setListenOptions(buildListenOptions(words, 0))
    setListenComplete(false)
    setListenResult({ status: '', choice: '' })
    setSelected('')
    setFeedback('')
    setMode('listen')
    speakWord(enrichWord(words[0]).word)
  }

  const selectListenAnswer = (choice) => {
    if (listenComplete || !currentListenWord) return

    setSelected(choice)
    setFeedback('')

    if (choice !== currentListenWord.word) {
      setListenResult({ status: 'wrong', choice })
      return
    }

    setListenResult({ status: 'correct', choice })

    const isLastWord = listenIndex >= words.length - 1

    if (isLastWord) {
      setFeedback('Bạn đã hoàn thành phần nghe và chọn.')
      setListenComplete(true)
      setState((prev) => ({ ...prev, learned: true }))
      setDayStatus(day, LESSON_STATUS.COMPLETED, true)
      return
    }

    if (listenAdvanceTimerRef.current) {
      clearTimeout(listenAdvanceTimerRef.current)
    }

    listenAdvanceTimerRef.current = setTimeout(() => {
      const nextIndex = listenIndex + 1
      setListenIndex(nextIndex)
      setListenTarget(nextIndex)
      setListenOptions(buildListenOptions(words, nextIndex))
      setSelected('')
      setFeedback('')
      setListenResult({ status: '', choice: '' })
      speakWord(enrichWord(words[nextIndex]).word)
    }, 450)
  }

  const checkListenAnswer = () => {
    if (listenComplete || !currentListenWord || !selected) return

    const isCorrect = selected === currentListenWord.word

    if (!isCorrect) {
      setListenResult({ status: 'wrong', choice: selected })
      setFeedback(`Sai. Đáp án đúng: ${currentListenWord.word}`)
      return
    }

    setListenResult({ status: 'correct', choice: selected })

    const isLastWord = listenIndex >= words.length - 1

    if (isLastWord) {
      setFeedback('Bạn đã hoàn thành phần nghe và chọn.')
      setListenComplete(true)
      setState((prev) => ({ ...prev, learned: true }))
      setDayStatus(day, LESSON_STATUS.COMPLETED, true)
      return
    }

    setFeedback('Chính xác!')

    if (listenAdvanceTimerRef.current) {
      clearTimeout(listenAdvanceTimerRef.current)
    }

    listenAdvanceTimerRef.current = setTimeout(() => {
      const nextIndex = listenIndex + 1
      setListenIndex(nextIndex)
      setListenTarget(nextIndex)
      setSelected('')
      setFeedback('')
      setListenResult({ status: '', choice: '' })
      speakWord(words[nextIndex].word)
    }, 650)
  }

  const markLearned = () => {
    setState((prev) => ({ ...prev, learned: true }))
    setDayStatus(day, LESSON_STATUS.COMPLETED, true)
  }

  return (
    <section className="vocab-module">
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className={`tab-btn ${mode === 'flashcard' ? 'active' : ''}`} onClick={() => setMode('flashcard')}>Flashcard</button>
        <button className={`tab-btn ${mode === 'match' ? 'active' : ''}`} onClick={() => setMode('match')}>Nối từ</button>
        <button className={`tab-btn ${mode === 'listen' ? 'active' : ''}`} onClick={startListenExercise}>Nghe & Chọn</button>
      </div>

      {mode === 'match' && (
        <div className="vocab-card-wrap">
          <h3>Nối từ</h3>
          <p style={{color:'var(--text-soft)'}}>Nhấn một từ ở cột trái, sau đó nhấn nghĩa tương ứng bên phải để nối.</p>
          <div className="match-grid">
            <div className="match-col">
              {leftItems.map((w) => {
                const matched = Object.keys(pairs).find((k) => pairs[k] === w.id)
                const isWrongLeft = wrongPair?.leftId === w.id
                return (
                  <button
                    key={w.id}
                    className={`match-item ${selectedLeft === w.id ? 'selected' : ''} ${matched ? 'matched' : ''} ${isWrongLeft ? 'wrong' : ''}`}
                    onClick={() => handleLeftClick(w.id)}
                  >
                    <div>{w.word}</div>
                    {w.pronunciation && <div className="muted">{w.pronunciation}</div>}
                  </button>
                )
              })}
            </div>

            <div className="match-col">
              {rightItems.map((m) => {
                const matched = pairs[m.id]
                const isWrongRight = wrongPair?.rightId === m.id
                return (
                  <button
                    key={m.id}
                    className={`match-item ${selectedRight === m.id ? 'selected' : ''} ${matched ? 'matched' : ''} ${isWrongRight ? 'wrong' : ''}`}
                    onClick={() => handleRightClick(m.id)}
                  >
                    <div>{m.meaning}</div>
                  </button>
                )
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn" onClick={resetPairs}>Reset</button>
            <div style={{ marginLeft: 'auto', color: 'var(--text-soft)'}}>{Object.keys(pairs).length}/{words.length} đôi đã nối</div>
          </div>
          {wrongPair && (
            <p className="match-feedback match-feedback-error">Chưa đúng, thử nối lại nhé.</p>
          )}
          {Object.keys(pairs).length === words.length && (
            <div className="module-complete-wrap">
              <p className="module-complete-text">Bạn đã hoàn thành phần nối từ.</p>
              <button type="button" className="btn btn-primary" onClick={resetPairs}>
                Chơi lại
              </button>
            </div>
          )}
        </div>
      )}

      {mode === 'flashcard' && (
        <div className="vocab-card-wrap">
          <h3>Flashcard</h3>
          <Flashcard key={cardIndex} word={currentCard} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button type="button" className="btn" onClick={() => setCardIndex((prev) => (prev - 1 + words.length) % words.length)}>
              Trước
            </button>
            <button type="button" className="btn" onClick={nextCard}>
              Từ tiếp theo
            </button>
          </div>
        </div>
      )}

      {mode === 'listen' && (
        <div className="vocab-card-wrap">
          <h3>Nghe và chọn từ</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn" onClick={() => speakWord(currentListenWord?.word ?? words[0].word)}>Nghe lại</button>
            <button className="btn" onClick={restartListenExercise}>Chơi lại</button>
            <div style={{ marginLeft: 'auto', color: 'var(--text-soft)'}}>
              {listenTarget !== null && !listenComplete && <span>Câu {listenIndex + 1}/{words.length}: thử nghe và chọn đáp án</span>}
              {listenComplete && <span>Phần nghe và chọn đã hoàn thành.</span>}
            </div>
          </div>

          {listenTarget !== null && !listenComplete && currentListenWord && (
            <div style={{ marginTop: 12 }}>
              <div className="quiz-options">
                {listenOptions.map((opt) => (
                  <button
                    key={opt.word}
                    className={`option-btn ${selected === opt.word ? 'selected' : ''} ${listenResult.choice === opt.word && listenResult.status === 'wrong' ? 'wrong' : ''} ${listenResult.choice === opt.word && listenResult.status === 'correct' ? 'correct' : ''}`}
                    onClick={() => selectListenAnswer(opt.word)}
                  >
                    {opt.word} {opt.pronunciation ? <div style={{fontSize:'0.8rem', color:'var(--text-soft)'}}>{opt.pronunciation}</div> : null}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 8 }}>
                <button className="btn" onClick={() => {
                  checkListenAnswer()
                }}>Kiểm tra</button>
                {feedback && <div style={{marginTop:8, color:'var(--primary-strong)'}}>{feedback}</div>}
              </div>
            </div>
          )}

          {listenComplete && (
            <div className="module-complete-wrap">
              <p className="module-complete-text">Bạn đã hoàn thành phần nghe và chọn.</p>
              <button type="button" className="btn btn-primary" onClick={restartListenExercise}>
                Chơi lại
              </button>
            </div>
          )}
        </div>
      )}

      <div className="learned-wrap">
        <button type="button" className="btn btn-primary" onClick={markLearned}>
          Mark learned
        </button>
        {state.learned && <p>Đã đánh dấu học xong từ vựng ngày này.</p>}
      </div>
    </section>
  )
}

export default VocabularyModule
