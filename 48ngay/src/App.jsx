import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './48ngay/components/ProtectedRoute'
import MainLayout from './48ngay/layouts/MainLayout'
import NgayDashboard from './48ngay/pages/DashboardPage'
import LessonDetailPage from './48ngay/pages/LessonDetailPage'
import CourseLoginPage from './48ngay/pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import { useAuth } from './48ngay/hooks/useAuth'

// ═══ DolphinLearn (Main Platform) ═══
import DLLayout from './dolphinlearn/layouts/DLLayout'
import HomePage from './dolphinlearn/pages/HomePage'
import DLLoginPage from './dolphinlearn/pages/LoginPage'
import RegisterPage from './dolphinlearn/pages/RegisterPage'
import DocumentsPage from './dolphinlearn/pages/DocumentsPage'
import VocabularyPage from './dolphinlearn/pages/VocabularyPage'
import VocabularyTopicsPage from './dolphinlearn/pages/VocabularyTopicsPage'
import VocabularySubtopicsPage from './dolphinlearn/pages/VocabularySubtopicsPage'
import LearnPage from './dolphinlearn/pages/LearnPage'
import LeaderboardPage from './dolphinlearn/pages/LeaderboardPage'
import DashboardPage from './dolphinlearn/pages/DashboardPage'
import ProfilePage from './dolphinlearn/pages/ProfilePage'
import DLProtectedRoute from './dolphinlearn/components/DLProtectedRoute'
import DLAdminProtectedRoute from './dolphinlearn/components/DLAdminProtectedRoute'
import AdminPage from './dolphinlearn/pages/AdminPage'
import CommunityPage from './dolphinlearn/pages/CommunityPage'
import DesignSystemPage from './dolphinlearn/pages/DesignSystemPage'
import ReviewSach from './dolphinlearn/pages/ReviewSach'

function App() {
  const { isLoggedIn, isDlLoggedIn } = useAuth()

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
    fetch(`${apiBase}/api/v1/english/visit`, { method: 'POST' })
      .catch(err => console.error('Failed to record visit:', err));
  }, []);

  return (
    <Routes>
      {/* ═══ DolphinLearn — Public Pages ═══ */}
      <Route element={<DLLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/vocabulary/:collectionId" element={<VocabularyTopicsPage />} />
        <Route path="/vocabulary/topic/:topicId" element={<VocabularySubtopicsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      {/* DolphinLearn Web Auth Routes */}
      <Route
        path="/login"
        element={isDlLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/?auth=login" replace />}
      />
      <Route
        path="/register"
        element={isDlLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/?auth=register" replace />}
      />

      {/* ═══ DolphinLearn — Protected Pages ═══ */}
      <Route element={<DLProtectedRoute />}>
        <Route element={<DLLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/vocabulary/subtopic/:id/learn" element={<LearnPage />} />
          <Route path="/vocabulary/sub/:id/learn" element={<LearnPage />} />
        </Route>
      </Route>

      {/* ═══ DolphinLearn — Admin Protected Pages ═══ */}
      <Route element={<DLAdminProtectedRoute />}>
        <Route element={<DLLayout />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>

      {/* ═══ 48 Ngày Module (sub-feature, protected by original ProtectedRoute) ═══ */}
      <Route element={<MainLayout />}>
        <Route
          path="/48ngay/login"
          element={isLoggedIn ? <Navigate to="/48ngay" replace /> : <CourseLoginPage />}
        />
        <Route element={<ProtectedRoute />}>
          <Route path="/48ngay" element={<NgayDashboard />} />
          <Route path="/48ngay/lesson/:day" element={<LessonDetailPage />} />
        </Route>
      </Route>

      <Route path="/review-sach" element={<ReviewSach />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
