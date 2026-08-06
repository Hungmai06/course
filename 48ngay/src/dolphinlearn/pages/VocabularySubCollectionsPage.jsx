import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getDlCurrentUser } from '../../48ngay/services/authService'
import { useSEO } from '../hooks/useSEO'

export default function VocabularySubCollectionsPage() {
  const { categoryId } = useParams()
  const [collection, setCollection] = useState(null)

  useSEO({
    title: `Chủ đề từ vựng ${collection?.title || ''}`,
    description: 'Học từ vựng theo bài học, trắc nghiệm nhanh, flashcard và quản lý tiến độ từng chủ đề từ vựng cụ thể.',
    keywords: 'chủ đề học tiếng anh, danh sách bài học từ vựng, flashcard bài học'
  })
  const [subCollections, setSubCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

  useEffect(() => {
    async function fetchData() {
      try {
        const user = getDlCurrentUser()
        const email = user?.email || ''

        // Fetch collection details
        const colRes = await fetch(`${API_BASE}/api/v1/english/vocabulary/collections/${categoryId}`)
        if (!colRes.ok) throw new Error('Failed to fetch collection')
        const colData = await colRes.json()
        const rawCollection = colData.data

        // Fetch sub-collections
        const subsRes = await fetch(`${API_BASE}/api/v1/english/vocabulary/collections/${categoryId}/subs`)
        if (!subsRes.ok) throw new Error('Failed to fetch subcollections')
        const subsData = await subsRes.json()
        const rawSubs = subsData.data || []

        // Fetch user progress
        let progressMap = {}
        if (email) {
          const progRes = await fetch(`${API_BASE}/api/v1/english/vocabulary/progress?username=${encodeURIComponent(email)}`)
          if (progRes.ok) {
            const progData = await progRes.json()
            const progressList = progData.data || []
            progressList.forEach(p => {
              if (p.subCollectionId) {
                const ids = p.learnedWordIds ? p.learnedWordIds.split(',').filter(Boolean).map(Number) : []
                progressMap[p.subCollectionId] = ids
              }
            })
          }
        }

        // Calculate progress for each subcollection and overall collection
        let totalWordsAll = 0
        let totalLearnedAll = 0

        const processedSubs = rawSubs.map(sub => {
          const wordCount = sub.words ? sub.words.length : 0
          totalWordsAll += wordCount

          const learnedIds = progressMap[sub.id] || []
          const subWordIds = (sub.words || []).map(w => w.id)
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

        setCollection({
          ...rawCollection,
          progress: overallProgress
        })
        setSubCollections(processedSubs)
      } catch (error) {
        console.error('Error fetching subcollections:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [categoryId, API_BASE])

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
        <p className="text-text-muted">Không tìm thấy danh mục từ vựng</p>
        <Link to="/vocabulary" className="text-primary font-semibold mt-4 inline-block hover:underline">
          ← Quay lại
        </Link>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-secondary via-ocean-50 to-surface min-h-screen py-10">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-300/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Breadcrumbs & Back */}
        <div className="mb-6">
          <Link to="/vocabulary" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary transition-colors font-medium">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Danh mục từ vựng
          </Link>
        </div>

        {/* Header Info */}
        <div className="mb-10 bg-white/70 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {collection.icon || 'school'}
                </span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-800">{collection.title}</h1>
            </div>
            <p className="text-sm md:text-base text-text-muted">{collection.description}</p>
          </div>

          <div className="bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm shrink-0 min-w-[200px]">
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-slate-400">Tiến độ chung</span>
              <span className="text-primary font-bold">{collection.progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${collection.progress}%` }} />
            </div>
            <span className="text-[10px] text-slate-400 mt-2 block font-medium">Tổng cộng {subCollections.length} chủ đề học</span>
          </div>
        </div>

        {/* Sub-collections Grid */}
        <h2 className="font-display text-xl font-bold text-slate-800 mb-6">Chọn chủ đề để học</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subCollections.map((sub) => (
            <div key={sub.id} className="dl-card-hover bg-white rounded-2xl p-6 border border-border flex flex-col justify-between gap-5 shadow-sm">
              <div>
                <div className="mb-3">
                  <h3 className="font-display font-bold text-slate-800 text-base md:text-lg mb-2 leading-snug">{sub.title}</h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    <span className="material-symbols-outlined text-[14px]">translate</span>
                    {sub.wordCount} từ vựng
                  </span>
                </div>
                
                <p className="text-xs md:text-sm text-text-muted leading-relaxed mb-2">{sub.description}</p>
              </div>

              <div>
                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-400">Tiến độ chủ đề</span>
                    <span className="text-slate-700">{sub.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-150 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500" 
                      style={{ width: `${sub.progress}%` }} 
                    />
                  </div>
                </div>

                {/* Learn button */}
                <Link 
                  to={`/vocabulary/sub/${sub.id}/learn`} 
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
