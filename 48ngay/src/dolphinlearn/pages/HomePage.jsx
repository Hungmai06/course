import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getDlCurrentUser } from '../../48ngay/services/authService'
import dolphinHero from '../assets/dolphin-hero.png'
import { useSEO } from '../hooks/useSEO'
import { vocabularyCollections, vocabularyTopics, vocabularySubtopics, vocabularyWords } from '../data/mockData'

export default function HomePage() {
  useSEO({
    title: 'Trang chủ - DolphinLearn',
    description: 'DolphinLearn - Nền tảng học ngoại ngữ miễn phí với kho từ vựng phong phú.',
  })

  const [collections, setCollections] = useState([])
  const [categories, setCategories] = useState([])
  const [recentDocs, setRecentDocs] = useState([])
  const [stats, setStats] = useState({ totalDocs: 0, totalVocab: 0, totalUsers: 2450, rating: 4.8 })
  const [inProgressCol, setInProgressCol] = useState(null)
  const [loading, setLoading] = useState(true)
  const user = getDlCurrentUser()

  const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

  useEffect(() => {
    async function fetchHomeData() {
      try {
        const email = user?.email || ''

        let fetchedCollections = []
        try {
          const colRes = await fetch(`${API_BASE}/api/v1/english/vocabulary/collections`)
          if (colRes.ok) {
            const colData = await colRes.json()
            fetchedCollections = colData.data || []
          }
        } catch (e) {
          console.warn('API connection error for collections', e)
        }

        if (!fetchedCollections || fetchedCollections.length === 0) {
          fetchedCollections = vocabularyCollections
        }

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
            console.warn('Progress fetch error', e)
          }
        }

        let globalTotalWords = 0
        let globalTotalLearned = 0
        
        const processed = fetchedCollections.map(col => {
          let totalWords = 0
          let totalLearned = 0

          const topics = col.topics || vocabularyTopics.filter(t => t.collectionId === col.id)
          topics.forEach(t => {
            const subtopics = t.subtopics || vocabularySubtopics.filter(st => st.topicId === t.id)
            subtopics.forEach(sub => {
              const words = sub.words || vocabularyWords.filter(w => w.subtopicId === sub.id)
              const wordCount = words.length
              totalWords += wordCount
              globalTotalWords += wordCount
              const learnedIds = progressMap[sub.id] || []
              const subWordIds = words.map(w => w.id)
              const learnedCount = learnedIds.filter(id => subWordIds.includes(id)).length
              totalLearned += learnedCount
              globalTotalLearned += learnedCount
            })
          })

          const progressPercent = totalWords > 0 ? Math.round((totalLearned / totalWords) * 100) : 0

          return {
            id: col.id,
            title: col.title,
            description: col.description,
            icon: col.icon || 'school',
            color: col.color || 'primary',
            wordCount: totalWords,
            progress: progressPercent
          }
        })
        setCollections(processed)
        
        // Find a collection in progress (progress > 0 and < 100), or default to the first one
        const inProg = processed.find(c => c.progress > 0 && c.progress < 100) || processed[0]
        setInProgressCol(inProg)

        let docCount = 0
        const [catRes, docsRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/english/documents/categories`),
          fetch(`${API_BASE}/api/v1/english/documents`)
        ])
        
        if (catRes.ok) {
          const catData = await catRes.json()
          const cats = catData.data || []
          setCategories(cats)
          cats.forEach(c => docCount += (c.documentCount || 0))
        }
        
        if (docsRes.ok) {
          const docsData = await docsRes.json()
          const dList = docsData.data?.content || docsData.data || []
          const totalElements = docsData.data?.totalElements
          setRecentDocs(Array.isArray(dList) ? dList : [])
          if (totalElements !== undefined) {
            docCount = Math.max(docCount, totalElements)
          } else if (Array.isArray(dList)) {
            docCount = Math.max(docCount, dList.length)
          }
        }
        
        setStats(prev => ({ ...prev, totalDocs: docCount || 0, totalVocab: globalTotalWords || 0, totalLearned: globalTotalLearned || 0 }))
      } catch (error) {
        console.error('Error fetching homepage data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHomeData()
  }, [API_BASE, user?.email])

  return (
    <div className="p-4 sm:p-6 max-w-[1280px] mx-auto w-full font-['Outfit',_'Inter',_sans-serif] bg-slate-50 min-h-screen">
      
      {/* ═══ TOP SEARCH BAR ═══ */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="relative flex-1 max-w-[600px]">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">search</span>
          <input 
            type="text" 
            placeholder="Tìm từ vựng, tài liệu, chủ đề..." 
            className="w-full pl-12 pr-16 h-12 bg-white border border-slate-200 rounded-3xl text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all placeholder-[#64748B]"
          />
          <div className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 bg-slate-50 px-[8px] py-1 rounded-lg border border-slate-200">
            Ctrl + K
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-500 hover:text-blue-600 border border-slate-200 relative transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-2xl">notifications</span>
            <span className="absolute top-3 right-3 w-2 h-2 bg-orange-500 rounded-full"></span>
          </button>
          <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-500 hover:text-blue-600 border border-slate-200 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-2xl">mail</span>
          </button>
          <div className="w-12 h-12 rounded-full bg-cyan-400/20 border border-cyan-400/30 overflow-hidden shrink-0 ml-2">
            <img src={`https://ui-avatars.com/api/?name=${user?.name || user?.email || 'User'}&background=22C7EB&color=FFFFFF`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* ═══ HERO BANNER ═══ */}
      <div className="bg-gradient-to-br from-blue-100 via-white to-blue-100 shadow-[0_20px_50px_rgba(37,99,235,0.05)] rounded-3xl px-6 py-8 md:px-10 md:py-12 relative overflow-hidden mb-6 border border-slate-200">
        <div className="absolute top-[-50px] left-[-50px] w-[300px] h-[300px] bg-blue-400/20 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[-50px] right-[-50px] w-[300px] h-[300px] bg-cyan-300/20 rounded-full blur-[80px]"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="max-w-[500px] text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Xin chào, {user?.name || user?.email?.split('@')[0] || 'Dolphin Learner'}! 👋
            </h2>
            <h1 className="text-3xl font-bold text-slate-900 mb-4 leading-[1.2]">
              Hôm nay bạn muốn <span className="text-blue-600">học gì mới?</span>
            </h1>
            <p className="text-sm text-slate-500 mb-8 leading-[1.5]">
              Kho tài liệu miễn phí, bộ sưu tập từ vựng và lộ trình học tập thông minh. Bắt đầu ngay hôm nay!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/vocabulary" className="h-12 rounded-2xl px-8 bg-blue-600 hover:bg-blue-700 !text-white text-sm font-bold flex items-center justify-center gap-2 border-b-4 border-blue-900 active:border-b-0 active:translate-y-1 transition-all shadow-sm" style={{ color: '#ffffff' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rocket"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 3.82-13.04 1 1 0 0 1 1.76.6l.33 3.74a1 1 0 0 0 .81.91l3.74.33a1 1 0 0 1 .6 1.76A22 22 0 0 1 15 12z"/><path d="m9 10.3 3-3"/><circle cx="15" cy="9" r="1"/></svg>
                Bắt đầu học ngay
              </Link>
              <Link to="/documents" className="h-12 rounded-2xl px-8 bg-white hover:bg-slate-50 text-slate-900 text-sm font-bold flex items-center justify-center gap-2 border-2 border-slate-200 border-b-4 border-b-slate-300 active:border-b-2 active:translate-y-0.5 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-folder"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
                Khám phá tài liệu
              </Link>
            </div>
          </div>
          <div className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px] flex-shrink-0">
            <img src={dolphinHero} className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(37,99,235,0.2)]" alt="Dolphin Mascot" />
          </div>
        </div>
      </div>

      {/* ═══ STATS GRID ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 active:scale-[0.98] transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <span className="material-symbols-outlined text-2xl">description</span>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">1.200+</div>
            <div className="text-xs font-medium text-slate-500 mb-1">Tài liệu</div>
            <div className="text-[10px] font-medium text-green-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">arrow_upward</span> 12% so với tuần trước
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 active:scale-[0.98] transition-all">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
            <span className="material-symbols-outlined text-2xl">bookmark</span>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">5.000+</div>
            <div className="text-xs font-medium text-slate-500 mb-1">Từ vựng</div>
            <div className="text-[10px] font-medium text-green-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">arrow_upward</span> 18% so với tuần trước
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 active:scale-[0.98] transition-all">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <span className="material-symbols-outlined text-2xl">school</span>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">2.000+</div>
            <div className="text-xs font-medium text-slate-500 mb-1">Học viên</div>
            <div className="text-[10px] font-medium text-green-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">arrow_upward</span> 8% so với tuần trước
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 active:scale-[0.98] transition-all">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
            <span className="material-symbols-outlined text-2xl">star</span>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">4.8</div>
            <div className="text-xs font-medium text-slate-500 mb-1">Đánh giá trung bình</div>
            <div className="flex gap-0.5 text-orange-500">
              {[1,2,3,4,5].map(i => (
                <span key={i} className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MIDDLE SECTION: CONTINUE LEARNING & STATS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Tiếp tục học */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-900">Tiếp tục học</h3>
            <Link to="/vocabulary" className="btn btn-secondary !px-4 !py-2 !text-xs flex items-center gap-1">
              Xem tất cả <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col sm:flex-row gap-5 items-center flex-1">
            <div className="w-32 h-32 rounded-xl bg-blue-100 shrink-0 overflow-hidden relative flex items-center justify-center">
               <span className="material-symbols-outlined text-blue-600 text-[48px]">beach_access</span>
            </div>
            <div className="flex-1 w-full">
              <h4 className="font-semibold text-base text-slate-900 mb-1">{inProgressCol ? inProgressCol.title : 'Khám phá từ vựng'}</h4>
              <p className="text-xs text-slate-500 font-medium mb-4">Tiến độ học: {inProgressCol ? inProgressCol.wordCount : 0} từ</p>
              
              <div className="flex justify-end text-xs font-medium text-slate-500 mb-2">
                <span>{inProgressCol ? inProgressCol.progress : 0}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded overflow-hidden mb-5">
                <div className="h-full bg-blue-600 rounded" style={{ width: `${inProgressCol ? inProgressCol.progress : 0}%` }}></div>
              </div>
              
              <Link to={inProgressCol ? `/vocabulary/${inProgressCol.id}` : "/vocabulary"} className="btn btn-primary h-12 w-full flex items-center justify-center">
                {inProgressCol && inProgressCol.progress > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right ml-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Thống kê cá nhân */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-900 opacity-0">Thống kê</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 flex-1">
             {/* Chuỗi ngày */}
             <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-orange-500 font-medium text-xs mb-3">
                  <span className="material-symbols-outlined text-base" style={{fontVariationSettings: "'FILL' 1"}}>local_fire_department</span>
                  Chuỗi ngày
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{user?.streak || 0} <span className="text-sm font-normal text-slate-500">ngày</span></div>
                  <div className="text-xs text-slate-500 mt-1">Cố gắng lên!</div>
                </div>
             </div>
             
             {/* Mục tiêu */}
             <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-red-500 font-medium text-xs mb-3">
                  <span className="material-symbols-outlined text-base">track_changes</span>
                  Mục tiêu hôm nay
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">24 <span className="text-sm font-normal text-slate-500">/ 50 từ</span></div>
                  <div className="text-xs text-slate-500 mt-1">Còn 26 từ nữa</div>
                </div>
                <div className="h-1 w-full bg-[#E2E8F0] rounded-sm mt-3">
                  <div className="h-full bg-[#EF4444] rounded-sm" style={{ width: '48%' }}></div>
                </div>
             </div>

             {/* XP */}
             <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-green-600 font-medium text-xs mb-3">
                  <span className="material-symbols-outlined text-base" style={{fontVariationSettings: "'FILL' 1"}}>stars</span>
                  XP hiện tại
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{user?.points || 0} <span className="text-sm font-normal text-slate-500">XP</span></div>
                  <div className="text-xs text-slate-500 mt-1">Cấp độ {Math.floor((user?.points || 0) / 100) + 1}</div>
                </div>
             </div>

             {/* Thời gian */}
             <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-blue-600 font-medium text-xs mb-3">
                  <span className="material-symbols-outlined text-base">schedule</span>
                  Tổng thời gian học
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{user?.studyHours || 0} <span className="text-sm font-normal text-slate-500">giờ</span></div>
                  <div className="text-xs text-slate-500 mt-1">{user?.studyHours > 0 ? 'Tuyệt vời!' : 'Hãy bắt đầu học nhé!'}</div>
                </div>
             </div>
          </div>
        </div>

      </div>

      {/* ═══ BOTTOM GRID: VOCAB & DOCS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bộ sưu tập từ vựng */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-900">Bộ sưu tập từ vựng</h3>
            <Link to="/vocabulary" className="btn btn-secondary !px-4 !py-2 !text-xs flex items-center gap-1">
              Xem tất cả <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-[200px] bg-white rounded-2xl border border-slate-200 animate-pulse"></div>)
            ) : (
              collections.slice(0, 2).map((col, idx) => {
                const bgColors = ['bg-blue-50', 'bg-red-50', 'bg-green-50']
                const iconColors = ['text-blue-600', 'text-red-500', 'text-green-600']
                return (
                  <Link to={`/vocabulary/${col.id}`} key={col.id} className="bg-white rounded-2xl p-4 border border-slate-200 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 active:scale-[0.98] transition-all flex flex-col">
                    <div className={`w-full h-24 rounded-xl ${bgColors[idx%3]} mb-4 flex items-center justify-center`}>
                      <span className={`material-symbols-outlined text-3xl ${iconColors[idx%3]}`}>{col.icon || 'menu_book'}</span>
                    </div>
                    <h4 className="font-semibold text-sm text-slate-900 line-clamp-2 mb-1">{col.title}</h4>
                    <p className="text-xs text-slate-500 mb-4">{col.wordCount} từ</p>
                    <div className="mt-auto">
                      <div className="flex justify-end text-[10px] font-medium text-slate-500 mb-1">{col.progress}%</div>
                      <div className="h-1 w-full bg-[#E2E8F0] rounded-sm overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-sm" style={{ width: `${col.progress}%` }}></div>
                      </div>
                    </div>
                  </Link>
                )
              })
            )}

            <Link to="/vocabulary" className="btn btn-secondary flex flex-col h-[200px] sm:h-full items-center justify-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-xl">add</span>
              </div>
              <span className="text-xs font-medium">Tạo bộ sưu tập mới</span>
            </Link>
          </div>
        </div>

        {/* Tài liệu gợi ý */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-900">Tài liệu gợi ý cho bạn</h3>
            <Link to="/documents" className="btn btn-secondary !px-4 !py-2 !text-xs flex items-center gap-1">
              Xem tất cả <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 h-24 animate-pulse"></div>
              ))
            ) : recentDocs.length > 0 ? (
              recentDocs.slice(0, 3).map((doc, i) => {
                const tags = [
                  { label: 'Mới', color: 'text-green-600 bg-green-50', iconBg: 'bg-blue-900' },
                  { label: 'Hot', color: 'text-orange-500 bg-orange-50', iconBg: 'bg-orange-500' },
                  { label: 'Nổi bật', color: 'text-blue-600 bg-blue-50', iconBg: 'bg-[#22C7EB]' }
                ]
                const currentTag = tags[i % 3]
                
                return (
                  <Link to={`/documents?id=${doc.id}`} key={doc.id} className="bg-white rounded-2xl p-4 border border-slate-200 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 text-white ${currentTag.iconBg}`}>
                       <span className="material-symbols-outlined text-3xl">description</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-semibold text-sm text-slate-900 mb-1 truncate">{doc.title}</h4>
                      <p className="text-xs text-slate-500 truncate">{doc.description || 'Tài liệu hữu ích cho việc học ngoại ngữ'}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${currentTag.color} shrink-0`}>
                      {currentTag.label}
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
                <p className="text-sm text-slate-500">Chưa có tài liệu nào.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
