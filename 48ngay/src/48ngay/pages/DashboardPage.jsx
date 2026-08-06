import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DayCard from '../components/DayCard'
import ProgressBar from '../components/ProgressBar'
import {
  calculateProgress,
  getCourseDays,
  getProgress,
  LESSON_STATUS,
} from '../services/courseService'

function DashboardPage() {
  const [days, setDays] = useState([])
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedDays, fetchedProgress] = await Promise.all([
          getCourseDays(),
          getProgress(),
        ])
        setDays(fetchedDays)
        setProgress(fetchedProgress)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const progressSummary = calculateProgress(progress, days.length || 48)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-secondary via-ocean-50 to-surface min-h-screen py-10">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-300/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Back Link to DolphinLearn Homepage */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Quay lại DolphinLearn
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">48 Ngày Lấy Gốc Tiếng Anh</h1>
          <p className="text-text-muted">Chương trình học tiếng Anh 48 ngày từ cơ bản đến nâng cao</p>
        </div>

        <div className="bg-white rounded-3xl border border-border p-6 md:p-8 shadow-sm">
          <ProgressBar
            completed={progressSummary.completed}
            total={progressSummary.total}
            percentage={progressSummary.percentage}
          />

          <div className="day-grid mt-8">
            {days.map((item) => (
              <DayCard
                key={item.day}
                day={item.day}
                title={item.title}
                status={progress[item.day] ?? LESSON_STATUS.NOT_STARTED}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
