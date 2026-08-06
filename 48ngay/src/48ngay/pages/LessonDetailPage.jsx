import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ResourceFrame from '../components/ResourceFrame'
import Tabs from '../components/Tabs'
import VocabularyModule from '../components/VocabularyModule'
import { ensureDayInProgress, getLessonByDay } from '../services/courseService'

const tabs = [
  { value: 'video', label: 'Video' },
  { value: 'documents', label: 'Tài liệu' },
  { value: 'exercises', label: 'Bài tập' },
  { value: 'answers', label: 'Đáp án' },
  { value: 'vocab', label: 'Từ vựng' },
]

function LessonDetailPage() {
  const { day } = useParams()
  const [activeTab, setActiveTab] = useState('video')
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLesson() {
      setLoading(true)
      try {
        const fetchedLesson = await getLessonByDay(day)
        setLesson(fetchedLesson)
        await ensureDayInProgress(day)
      } catch (error) {
        console.error('Failed to load lesson:', error)
      } finally {
        setLoading(false)
      }
    }
    loadLesson()
  }, [day])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-b from-secondary via-ocean-50 to-surface min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center py-20">
          <span className="material-symbols-outlined text-6xl text-border mb-4 block">error_outline</span>
          <p className="text-text-muted mb-6">Không tìm thấy bài học hoặc có lỗi xảy ra.</p>
          <Link to="/48ngay" className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition-all">
            Quay về danh sách
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-secondary via-ocean-50 to-surface min-h-screen py-10">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-300/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="mb-6">
          <Link to="/48ngay" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-full mb-4">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Quay về danh sách
          </Link>
          <h1 className="font-display text-3xl font-bold mb-2">
            Ngày {lesson.day}: {lesson.title}
          </h1>
          <p className="text-text-muted">{lesson.description}</p>
        </div>

        <div className="bg-white rounded-3xl border border-border p-6 md:p-8 shadow-sm">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          <div className="tab-content mt-6">
            {activeTab === 'video' && (
              <ResourceFrame title="Video bài học" link={lesson.resources.video} />
            )}

            {activeTab === 'documents' && (
              <ResourceFrame title="Tài liệu PDF" link={lesson.resources.documents} />
            )}

            {activeTab === 'exercises' && (
              <ResourceFrame title="Bài tập" link={lesson.resources.exercises} />
            )}

            {activeTab === 'answers' && (
              <ResourceFrame title="Đáp án" link={lesson.resources.answers} />
            )}

            {activeTab === 'vocab' && (
              <VocabularyModule day={lesson.day} words={lesson.vocabularies} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LessonDetailPage
