import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getDlCurrentUser } from '../../48ngay/services/authService'
import { useAuth } from '../../48ngay/hooks/useAuth'
import { useSEO } from '../hooks/useSEO'
import { vocabularyCollections, vocabularyTopics, vocabularySubtopics, vocabularyWords } from '../data/mockData'

const SHOPEE_LINK = "https://s.shopee.vn/5L9aBvPxg0"; // Link Shopee ủng hộ

const playAudio = (e, text) => {
  if (e) e.stopPropagation();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }
}

const setCookie = (name, value, seconds) => {
  const date = new Date();
  date.setTime(date.getTime() + (seconds * 1000));
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i=0;i < ca.length;i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export default function LearnPage() {
  const { id } = useParams()
  const { refreshUser } = useAuth()
  const [subCollection, setSubCollection] = useState(null)
  
  useSEO({
    title: `Luyện học từ vựng ${subCollection?.title || ''}`,
    description: 'Học từ vựng qua các thẻ ghi nhớ flashcards, trắc nghiệm chọn nghĩa và bài tập luyện nghe phát âm chuẩn bản xứ.',
    keywords: 'luyện từ vựng, flashcard từ vựng, trắc nghiệm từ vựng, phát âm tiếng anh'
  })
  const [collection, setCollection] = useState(null)
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState(null)
  const [showSponsorPopup, setShowSponsorPopup] = useState(false)
  const [hasClickedShopee, setHasClickedShopee] = useState(false)
  const [pendingMode, setPendingMode] = useState(null)
  const [activeWords, setActiveWords] = useState([])
  const [configOption, setConfigOption] = useState('full')
  const [randomCount, setRandomCount] = useState(10)

  const handleModeClick = (modeKey) => {
    setPendingMode(modeKey)
    setConfigOption('full')
    setRandomCount(Math.min(10, words.length || 10))
  }

  const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

  useEffect(() => {
    const isUnlocked = getCookie('dl_vocab_sponsor_unlocked');
    if (!isUnlocked) {
      setShowSponsorPopup(true);
    }
  }, []);

  const [topic, setTopic] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        let rawWords = []
        try {
          const subRes = await fetch(`${API_BASE}/api/v1/english/vocabulary/subtopics/${id}/words`)
          if (subRes.ok) {
            const wordsData = await subRes.json()
            rawWords = wordsData.data || []
          }
        } catch (e) {}

        if (!rawWords || rawWords.length === 0) {
          try {
            const subRes2 = await fetch(`${API_BASE}/api/v1/english/vocabulary/subs/${id}/words`)
            if (subRes2.ok) {
              const wordsData2 = await subRes2.json()
              rawWords = wordsData2.data || []
            }
          } catch (e) {}
        }

        if (!rawWords || rawWords.length === 0) {
          rawWords = vocabularyWords.filter(w => w.subtopicId === Number(id))
        }
        setWords(rawWords)

        const currentSub = vocabularySubtopics.find(s => s.id === Number(id))
        if (currentSub) {
          setSubCollection(currentSub)
          const foundTopic = vocabularyTopics.find(t => t.id === currentSub.topicId)
          if (foundTopic) {
            setTopic(foundTopic)
            const foundCol = vocabularyCollections.find(c => c.id === foundTopic.collectionId)
            if (foundCol) setCollection(foundCol)
          }
        } else {
          setSubCollection({ id: Number(id), title: `Bài học #${id}` })
        }
      } catch (error) {
        console.error('Error fetching learn page data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    const visitUser = getDlCurrentUser()
    if (visitUser?.email) {
      const visitEmail = visitUser.email.trim().toLowerCase()
      fetch(`${API_BASE}/api/v1/english/vocabulary/progress?username=${encodeURIComponent(visitEmail)}&subtopicId=${id}&mode=visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([])
      }).catch(() => {})
    }
  }, [id, API_BASE])

  const saveProgress = async (learnedWordIdsList = [], modeName = '') => {
    const user = getDlCurrentUser()
    const email = user?.email || ''
    if (!email) return

    try {
      await fetch(`${API_BASE}/api/v1/english/vocabulary/progress?username=${encodeURIComponent(email)}&subtopicId=${id}&mode=${modeName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(learnedWordIdsList)
      })
      if (refreshUser) {
        refreshUser()
      }
    } catch (e) {
      console.error('Failed to save learning progress:', e)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!subCollection) return (
    <div className="max-w-7xl mx-auto px-6 py-20 text-center">
      <p className="text-text-muted">Không tìm thấy chủ đề học</p>
      <Link to="/vocabulary" className="text-primary font-semibold mt-4 inline-block hover:underline">← Quay lại danh mục</Link>
    </div>
  )

  const selectorModes = [
    {
      key: 'flashcard',
      icon: 'style',
      label: 'Flashcard (Thẻ ghi nhớ)',
      description: 'Lật thẻ hai mặt để ghi nhớ từ mới, ôn luyện phiên âm và nghe phát âm chuẩn.',
      color: 'from-blue-500/10 to-blue-600/5 hover:border-blue-500/30 text-blue-600'
    },
    {
      key: 'quiz',
      icon: 'fact_check',
      label: 'Luyện Trắc Nghiệm',
      description: 'Phản xạ nhanh với câu hỏi trắc nghiệm tìm nghĩa tiếng Việt chính xác.',
      color: 'from-emerald-500/10 to-emerald-600/5 hover:border-emerald-500/30 text-emerald-600'
    },
    {
      key: 'write',
      icon: 'edit_note',
      label: 'Gõ Nghĩa Từ',
      description: 'Thử thách điền từ giúp ghi nhớ mặt chữ và viết chính tả chính xác.',
      color: 'from-amber-500/10 to-amber-600/5 hover:border-amber-500/30 text-amber-600'
    }
  ]

  return (
    <>
      {showSponsorPopup && (
        <div className="sponsor-popup-overlay">
          <div className="sponsor-popup-box">
            <span className="sponsor-popup-heart">❤️</span>
            <h2 className="sponsor-popup-title">Ủng Hộ Dự Án</h2>
            <p className="sponsor-popup-text">
              Để có thêm kinh phí duy trì máy chủ, vui lòng click ủng hộ chúng tôi tại link dưới đây! Không bắt buộc mua đâu nhé, chỉ cần click xem thôi là đã giúp đỡ Admin rất nhiều rồi ạ!
            </p>
            <div className="sponsor-popup-actions">
              <a
                href={SHOPEE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="sponsor-btn-shopee"
                style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}
                onClick={() => setHasClickedShopee(true)}
              >
                📖 Xem Sách Tiếng Anh Bổ Trợ
              </a>
              <button
                className="sponsor-btn-close"
                onClick={() => {
                  setCookie('dl_vocab_sponsor_unlocked', 'true', 86400);
                  setShowSponsorPopup(false);
                }}
                disabled={!hasClickedShopee}
              >
                {hasClickedShopee ? "Đóng & Vào Học Ngay" : "Vui lòng click link ủng hộ phía trên trước 🔒"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cấu hình Ôn tập */}
      {pendingMode && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-100 relative animate-[dlPopIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[36px]">
                  {pendingMode === 'flashcard' ? 'style' : pendingMode === 'quiz' ? 'fact_check' : 'edit_note'}
                </span>
              </div>
              <h2 className="font-display text-xl md:text-2xl font-extrabold text-slate-800">
                Cài đặt chế độ ôn tập
              </h2>
              <p className="text-xs md:text-sm text-text-muted mt-1 font-semibold">
                {pendingMode === 'flashcard' ? 'Flashcard (Thẻ ghi nhớ)' : pendingMode === 'quiz' ? 'Luyện Trắc Nghiệm' : 'Gõ Nghĩa Từ'}
              </p>
            </div>

            {/* Config Mode selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Học toàn bộ */}
              <button
                type="button"
                onClick={() => setConfigOption('full')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  configOption === 'full'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                <span className="material-symbols-outlined text-[28px] mb-2">library_books</span>
                <span className="font-bold text-sm">Học toàn bộ</span>
                <span className="text-[10px] opacity-75 mt-0.5">{words.length} từ vựng</span>
              </button>

              {/* Học ngẫu nhiên */}
              <button
                type="button"
                onClick={() => {
                  setConfigOption('random');
                  if (randomCount > words.length) {
                    setRandomCount(Math.min(10, words.length));
                  }
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  configOption === 'random'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                <span className="material-symbols-outlined text-[28px] mb-2">shuffle</span>
                <span className="font-bold text-sm">Học ngẫu nhiên</span>
                <span className="text-[10px] opacity-75 mt-0.5">Tùy chọn số lượng</span>
              </button>
            </div>

            {/* Random options panel */}
            {configOption === 'random' && (
              <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 animate-fade-in text-left">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">
                  Chọn số lượng từ ôn tập:
                </label>
                
                {/* presets */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {[5, 10, 20, 50].map((preset) => {
                    if (preset > words.length) return null;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setRandomCount(preset)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          randomCount === preset
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {preset} từ
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setRandomCount(words.length)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      randomCount === words.length
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Tối đa ({words.length})
                  </button>
                </div>

                {/* Slider */}
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max={words.length}
                    value={randomCount}
                    onChange={(e) => setRandomCount(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max={words.length}
                      value={randomCount}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        if (val < 1) val = 1;
                        if (val > words.length) val = words.length;
                        setRandomCount(val);
                      }}
                      className="w-14 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center text-sm font-bold text-slate-700 focus:outline-none focus:border-primary"
                    />
                    <span className="text-xs font-bold text-slate-400">từ</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  let selectedWords = [];
                  if (configOption === 'full') {
                    selectedWords = [...words];
                  } else {
                    const count = Math.min(randomCount, words.length);
                    const shuffled = [...words].sort(() => Math.random() - 0.5);
                    selectedWords = shuffled.slice(0, count);
                  }
                  setActiveWords(selectedWords);
                  setMode(pendingMode);
                  setPendingMode(null);
                }}
                className="btn btn-primary flex-1 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                Bắt đầu học ngay
              </button>
              <button
                type="button"
                onClick={() => setPendingMode(null)}
                className="py-3 px-6 bg-slate-100 text-slate-600 rounded-full font-bold hover:bg-slate-200 transition-all cursor-pointer text-sm"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={(showSponsorPopup || pendingMode) ? 'blur-md pointer-events-none select-none' : ''}>
        {!mode ? (
          <div className="max-w-5xl mx-auto px-6 py-10">
            {/* Back Link */}
            <div className="mb-6">
              <Link to={`/vocabulary/${collection?.id}`} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors font-medium">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Quay lại danh sách chủ đề
              </Link>
            </div>

            {/* Title Header */}
            <div className="text-center mb-10">
              <span className="inline-block px-3 py-1 bg-primary/10 rounded-full text-xs font-bold text-primary uppercase tracking-wide mb-3">
                {collection?.title}
              </span>
              <h1 className="font-display text-2xl md:text-3.5xl font-extrabold text-slate-800 tracking-tight leading-tight">
                {subCollection.title}
              </h1>
              <p className="text-sm md:text-base text-text-muted mt-2">
                Chọn phương pháp học bạn muốn bắt đầu ôn tập cho chủ đề này:
              </p>
            </div>

            {/* Mode Selector Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {selectorModes.map((m) => (
                <button
                  key={m.key}
                  onClick={() => handleModeClick(m.key)}
                  className={`dl-card-hover bg-gradient-to-br ${m.color} border border-slate-200/60 rounded-3xl p-6 flex flex-col items-center text-center justify-between text-left cursor-pointer transition-all min-h-[280px] shadow-sm`}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm mb-5">
                      <span className="material-symbols-outlined text-[32px]">{m.icon}</span>
                    </div>
                    <h3 className="font-display font-extrabold text-slate-800 text-lg mb-2 leading-snug">
                      {m.label}
                    </h3>
                    <p className="text-xs md:text-sm text-text-muted leading-relaxed">
                      {m.description}
                    </p>
                  </div>

                  <span className="w-full mt-6 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs md:text-sm font-bold rounded-full transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md">
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    Bắt đầu học ({words.length} từ)
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-6 py-10">
            {/* Header controls for active mode */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-8">
              <button 
                onClick={() => setMode(null)} 
                className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">keyboard_backspace</span>
                Chọn chế độ học khác
              </button>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Chủ đề: {subCollection.title}
              </span>
            </div>

            {mode === 'flashcard' && (
              <FlashcardMode 
                words={activeWords} 
                onComplete={() => saveProgress(activeWords.map(w => w.id), 'flashcard')} 
                onBack={() => setMode(null)} 
              />
            )}
            {mode === 'quiz' && (
              <QuizMode 
                words={activeWords} 
                allWords={words}
                onComplete={(ids) => saveProgress(ids, 'quiz')} 
                onCorrectAnswer={(wordId) => saveProgress([wordId], 'quiz')}
                onBack={() => setMode(null)} 
              />
            )}
            {mode === 'write' && (
              <WriteMode 
                words={activeWords} 
                onComplete={(ids) => saveProgress(ids, 'write')} 
                onCorrectAnswer={(wordId) => saveProgress([wordId], 'write')}
                onBack={() => setMode(null)} 
              />
            )}
          </div>
        )}
      </div>
    </>
  )
}

/* ═══ FLASHCARD ═══ */
function FlashcardMode({ words, onComplete, onBack }) {
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const w = words[idx]

  if (idx >= words.length) return (
    <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto shadow-md">
      <span className="material-symbols-outlined text-6xl text-emerald-500 mb-4 block animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
      <h2 className="font-display text-2xl font-extrabold text-slate-800 mb-2">Hoàn thành chủ đề!</h2>
      <p className="text-sm text-text-muted mb-6">Bạn đã xem hết tất cả các thẻ từ vựng của chủ đề này.</p>
      <div className="flex flex-col gap-3">
        <button onClick={() => { setIdx(0); setFlipped(false); }} className="btn btn-primary w-full cursor-pointer">Học lại chủ đề này</button>
        <button onClick={onBack} className="btn btn-secondary w-full">Quay lại chọn chế độ</button>
      </div>
    </div>
  )

  if (!w) return null

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-text-muted mb-4 font-semibold">{idx + 1} / {words.length}</p>

      <div className={`dl-flip-card ${flipped ? 'flipped' : ''} w-full max-w-md h-72 cursor-pointer`} onClick={() => setFlipped(!flipped)}>
        <div className="dl-flip-inner relative w-full h-full">
          {/* FRONT */}
          <div className="dl-flip-front absolute inset-0 bg-white rounded-2xl border border-border shadow-lg flex flex-col items-center justify-center p-8">
            <span className="text-xs text-text-muted mb-3 font-semibold uppercase tracking-wide">Tiếng Anh</span>
            <span className="font-display text-3xl font-bold text-text">{w.word}</span>
            <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
              <span className="text-sm text-text-muted">{w.pronunciation}</span>
              <button 
                onClick={(e) => playAudio(e, w.word)}
                className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all cursor-pointer"
                title="Nghe phát âm"
              >
                <span className="material-symbols-outlined text-[18px]">volume_up</span>
              </button>
            </div>
            <span className="mt-6 text-xs text-primary/60 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">touch_app</span>Nhấn để lật
            </span>
          </div>

          {/* BACK */}
          <div className="dl-flip-back absolute inset-0 bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-lg flex flex-col items-center justify-center p-8">
            <span className="text-xs text-white/60 mb-3 font-semibold uppercase tracking-wide">Tiếng Việt</span>
            <span className="font-display text-2xl font-bold text-white">{w.meaning}</span>
          </div>
        </div>
      </div>

      {/* Manual Navigation */}
      <div className="flex gap-4 mt-8">
        <button disabled={idx === 0} onClick={() => { setIdx(idx - 1); setFlipped(false) }} className="px-6 py-2.5 bg-white text-text-muted border border-border rounded-full text-sm font-semibold hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer">
          ← Trước
        </button>
        <button 
          onClick={() => { 
            if (idx === words.length - 1) {
              setIdx(idx + 1)
              onComplete()
            } else {
              setIdx(idx + 1)
              setFlipped(false)
            }
          }} 
          className="btn btn-primary cursor-pointer"
        >
          {idx === words.length - 1 ? 'Hoàn thành' : 'Tiếp →'}
        </button>
      </div>
    </div>
  )
}

/* ═══ QUIZ ═══ */
function QuizMode({ words, allWords = [], onComplete, onCorrectAnswer, onBack }) {
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [correctIds, setCorrectIds] = useState([])

  const w = words[idx]
  const options = useMemo(() => {
    if (!w) return []
    const distractorPool = allWords.length > 0 ? allWords : words
    const others = distractorPool.filter(x => x.id !== w.id).sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.meaning)
    const all = [...others, w.meaning].sort(() => Math.random() - 0.5)
    return all
  }, [idx, words, allWords, w])

  const handleSelect = (opt) => {
    if (answered) return
    setSelected(opt)
    setAnswered(true)
    if (opt === w.meaning) {
      setScore(s => s + 1)
      setCorrectIds(prev => [...prev, w.id])
      // Cộng XP ngay lập tức, backend tự chống trùng qua awardedWordIds
      if (onCorrectAnswer) onCorrectAnswer(w.id)
    }
  }

  const next = () => {
    if (idx === words.length - 1) {
      setIdx(idx + 1)
      onComplete(correctIds)
    } else {
      setIdx(i => i + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  if (idx >= words.length) return (
    <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto shadow-md">
      <span className="material-symbols-outlined text-6xl text-accent mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
      <h2 className="font-display text-2xl font-extrabold text-slate-800 mb-2">Hoàn thành!</h2>
      <p className="text-text-muted mb-6">Bạn đúng {score}/{words.length} câu. Tiến trình của bạn đã được ghi nhận.</p>
      <div className="flex flex-col gap-3">
        <button onClick={() => { setIdx(0); setScore(0); setSelected(null); setAnswered(false) }} className="btn btn-primary w-full cursor-pointer">Làm lại</button>
        <button onClick={onBack} className="btn btn-secondary w-full">Quay lại chọn chế độ</button>
      </div>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-text-muted">Câu {idx + 1}/{words.length}</span>
        <span className="text-sm font-semibold text-primary">Điểm: {score}</span>
      </div>
      <div className="bg-white rounded-2xl border border-border p-8 mb-6 text-center flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold">{w.word}</span>
        <div className="flex items-center gap-2 mt-2 justify-center">
          <span className="text-sm text-text-muted">{w.pronunciation}</span>
          <button 
            onClick={(e) => playAudio(e, w.word)}
            className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all cursor-pointer"
            title="Nghe phát âm"
          >
            <span className="material-symbols-outlined text-[18px]">volume_up</span>
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {options.map((opt, i) => {
          let cls = 'bg-white border-border hover:border-primary hover:bg-primary/5 cursor-pointer'
          if (answered && opt === w.meaning) cls = 'bg-success/10 border-success text-success font-bold'
          else if (answered && opt === selected) cls = 'bg-error/10 border-error text-error font-bold'
          return (
            <button key={i} onClick={() => handleSelect(opt)} className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm font-medium transition-all ${cls}`}>
              {opt}
            </button>
          )
        })}
      </div>
      {answered && (
        <div className="mt-6">
          <button onClick={next} className="btn btn-primary w-full">
            {idx < words.length - 1 ? 'Câu tiếp theo →' : 'Xem kết quả'}
          </button>
        </div>
      )}
    </div>
  )
}

/* ═══ WRITE MODE ═══ */
function WriteMode({ words, onComplete, onCorrectAnswer, onBack }) {
  const [idx, setIdx] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [checked, setChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [correctIds, setCorrectIds] = useState([])

  const w = words[idx]

  const clean = (s) => s.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
  const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
  }

  const handleCheck = (e) => {
    e.preventDefault()
    if (!userInput.trim()) return

    const userNorm = clean(userInput)
    const correctNorm = clean(w.meaning)
    const userNoAccent = clean(removeAccents(userInput))
    const correctNoAccent = clean(removeAccents(w.meaning))

    const correct = userNorm === correctNorm || userNoAccent === correctNoAccent
    setIsCorrect(correct)
    setChecked(true)
    if (correct) {
      setScore(s => s + 1)
      setCorrectIds(prev => [...prev, w.id])
      // Cộng XP ngay lập tức, backend tự chống trùng qua awardedWordIds
      if (onCorrectAnswer) onCorrectAnswer(w.id)
    }
  }

  const handleNext = () => {
    if (idx === words.length - 1) {
      setIdx(idx + 1)
      onComplete(correctIds)
    } else {
      setIdx(i => i + 1)
      setUserInput('')
      setChecked(false)
      setShowHint(false)
    }
  }

  if (idx >= words.length) return (
    <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto shadow-md">
      <span className="material-symbols-outlined text-6xl text-accent mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
      <h2 className="font-display text-2xl font-extrabold text-slate-800 mb-2">Hoàn thành!</h2>
      <p className="text-text-muted mb-6">Bạn đã gõ đúng {score}/{words.length} từ. Tiến trình của bạn đã được ghi nhận.</p>
      <div className="flex flex-col gap-3">
        <button onClick={() => { setIdx(0); setScore(0); setUserInput(''); setChecked(false); setShowHint(false) }} className="btn btn-primary w-full cursor-pointer">Làm lại</button>
        <button onClick={onBack} className="btn btn-secondary w-full">Quay lại chọn chế độ</button>
      </div>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-text-muted">Từ {idx + 1}/{words.length}</span>
        <span className="text-sm font-semibold text-primary">Chính xác: {score}</span>
      </div>

      <div className="bg-white rounded-2xl border border-border p-8 mb-6 text-center flex flex-col items-center justify-center shadow-sm">
        <span className="text-xs text-text-muted mb-2 font-semibold uppercase tracking-wide">Từ Tiếng Anh</span>
        <span className="font-display text-3xl font-bold text-text">{w.word}</span>
        <div className="flex items-center gap-2 mt-2 justify-center">
          <span className="text-sm text-text-muted">{w.pronunciation}</span>
          <button 
            type="button"
            onClick={(e) => playAudio(e, w.word)}
            className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all cursor-pointer"
            title="Nghe phát âm"
          >
            <span className="material-symbols-outlined text-[18px]">volume_up</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleCheck} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nhập nghĩa Tiếng Việt:</label>
          <div className="relative">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={checked}
              placeholder="Nhập câu trả lời..."
              className="w-full px-5 py-3.5 rounded-2xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm disabled:bg-slate-50 shadow-inner"
            />
            {!checked && (
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-primary hover:text-primary-dark px-3 py-1 bg-primary/5 rounded-lg cursor-pointer"
              >
                Gợi ý
              </button>
            )}
          </div>
        </div>

        {showHint && !checked && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-medium animate-fade-in">
            💡 Gợi ý: Từ này bắt đầu bằng chữ "{w.meaning.charAt(0)}" và có độ dài {w.meaning.length} ký tự.
          </div>
        )}

        {checked && (
          <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-fade-in ${
            isCorrect 
              ? 'bg-success/5 border-success/20 text-success' 
              : 'bg-error/5 border-error/20 text-error'
          }`}>
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isCorrect ? 'check_circle' : 'cancel'}
            </span>
            <div>
              <p className="font-bold text-sm">{isCorrect ? 'Chính xác!' : 'Chưa đúng rồi!'}</p>
              <p className="text-xs mt-1">Nghĩa đúng: <span className="font-bold underline">{w.meaning}</span></p>
            </div>
          </div>
        )}

        {!checked ? (
          <button
            type="submit"
            disabled={!userInput.trim()}
            className="btn btn-primary w-full flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            Kiểm tra đáp án
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3.5 bg-slate-800 text-white font-bold rounded-full hover:bg-slate-900 transition-all text-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{idx < words.length - 1 ? 'Từ tiếp theo' : 'Xem kết quả'}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        )}
      </form>
    </div>
  )
}
