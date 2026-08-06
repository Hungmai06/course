import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../48ngay/hooks/useAuth'
import { useSEO } from '../hooks/useSEO'

export default function DashboardPage() {
  useSEO({
    title: 'Bảng điều khiển học tập',
    description: 'Quản lý lộ trình học tập ngoại ngữ của bạn tại DolphinLearn. Xem chuỗi học streak, thống kê từ vựng đã học và theo dõi thứ hạng thi đua.',
    keywords: 'bảng điều khiển dolphinlearn, lộ trình học tập, quản lý streak, thống kê học tập'
  })

  const { dlUser } = useAuth()
  const [leaderboardTab, setLeaderboardTab] = useState('streak') // 'streak' or 'points'
  const [leaderboardUsers, setLeaderboardUsers] = useState([])
  const [totalLearnedWords, setTotalLearnedWords] = useState(0)
  const [learnedWordsList, setLearnedWordsList] = useState([])
  const [showAllLearned, setShowAllLearned] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

  // Fetch real leaderboard and user progress with vocabulary detail mapping
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/english/leaderboard`)
        if (res.ok) {
          const result = await res.json()
          setLeaderboardUsers(result.data || [])
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
      }
    }

    async function fetchAllWordsAndProgress() {
      if (!dlUser?.email) return
      try {
        // Fetch collections to get word metadata
        const colRes = await fetch(`${API_BASE}/api/v1/english/vocabulary/collections`)
        let wordMap = {}
        if (colRes.ok) {
          const colData = await colRes.json()
          const collections = colData.data || []
          collections.forEach(col => {
            const subs = col.subCollections || []
            subs.forEach(sub => {
              const wordsList = sub.words || []
              wordsList.forEach(w => {
                wordMap[w.id] = {
                  word: w.word,
                  meaning: w.meaning,
                  pronunciation: w.pronunciation,
                  subTitle: sub.title
                }
              })
            })
          })
        }

        // Fetch user progress
        const res = await fetch(`${API_BASE}/api/v1/english/vocabulary/progress?username=${encodeURIComponent(dlUser.email)}`)
        if (res.ok) {
          const result = await res.json()
          const progressList = result.data || []
          let learnedIds = []
          progressList.forEach(prog => {
            if (prog.learnedWordIds) {
              const ids = prog.learnedWordIds.split(',').filter(id => id.trim() !== '').map(Number)
              learnedIds = [...learnedIds, ...ids]
            }
          })
          
          // Filter duplicates
          learnedIds = Array.from(new Set(learnedIds))
          setTotalLearnedWords(learnedIds.length)

          // Map to details
          const list = learnedIds.map(id => ({
            id,
            ...wordMap[id]
          })).filter(w => w.word)
          setLearnedWordsList(list)
        }
      } catch (err) {
        console.error('Error fetching dashboard progress:', err)
      }
    }

    fetchLeaderboard()
    fetchAllWordsAndProgress()
  }, [dlUser?.email, API_BASE])

  // Compute leaderboard with rank
  const sortedLeaderboard = useMemo(() => {
    const sorted = [...leaderboardUsers].sort((a, b) => {
      if (leaderboardTab === 'streak') {
        return (b.streak || 0) - (a.streak || 0)
      } else {
        return (b.points || 0) - (a.points || 0)
      }
    })
    return sorted.map((u, idx) => ({
      rank: idx + 1,
      name: u.name || u.email.split('@')[0],
      avatar: (u.name || u.email).substring(0, 2).toUpperCase(),
      streak: u.streak || 0,
      points: u.points || 0,
      isUser: u.email === dlUser?.email,
      email: u.email
    }))
  }, [leaderboardUsers, leaderboardTab, dlUser?.email])

  const currentUserRank = useMemo(() => {
    const found = sortedLeaderboard.find(item => item.isUser)
    return found ? found.rank : '-'
  }, [sortedLeaderboard])

  const stats = [
    { icon: 'local_fire_department', label: 'Chuỗi học', value: `${dlUser?.streak || 0} ngày`, color: 'text-accent-dark', bg: 'bg-accent/15' },
    { icon: 'translate', label: 'Từ đã học', value: `${totalLearnedWords} từ`, color: 'text-primary', bg: 'bg-primary/10' },
    { icon: 'stars', label: 'Điểm tích lũy', value: `${dlUser?.points || 0} XP`, color: 'text-ocean-500', bg: 'bg-ocean-100' },
    { icon: 'emoji_events', label: 'Hạng của bạn', value: `#${currentUserRank}`, color: 'text-success', bg: 'bg-success/10' },
  ]

  const activities = [
    { icon: 'check_circle', text: 'Ôn tập bộ từ vựng', time: 'Vừa xong', color: 'text-success' },
    { icon: 'stars', text: 'Tích lũy thêm điểm học tập', time: 'Vừa xong', color: 'text-ocean-500' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Welcome */}
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold mb-1">
          Xin chào, <span className="text-primary">{dlUser?.name || dlUser?.email?.split('@')[0] || 'học viên'}</span>! 👋
        </h1>
        <p className="text-text-muted">Tiếp tục hành trình học tập của bạn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4 dl-card-hover">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <div>
              <div className="font-display text-lg md:text-xl font-extrabold text-slate-800">{s.value}</div>
              <div className="text-xs text-text-muted font-bold mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section - Quick actions */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="font-display text-xl font-bold mb-4 text-slate-850">Lộ trình học tập</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/vocabulary" className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-6 text-white dl-card-hover shadow-sm flex flex-col justify-between min-h-[220px]">
                <div>
                  <span className="material-symbols-outlined text-[28px] mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                  <h3 className="font-display font-extrabold text-lg mb-1">Kho Từ Vựng</h3>
                  <p className="text-xs text-white/85 mb-4 leading-relaxed">Học từ vựng theo chủ đề, ôn tập bằng thẻ flashcards ghi nhớ nhanh, làm trắc nghiệm và thử thách chính tả.</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold bg-white/10 w-fit px-3 py-1.5 rounded-full">
                  Bắt đầu học ngay <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </Link>

              <div className="bg-white rounded-3xl border border-border p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[22px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>translate</span>
                    <h3 className="font-display font-extrabold text-slate-850 text-base">Từ đã học ({learnedWordsList.length})</h3>
                  </div>
                  {learnedWordsList.length > 3 && (
                    <button 
                      onClick={() => setShowAllLearned(!showAllLearned)} 
                      className="text-[10px] font-extrabold text-primary hover:underline cursor-pointer bg-primary/5 px-2 py-1 rounded-md"
                    >
                      {showAllLearned ? 'Thu gọn' : 'Xem tất cả'}
                    </button>
                  )}
                </div>

                {learnedWordsList.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-text-muted py-6">
                    <span className="material-symbols-outlined text-3xl mb-1.5 text-slate-300">school</span>
                    <p className="text-xs font-semibold">Chưa có từ vựng nào được học.</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto max-h-[140px] pr-1 space-y-2.5">
                    {(showAllLearned ? learnedWordsList : learnedWordsList.slice(0, 3)).map(w => (
                      <div key={w.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-850 text-xs md:text-sm">{w.word}</span>
                            <span className="text-[10px] text-text-muted font-medium">({w.pronunciation})</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{w.meaning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity */}
          <div>
            <h2 className="font-display text-xl font-bold mb-4 text-slate-850">Hoạt động gần đây</h2>
            <div className="bg-white rounded-3xl border border-border divide-y divide-border overflow-hidden shadow-sm">
              {activities.map((a, i) => (
                <div key={i} className="p-4 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                  <span className={`material-symbols-outlined text-[20px] mt-0.5 ${a.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{a.text}</p>
                    <span className="text-xs text-text-muted">{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section - Leaderboard */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                <h2 className="font-display text-lg font-extrabold text-slate-800">Bảng xếp hạng</h2>
              </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => setLeaderboardTab('streak')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  leaderboardTab === 'streak' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
                Chuỗi học
              </button>
              <button
                type="button"
                onClick={() => setLeaderboardTab('points')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  leaderboardTab === 'points' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">stars</span>
                Điểm tích lũy
              </button>
            </div>

            {/* Leaderboard List */}
            <div className="space-y-3">
              {sortedLeaderboard.slice(0, 10).map((item) => {
                const rankColor =
                  item.rank === 1
                    ? 'bg-amber-100 text-amber-600'
                    : item.rank === 2
                    ? 'bg-slate-150 text-slate-600'
                    : item.rank === 3
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-slate-50 text-slate-400'

                return (
                  <div
                    key={item.email}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      item.isUser
                        ? 'bg-primary/5 border-primary/20 shadow-sm'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank Indicator */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${rankColor}`}>
                        {item.rank === 1 ? (
                          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                        ) : (
                          item.rank
                        )}
                      </div>

                      {/* Avatar initials */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase ${
                        item.isUser ? 'bg-primary' : 'bg-slate-400'
                      }`}>
                        {item.avatar}
                      </div>

                      {/* Username */}
                      <div>
                        <p className={`text-xs font-bold truncate max-w-[120px] ${item.isUser ? 'text-primary' : 'text-slate-700'}`}>
                          {item.name} {item.isUser && '(Bạn)'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold">Hạng #{item.rank}</p>
                      </div>
                    </div>

                    {/* Stats value */}
                    <div className="text-right">
                      {leaderboardTab === 'streak' ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-accent-dark">
                          {item.streak} <span className="material-symbols-outlined text-[16px] text-accent-dark">local_fire_department</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-primary">
                          {item.points} <span className="text-[9px] font-semibold text-primary/70">XP</span>
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
