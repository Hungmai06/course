import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getDlCurrentUser } from '../../48ngay/services/authService'
import { useSEO } from '../hooks/useSEO'
import { vocabularyCollections, vocabularyTopics, vocabularySubtopics, vocabularyWords } from '../data/mockData'

export default function VocabularyTopicsPage() {
  const { collectionId } = useParams()
  const [collection, setCollection] = useState(null)
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

  useSEO({
    title: `Danh sách chủ đề - ${collection?.title || 'Từ vựng'}`,
    description: 'Danh sách các chủ đề từ vựng trong bộ từ vựng.',
    keywords: 'chủ đề từ vựng, học tiếng anh theo chủ đề'
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const user = getDlCurrentUser()
        const email = user?.email || ''
        const colIdNum = Number(collectionId)

        let fetchedCol = null
        let fetchedTopics = []

        try {
          const colRes = await fetch(`${API_BASE}/api/v1/english/vocabulary/collections/${collectionId}`)
          if (colRes.ok) {
            const colData = await colRes.json()
            fetchedCol = colData.data
          }

          const topicsRes = await fetch(`${API_BASE}/api/v1/english/vocabulary/collections/${collectionId}/topics`)
          if (topicsRes.ok) {
            const topicsData = await topicsRes.json()
            fetchedTopics = topicsData.data || []
          }
        } catch (e) {
          console.warn('API error, using mock fallback for topics', e)
        }

        if (!fetchedCol) {
          fetchedCol = vocabularyCollections.find(c => c.id === colIdNum)
        }
        if (!fetchedTopics || fetchedTopics.length === 0) {
          fetchedTopics = vocabularyTopics.filter(t => t.collectionId === colIdNum)
        }

        // Fetch user progress
        let progressMap = {}
        if (email) {
          try {
            const progRes = await fetch(`${API_BASE}/api/v1/english/vocabulary/progress?username=${encodeURIComponent(email)}`)
            if (progRes.ok) {
              const progData = await progRes.json()
              const progressList = progData.data || []
              progressList.forEach(p => {
                const subId = p.subtopicId || p.subCollectionId
                if (subId) {
                  const ids = p.learnedWordIds ? p.learnedWordIds.split(',').filter(Boolean).map(Number) : []
                  progressMap[subId] = ids
                }
              })
            }
          } catch (e) {
            console.warn('Error fetching progress', e)
          }
        }

        let totalWordsAll = 0
        let totalLearnedAll = 0

        const processedTopics = (fetchedTopics || []).map(t => {
          let topicWords = 0
          let topicLearned = 0

          const subtopics = t.subtopics || vocabularySubtopics.filter(st => st.topicId === t.id)
          subtopics.forEach(sub => {
            const words = sub.words || vocabularyWords.filter(w => w.subtopicId === sub.id)
            const wordCount = words.length
            topicWords += wordCount
            totalWordsAll += wordCount

            const learnedIds = progressMap[sub.id] || []
            const subWordIds = words.map(w => w.id)
            const learnedCount = learnedIds.filter(id => subWordIds.includes(id)).length
            topicLearned += learnedCount
            totalLearnedAll += learnedCount
          })

          const progress = topicWords > 0 ? Math.round((topicLearned / topicWords) * 100) : 0

          return {
            ...t,
            subtopicCount: subtopics.length,
            wordCount: topicWords,
            progress
          }
        })

        const overallProgress = totalWordsAll > 0 ? Math.round((totalLearnedAll / totalWordsAll) * 100) : 0

        setCollection({
          ...fetchedCol,
          progress: overallProgress
        })
        setTopics(processedTopics.sort((a, b) => Number(a.id) - Number(b.id)))
      } catch (error) {
        console.error('Error fetching topic page data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [collectionId, API_BASE])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-text-muted">Không tìm thấy bộ từ vựng</p>
        <Link to="/vocabulary" className="text-primary font-semibold mt-4 inline-block hover:underline">
          ← Quay lại danh mục
        </Link>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-secondary via-ocean-50 to-surface min-h-screen py-10">
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-300/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Link to="/vocabulary" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary transition-colors font-medium">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Bộ sưu tập từ vựng
          </Link>
        </div>

        {/* Header Info */}
        <div className="mb-10 bg-white/70 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                Cấp 2: Topic
              </span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">
                  {collection.icon || 'school'}
                </span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-800">{collection.title}</h1>
            </div>
          </div>

          <div className="bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm shrink-0 min-w-[200px]">
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-slate-400">Tiến độ bộ từ vựng</span>
              <span className="text-primary font-bold">{collection.progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${collection.progress}%` }} />
            </div>
            <span className="text-[10px] text-slate-400 mt-2 block font-medium">Tổng cộng {topics.length} chủ đề chính</span>
          </div>
        </div>

        {/* Topics Grid */}
        <h2 className="font-display text-xl font-bold text-slate-800 mb-6">Chọn chủ đề chính (Topic)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <div key={topic.id} className="dl-card-hover bg-white rounded-2xl p-6 border border-border flex flex-col justify-between gap-5 shadow-sm">
              <div>
                <div className="mb-3">
                  <h3 className="font-display font-bold text-slate-800 text-base md:text-lg mb-2 leading-snug">{topic.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
                      <span className="material-symbols-outlined text-[14px]">folder_open</span>
                      {topic.subtopicCount} chủ đề nhỏ
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      <span className="material-symbols-outlined text-[14px]">translate</span>
                      {topic.wordCount} từ vựng
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-400">Tiến độ chủ đề</span>
                    <span className="text-slate-700">{topic.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-150 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500" 
                      style={{ width: `${topic.progress}%` }} 
                    />
                  </div>
                </div>

                <Link 
                  to={`/vocabulary/topic/${topic.id}`} 
                  className="btn btn-primary w-full flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px] md:text-[18px]">format_list_bulleted</span>
                  Xem các chủ đề nhỏ (Subtopic)
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
