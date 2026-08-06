import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function CourseHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/48ngay/login', { replace: true })
  }

  return (
    <header className="course-header">
      <div>
        <p className="header-brand">48 Ngày Lấy Gốc Tiếng Anh</p>
        <p className="header-name">Xin chào, {user?.name ?? 'Học viên'}</p>
      </div>
      <button type="button" className="btn btn-secondary" onClick={handleLogout}>
        Logout
      </button>
    </header>
  )
}

export default CourseHeader
