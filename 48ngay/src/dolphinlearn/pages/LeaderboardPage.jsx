import { useState, useEffect } from 'react'
import { useAuth } from '../../48ngay/hooks/useAuth'
import { getDlCurrentUser } from '../../48ngay/services/authService'
import { useSEO } from '../hooks/useSEO'

export default function LeaderboardPage() {
  useSEO({
    title: 'Bảng xếp hạng thi đua học tập',
    description: 'Bảng vinh danh và thi đua học tập tại DolphinLearn. Xem thành tích streak, điểm số XP tích lũy của các học viên xuất sắc nhất.',
    keywords: 'bảng xếp hạng dolphinlearn, thi đua học tập, học viên xuất sắc, tích lũy xp'
  })

  const { isDlLoggedIn } = useAuth()
  const [rankedStudents, setRankedStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/english/leaderboard`)
        if (!res.ok) throw new Error('Failed to fetch leaderboard')
        const data = await res.json()
        const rawUsers = data.data || []

        const currentUser = getDlCurrentUser()
        const currentEmail = currentUser?.email || ''

        // Map and rank users
        const ranked = rawUsers.map((item, idx) => {
          const parts = (item.name || 'Học viên').trim().split(/\s+/)
          let avatar = 'DL'
          if (parts.length >= 2) {
            avatar = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          } else if (parts.length === 1 && parts[0]) {
            avatar = parts[0].slice(0, 2).toUpperCase()
          }

          return {
            name: item.name || 'Học viên',
            avatar: avatar,
            streak: item.streak || 0,
            points: item.points || 0,
            school: item.role === 'ADMIN' ? 'Ban quản trị DolphinLearn' : 'Học viên DolphinLearn',
            isUser: item.email === currentEmail,
            rank: idx + 1
          }
        })

        setRankedStudents(ranked)
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [API_BASE])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  const top1 = rankedStudents.find(u => u.rank === 1)
  const top2 = rankedStudents.find(u => u.rank === 2)
  const top3 = rankedStudents.find(u => u.rank === 3)
  const others = rankedStudents.filter(u => u.rank > 3)

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-secondary via-ocean-50 to-surface min-h-screen py-12">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-300/10 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Title Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary font-bold text-xs uppercase tracking-wider mb-4">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            Bảng Vàng Danh Dự
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Bảng Xếp Hạng <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">DolphinLearn</span>
          </h1>
          <p className="text-sm md:text-base text-text-muted mt-3 max-w-xl mx-auto">
            Nơi tôn vinh các chiến binh có chuỗi ngày học bền bỉ (Streak) and điểm tích lũy (Points) xuất sắc nhất hệ thống!
          </p>
        </div>

        {/* Podium Display (Top 3) */}
        <div className="grid grid-cols-3 items-end gap-2 md:gap-6 mb-12 max-w-2xl mx-auto pt-6 px-2">
          {/* Rank 2 (Left) */}
          {top2 && (
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-300 flex items-center justify-center text-lg md:text-2xl font-bold text-white border-4 border-slate-200 shadow-md">
                  {top2.avatar}
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold border-2 border-white shadow">
                  2
                </div>
              </div>
              <p className="text-xs md:text-sm font-bold text-slate-700 mt-3 text-center truncate w-full">{top2.name}</p>
              {/* Podium block showing both Streak and Points */}
              <div className="w-full bg-gradient-to-t from-slate-200/90 to-slate-100/90 border border-slate-200/60 rounded-t-2xl mt-4 h-28 md:h-36 flex flex-col items-center justify-center gap-1.5 p-2 shadow-sm">
                <div className="flex items-center gap-1 text-slate-700 font-bold text-[11px] md:text-xs">
                  <span className="material-symbols-outlined text-[15px] text-accent-dark" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                  <span>{top2.streak} ngày</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 font-extrabold text-[11px] md:text-xs">
                  <span className="material-symbols-outlined text-[15px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                  <span>{top2.points} XP</span>
                </div>
              </div>
            </div>
          )}

          {/* Rank 1 (Middle - Taller) */}
          {top1 && (
            <div className="flex flex-col items-center z-10 transform -translate-y-4">
              <div className="relative group">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-amber-400 flex items-center justify-center text-xl md:text-3xl font-bold text-white border-4 border-amber-300 shadow-xl relative">
                  {top1.avatar}
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                  <span className="material-symbols-outlined text-[16px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                </div>
              </div>
              <p className="text-sm md:text-base font-extrabold text-slate-800 mt-3 text-center truncate w-full">{top1.name}</p>
              {/* Podium block showing both Streak and Points */}
              <div className="w-full bg-gradient-to-t from-amber-100/95 to-amber-50/90 border border-amber-200/60 rounded-t-2xl mt-4 h-36 md:h-48 flex flex-col items-center justify-center gap-2 p-2 shadow-md relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-amber-400" />
                <div className="flex items-center gap-1 text-amber-700 font-extrabold text-xs md:text-sm">
                  <span className="material-symbols-outlined text-[16px] text-accent-dark" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                  <span>{top1.streak} ngày</span>
                </div>
                <div className="flex items-center gap-1 text-amber-600 font-extrabold text-xs md:text-sm">
                  <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                  <span>{top1.points} XP</span>
                </div>
              </div>
            </div>
          )}

          {/* Rank 3 (Right) */}
          {top3 && (
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-orange-300 flex items-center justify-center text-lg md:text-2xl font-bold text-white border-4 border-orange-200 shadow-md">
                  {top3.avatar}
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold border-2 border-white shadow">
                  3
                </div>
              </div>
              <p className="text-xs md:text-sm font-bold text-slate-700 mt-3 text-center truncate w-full">{top3.name}</p>
              {/* Podium block showing both Streak and Points */}
              <div className="w-full bg-gradient-to-t from-orange-100/90 to-orange-50/90 border border-orange-200/60 rounded-t-2xl mt-4 h-24 md:h-32 flex flex-col items-center justify-center gap-1.5 p-2 shadow-sm">
                <div className="flex items-center gap-1 text-orange-700 font-bold text-[11px] md:text-xs">
                  <span className="material-symbols-outlined text-[15px] text-accent-dark" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                  <span>{top3.streak} ngày</span>
                </div>
                <div className="flex items-center gap-1 text-orange-600 font-extrabold text-[11px] md:text-xs">
                  <span className="material-symbols-outlined text-[15px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                  <span>{top3.points} XP</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Leaderboard list (Ranks 4-10) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-4 md:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
            <h3 className="font-display font-bold text-lg text-slate-800">Danh Sách Xếp Hạng</h3>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tất cả học viên</span>
          </div>

          <div className="space-y-3">
            {others.map((item) => {
              const isUserHighlight = item.isUser && isDlLoggedIn

              return (
                <div
                  key={item.name}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-4 ${
                    isUserHighlight
                      ? 'bg-primary/5 border-primary/20 shadow-sm scale-[1.01]'
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank indicator */}
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                      {item.rank}
                    </div>

                    {/* Avatar icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 ${
                      isUserHighlight ? 'bg-primary' : 'bg-slate-400'
                    }`}>
                      {item.avatar}
                    </div>

                    {/* Name & School */}
                    <div>
                      <p className={`font-bold text-sm ${isUserHighlight ? 'text-primary' : 'text-slate-800'}`}>
                        {item.name} {isUserHighlight && '(Tài khoản của bạn)'}
                      </p>
                      <p className="text-xs text-slate-400 font-semibold">{item.school}</p>
                    </div>
                  </div>

                  {/* Combined Value badges */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="flex items-center gap-1 font-display font-extrabold text-xs md:text-sm text-accent-dark bg-accent/10 px-3 py-1.5 rounded-xl border border-accent/10">
                      <span>{item.streak} ngày</span>
                      <span className="material-symbols-outlined text-[16px] md:text-[18px] text-accent-dark" style={{ fontVariationSettings: "'FILL' 1" }}>
                        local_fire_department
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-display font-extrabold text-xs md:text-sm text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/10">
                      <span>{item.points} XP</span>
                      <span className="material-symbols-outlined text-[16px] md:text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                        stars
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
