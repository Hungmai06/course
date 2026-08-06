import { useState, useEffect } from 'react'
import { useAuth } from '../../48ngay/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { getDlCurrentUser } from '../../48ngay/services/authService'
import { useSEO } from '../hooks/useSEO'

export default function ProfilePage() {
  useSEO({
    title: 'Trang cá nhân học tập',
    description: 'Thông tin cá nhân, cài đặt tài khoản, thống kê điểm tích lũy XP, lịch sử streak ngày liên tục của bạn tại DolphinLearn.',
    keywords: 'hồ sơ dolphinlearn, trang cá nhân, thông tin học viên, chuỗi học streak'
  })

  const { dlLogout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [learnedCount, setLearnedCount] = useState(0)
  const [rank, setRank] = useState(0)
  const [leaderboardPreview, setLeaderboardPreview] = useState([])
  const [loading, setLoading] = useState(true)

  const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const user = getDlCurrentUser()
        const email = user?.email || ''
        if (!email) return

        // 1. Fetch user profile from DLUsers
        const usersRes = await fetch(`${API_BASE}/api/v1/english/users`)
        if (!usersRes.ok) throw new Error('Failed to fetch users')
        const usersData = await usersRes.json()
        const usersList = usersData.data || []
        const currentProfile = usersList.find(u => u.email === email)
        setProfile(currentProfile)

        // 2. Fetch progress to calculate total learned words
        const progressRes = await fetch(`${API_BASE}/api/v1/english/vocabulary/progress?username=${encodeURIComponent(email)}`)
        if (progressRes.ok) {
          const progressData = await progressRes.json()
          const progressList = progressData.data || []
          const totalLearned = progressList.reduce((acc, p) => {
            const ids = p.learnedWordIds ? p.learnedWordIds.split(',').filter(Boolean) : []
            return acc + ids.length
          }, 0)
          setLearnedCount(totalLearned)
        }

        // 3. Fetch leaderboard to get rank & preview
        const leaderboardRes = await fetch(`${API_BASE}/api/v1/english/leaderboard`)
        if (leaderboardRes.ok) {
          const lbData = await leaderboardRes.json()
          const lbList = lbData.data || []
          
          // Find rank
          const userIdx = lbList.findIndex(u => u.email === email)
          setRank(userIdx !== -1 ? userIdx + 1 : lbList.length + 1)

          // Leaderboard preview
          const preview = lbList.slice(0, 5).map((u, i) => ({
            rank: i + 1,
            name: u.name || 'Học viên',
            score: u.points || 0,
            isUser: u.email === email
          }))
          setLeaderboardPreview(preview)
        }
      } catch (error) {
        console.error('Error loading profile data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [API_BASE])

  const handleLogout = () => {
    dlLogout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  const name = profile?.name || getDlCurrentUser()?.email?.split('@')[0] || 'Người dùng'
  const emailStr = profile?.email || getDlCurrentUser()?.email || 'email@example.com'
  const points = profile?.points || 0
  const streak = profile?.streak || 0

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-border p-8 flex flex-col sm:flex-row items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
        </div>
        <div className="text-center sm:text-left flex-1">
          <h1 className="font-display text-2xl font-bold mb-1">{name}</h1>
          <p className="text-sm text-text-muted mb-3">{emailStr}</p>
          <div className="flex gap-2 justify-center sm:justify-start">
            <span className="px-3 py-1 bg-accent/15 text-accent-dark text-xs font-semibold rounded-full">🔥 Chuỗi {streak} ngày</span>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">{learnedCount} từ đã học</span>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-3d btn-3d-pink flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">logout</span>Đăng xuất
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: 'stars', value: `${points} XP`, label: 'Tổng điểm tích lũy' },
          { icon: 'task_alt', value: `${learnedCount}`, label: 'Từ vựng đã học' },
          { icon: 'leaderboard', value: rank > 0 ? `#${rank}` : '--', label: 'Thứ hạng hiện tại' },
          { icon: 'description', value: streak > 0 ? `${streak}d` : '0d', label: 'Chuỗi liên tiếp' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-5 text-center">
            <span className="material-symbols-outlined text-primary text-[28px] mb-2 block">{s.icon}</span>
            <div className="font-display text-xl font-bold text-slate-800">{s.value}</div>
            <div className="text-xs text-text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Streak calendar */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-8">
        <h2 className="font-display font-bold mb-4 text-slate-800">Chuỗi học tập tuần này</h2>
        <div className="flex gap-3 justify-between">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i < 5 ? 'bg-primary text-white' : 'bg-surface text-text-muted border border-border'}`}>
                {i < 5 ? <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span> : <span className="text-xs font-bold">{day}</span>}
              </div>
              <span className="text-xs font-medium text-text-muted">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard preview */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-display font-bold mb-4 text-slate-800">Bảng xếp hạng</h2>
        <div className="space-y-1">
          {leaderboardPreview.map((u, i) => (
            <div key={i} className={`flex items-center gap-4 px-4 py-3 rounded-xl ${u.isUser ? 'bg-primary/5' : 'hover:bg-surface'} transition-colors`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white' : i === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500 text-white' : i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' : 'bg-surface text-text-muted'}`}>
                {u.rank}
              </div>
              <span className="flex-1 text-sm font-semibold text-slate-700">
                {u.name} {u.isUser && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-1">Bạn</span>}
              </span>
              <span className="text-sm font-bold text-primary">{u.score} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
