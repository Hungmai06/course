import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getDlCurrentUser } from '../../48ngay/services/authService'
import { useSEO } from '../hooks/useSEO'
import { vocabularyCollections, vocabularyTopics, vocabularySubtopics, vocabularyWords } from '../data/mockData'

export default function VocabularySubtopicsPage() {
  const { topicId } = useParams()
  const [topic, setTopic] = useState(null)
  const [collection, setCollection] = useState(null)
  const [subtopics, setSubtopics] = useState([])
  const [loading, setLoading] = useState(true)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

  useSEO({
    title: `Danh sách bài học - ${topic?.title || 'Từ vựng'}`,
    description: 'Danh sách bài học nhỏ trong chủ đề từ vựng.',
    keywords: 'chủ đề nhỏ từ vựng, flashcard bài học, trắc nghiệm từ vựng'
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const user = getDlCurrentUser()
        const email = user?.email || ''
        const topIdNum = Number(topicId)

        let fetchedTopic = null
        let fetchedSubtopics = []
        let parentCol = null

        try {
          const topicRes = await fetch(`${API_BASE}/api/v1/english/vocabulary/topics/${topicId}`)
          if (topicRes.ok) {
            const topicData = await topicRes.json()
            fetchedTopic = topicData.data
          }

          const subsRes = await fetch(`${API_BASE}/api/v1/english/vocabulary/topics/${topicId}/subtopics`)
          if (subsRes.ok) {
            const subsData = await subsRes.json()
            fetchedSubtopics = subsData.data || []
          }
        } catch (e) {
          console.warn('API error, using mock fallback for subtopics', e)
        }

        if (!fetchedTopic) {
          fetchedTopic = vocabularyTopics.find(t => t.id === topIdNum)
        }

        if (fetchedTopic && fetchedTopic.collectionId) {
          try {
            const colRes = await fetch(`${API_BASE}/api/v1/english/vocabulary/collections/${fetchedTopic.collectionId}`)
            if (colRes.ok) {
              const colData = await colRes.json()
              parentCol = colData.data
            }
          } catch (e) {}
          if (!parentCol) {
            parentCol = vocabularyCollections.find(c => c.id === fetchedTopic.collectionId)
          }
        }

        if (!fetchedSubtopics || fetchedSubtopics.length === 0) {
          fetchedSubtopics = vocabularySubtopics.filter(st => st.topicId === topIdNum)
        }
        if (!fetchedSubtopics || fetchedSubtopics.length === 0) {
          fetchedSubtopics = vocabularySubtopics
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

        const processedSubs = (fetchedSubtopics || []).map(sub => {
          const words = sub.words || vocabularyWords.filter(w => w.subtopicId === sub.id)
          const wordCount = words.length
          totalWordsAll += wordCount

          const learnedIds = progressMap[sub.id] || []
          const subWordIds = words.map(w => w.id)
          const learnedCount = learnedIds.filter(id => subWordIds.includes(id)).length
          totalLearnedAll += learnedCount

          const subProgress = wordCount > 0 ? Math.round((learnedCount / wordCount) * 100) : 0

          return {
            ...sub,
            wordCount,
            progress: subProgress
          }
        })

        const overallProgress = totalWordsAll > 0 ? Math.round((totalLearnedAll / totalWordsAll) * 100) : 0

        setCollection(parentCol)
        setTopic({
          ...fetchedTopic,
          progress: overallProgress
        })
        setSubtopics(processedSubs.sort((a, b) => Number(a.id) - Number(b.id)))
      } catch (error) {
        console.error('Error fetching subtopics page data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [topicId, API_BASE])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-text-muted">Không tìm thấy chủ đề</p>
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
        <div className="mb-6 flex items-center gap-2 text-sm text-text-muted">
          <Link to="/vocabulary" className="hover:text-primary transition-colors font-medium">
            Bộ từ vựng
          </Link>
          {collection && (
            <>
              <span>/</span>
              <Link to={`/vocabulary/${collection.id}`} className="hover:text-primary transition-colors font-medium">
                {collection.title}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="font-bold text-slate-800">{topic.title}</span>
        </div>

        {/* Header Info */}
        <div className="mb-10 bg-white/70 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                Cấp 3: Subtopic
              </span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-800">{topic.title}</h1>
          </div>

          <div className="bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm shrink-0 min-w-[200px]">
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-slate-400">Tiến độ chủ đề</span>
              <span className="text-primary font-bold">{topic.progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${topic.progress}%` }} />
            </div>
            <span className="text-[10px] text-slate-400 mt-2 block font-medium">Tổng cộng {subtopics.length} chủ đề nhỏ</span>
          </div>
        </div>

        {/* Subtopics Grid */}
        <h2 className="font-display text-xl font-bold text-slate-800 mb-6">Chọn bài học nhỏ để bắt đầu luyện tập</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subtopics.map((sub) => (
            <div key={sub.id} className="dl-card-hover bg-white rounded-2xl p-6 border border-border flex flex-col justify-between gap-5 shadow-sm">
              <div>
                <div className="mb-3">
                  <h3 className="font-display font-bold text-slate-800 text-base md:text-lg mb-2 leading-snug">{sub.title}</h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    <span className="material-symbols-outlined text-[14px]">translate</span>
                    {sub.wordCount} từ vựng
                  </span>
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-400">Tiến độ bài học</span>
                    <span className="text-slate-700">{sub.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-150 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500" 
                      style={{ width: `${sub.progress}%` }} 
                    />
                  </div>
                </div>

                <Link 
                  to={`/vocabulary/subtopic/${sub.id}/learn`} 
                  className="btn btn-primary w-full flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px] md:text-[18px]">play_arrow</span>
                  {sub.progress > 0 ? 'Học tiếp' : 'Bắt đầu học'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
