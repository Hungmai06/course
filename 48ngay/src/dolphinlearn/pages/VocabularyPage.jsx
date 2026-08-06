import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDlCurrentUser } from '../../48ngay/services/authService'
import { useSEO } from '../hooks/useSEO'
import { vocabularyCollections, vocabularyTopics, vocabularySubtopics, vocabularyWords } from '../data/mockData'

export default function VocabularyPage() {
  useSEO({
    title: 'Bộ từ vựng tiếng Anh theo cấp độ',
    description: 'Học từ vựng Tiếng Anh theo bộ từ vựng, chủ đề và bài học chi tiết với phương pháp ghi nhớ thông minh.',
    keywords: 'từ vựng tiếng anh, học từ vựng theo bộ, từ vựng ielts, toeic'
  })

  const [collections, setCollections] = useState([])
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

  useEffect(() => {
    async function fetchData() {
      try {
        const user = getDlCurrentUser()
        const email = user?.email || ''

        // Parallel API calls for maximum speed
        const [colRes, topRes, progRes] = await Promise.allSettled([
          fetch(`${API_BASE}/api/v1/english/vocabulary/collections`),
          fetch(`${API_BASE}/api/v1/english/vocabulary/topics`),
          email ? fetch(`${API_BASE}/api/v1/english/vocabulary/progress?username=${encodeURIComponent(email)}`) : Promise.reject()
        ])

        let fetchedCollections = []
        if (colRes.status === 'fulfilled' && colRes.value.ok) {
          const colData = await colRes.value.json()
          fetchedCollections = colData.data || []
        }

        let fetchedTopics = []
        if (topRes.status === 'fulfilled' && topRes.value.ok) {
          const topData = await topRes.value.json()
          fetchedTopics = topData.data || []
        }

        let progressMap = {}
        if (progRes.status === 'fulfilled' && progRes.value.ok) {
          const progData = await progRes.value.json()
          const progressList = progData.data || []
          progressList.forEach(p => {
            const subId = p.subtopicId || p.subCollectionId
            if (subId) {
              const ids = p.learnedWordIds ? p.learnedWordIds.split(',').filter(Boolean).map(Number) : []
              progressMap[subId] = ids
            }
          })
        }

        // Process collections - wordCount now comes directly from backend
        const processedCols = fetchedCollections.map(col => {
          // Compute learned progress only (backend provides wordCount)
          const totalWords = col.wordCount || 0

          // Calculate learned from progress
          let totalLearned = 0
          const colTopics = col.topics || fetchedTopics.filter(t => Number(t.collectionId) === Number(col.id))
          colTopics.forEach(t => {
            const subtopics = t.subtopics || []
            subtopics.forEach(sub => {
              const learnedIds = progressMap[sub.id] || []
              totalLearned += learnedIds.length
            })
          })

          const progressPercent = totalWords > 0 ? Math.round((totalLearned / totalWords) * 100) : 0

          return {
            id: col.id,
            title: col.title,
            icon: col.icon || 'school',
            color: col.color || 'primary',
            wordCount: totalWords,
            topicCount: col.topicCount || colTopics.length,
            progress: progressPercent
          }
        })

        setCollections(processedCols.sort((a, b) => Number(a.id) - Number(b.id)))
        setTopics(fetchedTopics.sort((a, b) => Number(a.id) - Number(b.id)))
      } catch (error) {
        console.error('Error fetching vocabulary page data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [API_BASE])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-secondary via-ocean-50 to-surface min-h-screen py-10">
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-300/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
            Cấp 1: Collection
          </span>
          <h1 className="font-display text-3xl font-bold mt-2 mb-2">Bộ sưu tập từ vựng</h1>
          <p className="text-text-muted">Chọn bộ từ vựng để bắt đầu khám phá các chủ đề học tập</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.length > 0 ? (
            collections.map(col => {
              const barMap = { primary: 'bg-primary', accent: 'bg-accent', success: 'bg-success' }
              return (
                <div key={col.id} className="dl-card-hover bg-white rounded-2xl p-6 border border-border flex flex-col shadow-sm justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[24px]">
                          {col.icon || 'school'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-lg">{col.title}</h3>
                        <span className="text-xs text-text-muted">{col.topicCount || 0} chủ đề · {col.wordCount} từ vựng</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-4">
                      <div className="flex justify-between text-xs font-semibold mb-2">
                        <span className="text-text-muted">Tiến độ bộ từ vựng</span>
                        <span className="text-primary">{col.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full dl-progress-animate ${barMap[col.color] || 'bg-primary'}`} style={{ width: `${col.progress}%` }} />
                      </div>
                    </div>

                    <Link to={`/vocabulary/${col.id}`} className="btn btn-primary w-full flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">grid_view</span>
                      Xem các chủ đề
                    </Link>
                  </div>
                </div>
              )
            })
          ) : (
            topics.map(top => {
              const topSubtopics = top.subtopics || []
              const topWordsCount = topSubtopics.reduce((acc, st) => acc + (st.words ? st.words.length : 0), 0)
              return (
                <div key={top.id} className="dl-card-hover bg-white rounded-2xl p-6 border border-border flex flex-col shadow-sm justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[24px]">school</span>
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg text-slate-900">{top.title}</h3>
                        <span className="text-xs font-semibold text-slate-500">{top.wordCount || 0} từ vựng</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-4">
                      <div className="flex justify-between text-xs font-semibold mb-2">
                        <span className="text-slate-400">Tiến độ bộ từ vựng</span>
                        <span className="text-primary font-bold">0%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: '0%' }} />
                      </div>
                    </div>

                    <Link to={`/vocabulary/topic/${top.id}`} className="btn btn-primary w-full flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-xs py-3">
                      <span className="material-symbols-outlined text-[18px]">grid_view</span>
                      XEM CÁC CHỦ ĐỀ
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
