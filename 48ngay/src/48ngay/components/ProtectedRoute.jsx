import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''
const KEYWORD = 'Khóa Học 48 Ngày Lấy Gốc Tiếng Anh Toàn Diện Cùng Cô Mai Phương (VIP)'

function ProtectedRoute() {
  const { isLoggedIn, user } = useAuth()
  const location = useLocation()
  const [isAllowed, setIsAllowed] = useState(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!isLoggedIn || !user?.email) {
      setIsAllowed(false)
      return
    }

    const sessionKey = `english48.allowed.${user.email}`
    const cachedAllowed = sessionStorage.getItem(sessionKey)

    if (cachedAllowed === 'true') {
      setIsAllowed(true)
      return
    } else if (cachedAllowed === 'false') {
      setIsAllowed(false)
      return
    }

    async function checkAccess() {
      setChecking(true)
      try {
        const url = `${API_BASE}/api/v1/english/check-english-48-ngay?email=${encodeURIComponent(user.email.trim().toLowerCase())}&keyword=${encodeURIComponent(KEYWORD)}`
        const response = await fetch(url)
        if (response.ok) {
          const allowed = await response.json()
          sessionStorage.setItem(sessionKey, allowed ? 'true' : 'false')
          setIsAllowed(allowed)
        } else {
          setIsAllowed(false)
        }
      } catch (err) {
        console.error('Error checking 48ngay access:', err)
        setIsAllowed(false)
      } finally {
        setChecking(false)
      }
    }

    checkAccess()
  }, [isLoggedIn, user?.email])

  if (!isLoggedIn) {
    return <Navigate to="/48ngay/login" replace state={{ from: location }} />
  }

  if (checking || isAllowed === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!isAllowed) {
    return <Navigate to="/48ngay/login" replace state={{ from: location, error: 'Email này chưa có trong danh sách học viên khóa 48 ngày.' }} />
  }

  return <Outlet />
}

export default ProtectedRoute
